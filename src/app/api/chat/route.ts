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

    const conversation: ChatCompletionMessageParam[] = buildMessages(profile, payload.history, payload.message);
    const openai = getOpenAIClient();

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
  history: z.infer<typeof messageSchema>[],
  latestMessage: string,
): ChatCompletionMessageParam[] {
  const summary = `Nama: ${profile.nickname}. Mood baseline: ${profile.mood_baseline}. Fokus: ${
    profile.focus_areas?.join(", ") || "-"
  }. MBTI: ${profile.mbti_type ?? "-"}. Enneagram: ${profile.enneagram_type ?? "-"}. Archetype: ${
    profile.primary_archetype ?? "-"
  }. Catatan: ${profile.personality_notes ?? "-"}.`;

  const systemPrompt = `Kamu adalah Mirror, sahabat curhat AI yang empatik dan suportif. Gunakan bahasa Indonesia yang hangat, singkat namun bermakna. Selalu hubungkan respon ke konteks berikut: ${summary}. Kamu boleh menawarkan latihan sederhana (breathing, journaling) namun jangan memberi diagnosa klinis.`;

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
