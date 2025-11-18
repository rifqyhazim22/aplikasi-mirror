import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

function suggestionFromMbti(mbti?: string | null) {
  if (!mbti) return "Luangkan 5 menit untuk deep breathing sebelum lanjut demo.";
  const upper = mbti.toUpperCase();
  if (upper.startsWith("IN")) {
    return "Cocokkan sesi Mirror dengan ritual journaling hening + napas 4-7-8.";
  }
  if (upper.startsWith("EN")) {
    return "Ajak pengguna ngobrol ringan 1 menit lalu tawarkan breathing box.";
  }
  if (upper.startsWith("IS")) {
    return "Tawarkan grounding exercise sambil menatap cermin 30 detik.";
  }
  return "Gunakan teknik CBT singkat: identifikasi pikiran, tantang, ganti afirmasi lembut.";
}

export async function GET() {
  const supabase = getSupabaseClient();
  const [{ data: quizData, error: quizError }, { data: moodData, error: moodError }] = await Promise.all([
    supabase
      .from("personality_quiz")
      .select("nickname,mbti_result,enneagram_result,focus_note,created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("mood_entry")
      .select("mood,created_at")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100),
  ]);

  if (quizError) {
    console.error(quizError);
    return NextResponse.json({ message: "Tidak bisa membaca quiz" }, { status: 500 });
  }

  if (moodError) {
    console.error(moodError);
    return NextResponse.json({ message: "Tidak bisa membaca mood" }, { status: 500 });
  }

  const moodCounts = new Map<string, number>();
  for (const row of moodData ?? []) {
    if (!row.mood) continue;
    const key = row.mood.toLowerCase();
    moodCounts.set(key, (moodCounts.get(key) ?? 0) + 1);
  }

  let dominantMood: string | null = null;
  let dominantCount = 0;
  for (const [mood, count] of moodCounts.entries()) {
    if (count > dominantCount) {
      dominantMood = mood;
      dominantCount = count;
    }
  }

  const response = {
    nickname: quizData?.nickname ?? "Mirror Friend",
    mbti: quizData?.mbti_result ?? "INFP",
    enneagram: quizData?.enneagram_result ?? "Empath",
    focusNote: quizData?.focus_note ?? "Eksplorasi pola pikir yang muncul saat bercermin",
    dominantMood,
    entriesAnalyzed: moodData?.length ?? 0,
    suggestion: suggestionFromMbti(quizData?.mbti_result),
  };

  return NextResponse.json(response);
}
