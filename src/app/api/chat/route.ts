import { NextResponse } from "next/server";
import { z } from "zod";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { getSupabaseClient } from "@/lib/supabase";
import { getOpenAIClient } from "@/lib/openai";
import type { Database } from "@/lib/database.types";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const requestSchema = z.object({
  profileId: z.string().uuid(),
  message: z.string().min(2).max(600),
  history: z.array(messageSchema).max(12).default([]),
});

type ProfileRow = Database["public"]["Tables"]["profile"]["Row"];
type ConversationInsert = Database["public"]["Tables"]["conversation_log"]["Insert"];
type MoodSnapshot = {
  mood: Database["public"]["Tables"]["mood_entry"]["Row"]["mood"];
  note: Database["public"]["Tables"]["mood_entry"]["Row"]["note"];
  source: Database["public"]["Tables"]["mood_entry"]["Row"]["source"];
  created_at: Database["public"]["Tables"]["mood_entry"]["Row"]["created_at"];
};
type CameraSnapshot = {
  emotion: Database["public"]["Tables"]["camera_emotion_log"]["Row"]["emotion"];
  confidence: Database["public"]["Tables"]["camera_emotion_log"]["Row"]["confidence"];
  created_at: Database["public"]["Tables"]["camera_emotion_log"]["Row"]["created_at"];
};

const responderModel = process.env.OPENAI_RESPONDER_MODEL ?? "gpt-4o-mini";

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const supabase = getSupabaseClient();
    const { data: profile, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", payload.profileId)
      .maybeSingle();

    if (error || !profile) {
      console.error(error);
      return NextResponse.json({ message: "Profil tidak ditemukan" }, { status: 404 });
    }

    const [{ data: moodSnapshot }, { data: cameraSnapshot }] = await Promise.all([
      supabase
        .from("mood_entry")
        .select("mood,note,source,created_at")
        .eq("profile_id", payload.profileId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("camera_emotion_log")
        .select("emotion,confidence,created_at")
        .eq("profile_id", payload.profileId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const trimmedHistory = payload.history.slice(-6);

    const conversation: ChatCompletionMessageParam[] = buildMessages(
      profile,
      (moodSnapshot as MoodSnapshot | null) ?? null,
      (cameraSnapshot as CameraSnapshot | null) ?? null,
      trimmedHistory,
      payload.message,
      profile.conversation_summary,
    );
    const openai = getOpenAIClient();

    const userLog: ConversationInsert = {
      profile_id: profile.id,
      role: "user",
      content: payload.message,
    };

    const { error: logUserError } = await supabase.from("conversation_log").insert([userLog]);

    if (logUserError) {
      console.error("Gagal menyimpan log user", logUserError);
    }

    const completion = await openai.chat.completions.create({
      model: responderModel,
      messages: conversation,
      temperature: 0.8,
      max_tokens: 400,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        { message: "Mirror belum bisa menjawab. Coba ulang." },
        { status: 502 },
      );
    }

    const assistantLog: ConversationInsert = {
      profile_id: profile.id,
      role: "assistant",
      content: reply,
    };

    const { error: logAssistantError } = await supabase
      .from("conversation_log")
      .insert([assistantLog]);

    if (logAssistantError) {
      console.error("Gagal menyimpan log assistant", logAssistantError);
    }

    const updatedSummary = updateConversationSummary(
      profile.conversation_summary,
      payload.message,
      reply,
    );

    await supabase
      .from("profile")
      .update({ conversation_summary: updatedSummary })
      .eq("id", profile.id);

    return NextResponse.json({
      reply,
      usage: completion.usage,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ message: "Mirror lagi sibuk" }, { status: 500 });
  }
}

function buildMessages(
  profile: ProfileRow,
  latestMood: MoodSnapshot | null,
  cameraReading: CameraSnapshot | null,
  history: z.infer<typeof messageSchema>[],
  latestMessage: string,
  conversationSummary: string | null,
): ChatCompletionMessageParam[] {
  const profileSynopsis = `Nama: ${profile.nickname}. Mood baseline: ${profile.mood_baseline}. Fokus: ${
    profile.focus_areas?.join(", ") || "-"
  }. MBTI: ${profile.mbti_type ?? "-"}. Enneagram: ${profile.enneagram_type ?? "-"}. Archetype: ${
    profile.primary_archetype ?? "-"
  }. Catatan: ${profile.personality_notes ?? "-"}.`;

  const moodNote = latestMood?.note ? `dengan catatan ${latestMood.note} ` : "";
  const moodLine = latestMood
    ? `Mood entry terakhir (${latestMood.source ?? "demo"}) adalah "${latestMood.mood}" ${moodNote}pada ${new Date(
        latestMood.created_at,
      ).toLocaleString("id-ID")}.`
    : "Belum ada mood entry eksplisit untuk profil ini.";

  const cameraLine = cameraReading
    ? `Pembacaan computer vision terbaru mendeteksi ${cameraReading.emotion} dengan keyakinan ${
        cameraReading.confidence ?? 0
      }% pada ${new Date(cameraReading.created_at).toLocaleTimeString("id-ID")}.`
    : "Belum ada pembacaan computer vision terbaru (kamera mungkin dimatikan).";

  const systemPrompt = [
    "Kamu adalah Mirror, sahabat curhat AI yang empatik dan suportif.",
    "Gunakan bahasa Indonesia yang hangat, singkat namun bermakna.",
    `Selalu hubungkan respon ke konteks berikut: ${profileSynopsis}`,
    `Data mood: ${moodLine}`,
    `Data computer vision: ${cameraLine}`,
    `Ringkasan chat sebelumnya: ${
      conversationSummary && conversationSummary.length > 0
        ? conversationSummary
        : "belum ada ringkasan"
    }`,
    "Gunakan informasi ini untuk mempersonalisasi respon dan validasi emosi pengguna.",
    "Kamu boleh menawarkan latihan sederhana (breathing, journaling) namun jangan memberi diagnosa klinis.",
  ].join(" ");

  const normalizedHistory: ChatCompletionMessageParam[] = history.map((item) => ({
    role: item.role,
    content: item.content,
  }));

  return [
    { role: "system", content: systemPrompt },
    ...normalizedHistory,
    { role: "user", content: latestMessage },
  ];
}

function updateConversationSummary(
  previous: string | null,
  userMessage: string,
  assistantMessage: string,
) {
  const sanitize = (text: string) => text.replace(/\s+/g, " ").trim();
  const entry = `• U: ${sanitize(userMessage).slice(0, 140)} | M: ${sanitize(assistantMessage).slice(
    0,
    140,
  )}`;
  const existing = previous ? previous.split("\n").filter(Boolean) : [];
  existing.push(entry);
  const trimmed = existing.slice(-8);
  return trimmed.join("\n");
}
