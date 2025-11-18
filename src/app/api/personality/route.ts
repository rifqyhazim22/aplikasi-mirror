import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

const quizSchema = z.object({
  nickname: z.string().min(2).max(40),
  mbtiResult: z.string().min(2).max(4),
  enneagramResult: z.string().min(1).max(10),
  focusNote: z.string().min(3).max(160),
});

type QuizInsert = Database["public"]["Tables"]["personality_quiz"]["Insert"];

export async function POST(request: Request) {
  try {
    const payload = quizSchema.parse(await request.json());
    const supabase = getSupabaseClient();
    const insertData: QuizInsert = {
      nickname: payload.nickname,
      mbti_result: payload.mbtiResult.toUpperCase(),
      enneagram_result: payload.enneagramResult,
      focus_note: payload.focusNote,
    };

    const { data, error } = await supabase
      .from("personality_quiz")
      .insert([insertData])
      .select()
      .single();

    if (error || !data) {
      throw error ?? new Error("Gagal menyimpan kuis");
    }

    return NextResponse.json({
      id: data.id,
      nickname: data.nickname,
      mbtiResult: data.mbti_result,
      enneagramResult: data.enneagram_result,
      focusNote: data.focus_note,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Jawaban tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ message: "Mirror gagal mencatat kuis" }, { status: 500 });
  }
}

export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("personality_quiz")
    .select("id,nickname,mbti_result,enneagram_result,focus_note,created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
    return NextResponse.json({ message: "Tidak bisa memuat kuis" }, { status: 500 });
  }

  return NextResponse.json(
    (data ?? []).map((row) => ({
      id: row.id,
      nickname: row.nickname,
      mbtiResult: row.mbti_result,
      enneagramResult: row.enneagram_result,
      focusNote: row.focus_note,
      createdAt: row.created_at,
    })),
  );
}
