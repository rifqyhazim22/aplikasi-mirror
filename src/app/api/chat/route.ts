import { NextResponse } from "next/server";
import { z } from "zod";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { getSupabaseClient } from "@/lib/supabase";
import { getOpenAIClient } from "@/lib/openai";
import type { Database } from "@/lib/database.types";
import type { SensorMetrics } from "@/types/vision";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const metricsSchema = z.object({
  valence: z.number().min(-1).max(1),
  energy: z.number().min(0).max(1),
  tension: z.number().min(0).max(1),
  focus: z.number().min(0).max(1),
  tilt: z.number().nullable().optional(),
  cues: z.array(z.string()).optional(),
});

const visionSignalSchema = z.object({
  emotion: z.string().min(3).max(24),
  confidence: z.number().min(0).max(100),
  timestamp: z.number(),
  metrics: metricsSchema,
});

const requestSchema = z.object({
  profileId: z.string().uuid(),
  message: z.string().min(2).max(600),
  history: z.array(messageSchema).max(12).default([]),
  visionSignal: visionSignalSchema.optional(),
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
  metadata: Database["public"]["Tables"]["camera_emotion_log"]["Row"]["metadata"];
  created_at: Database["public"]["Tables"]["camera_emotion_log"]["Row"]["created_at"];
};
type VisionSignalPayload = z.infer<typeof visionSignalSchema>;

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
        .select("emotion,confidence,metadata,created_at")
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
      payload.visionSignal ?? null,
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
  liveVision: VisionSignalPayload | null,
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

  const cameraLine = (() => {
    if (liveVision) {
      return formatVisionLine({
        label: "Sinyal realtime",
        emotion: liveVision.emotion,
        confidence: liveVision.confidence,
        moment: new Date(liveVision.timestamp).toLocaleTimeString("id-ID"),
        metrics: liveVision.metrics,
      });
    }
    if (cameraReading) {
      const metadata = (cameraReading.metadata as Partial<SensorMetrics> | null) ?? null;
      return formatVisionLine({
        label: "Log kamera terakhir",
        emotion: cameraReading.emotion,
        confidence: cameraReading.confidence ?? 0,
        moment: new Date(cameraReading.created_at).toLocaleTimeString("id-ID"),
        metrics: metadata ?? undefined,
      });
    }
    return "Belum ada pembacaan computer vision terbaru (kamera mungkin dimatikan).";
  })();

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

function formatVisionLine({
  label,
  emotion,
  confidence,
  moment,
  metrics,
}: {
  label: string;
  emotion: string;
  confidence: number;
  moment: string;
  metrics?: Partial<SensorMetrics> | null;
}): string {
  const base = `${label} mendeteksi ${emotion} (${Math.round(confidence)}% yakin) pada ${moment}.`;
  if (!metrics) return base;
  const parts: string[] = [];
  if (typeof metrics.valence === "number") {
    parts.push(`valence ${Math.round(((metrics.valence + 1) / 2) * 100)}%`);
  }
  if (typeof metrics.energy === "number") {
    parts.push(`energi ${Math.round(metrics.energy * 100)}%`);
  }
  if (typeof metrics.tension === "number") {
    parts.push(`ketegangan ${Math.round(metrics.tension * 100)}%`);
  }
  if (metrics.cues && metrics.cues.length > 0) {
    parts.push(`cues: ${metrics.cues.slice(0, 2).join("; ")}`);
  }
  return `${base} ${parts.join(" • ")}`.trim();
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
