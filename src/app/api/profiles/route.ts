import { NextResponse } from "next/server";
import { z } from "zod";
import type { Database } from "@/lib/database.types";
import { getSupabaseClient } from "@/lib/supabase";

const profileSchema = z.object({
  nickname: z.string().trim().min(2),
  focusAreas: z.array(z.string()).min(1),
  consentCamera: z.boolean(),
  consentData: z.boolean(),
  moodBaseline: z.string().min(2),
  mbtiType: z.string().trim().min(2).max(4).optional(),
  enneagramType: z.string().trim().min(1).max(2).optional(),
  primaryArchetype: z.string().trim().min(3).optional(),
  zodiacSign: z.string().trim().nullable().optional(),
  personalityNotes: z.string().trim().nullable().optional(),
});

type ProfileRow = Database["public"]["Tables"]["profile"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profile"]["Insert"];

export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profile")
    .select("id,nickname,focus_areas,mood_baseline,created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal membaca data" }, { status: 500 });
  }
  const rows = (data ?? []) as Pick<ProfileRow, "id" | "nickname" | "focus_areas" | "mood_baseline" | "created_at">[];
  return NextResponse.json(
    rows.map((row) => ({
      id: row.id,
      nickname: row.nickname,
      focusAreas: row.focus_areas ?? [],
      moodBaseline: row.mood_baseline,
      createdAt: row.created_at,
    })),
  );
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = profileSchema.parse(payload);
    const supabase = getSupabaseClient();

    const insertPayload: ProfileInsert = {
      nickname: parsed.nickname.trim(),
      focus_areas: parsed.focusAreas,
      consent_camera: parsed.consentCamera,
      consent_data: parsed.consentData,
      mood_baseline: parsed.moodBaseline,
      mbti_type: parsed.mbtiType ?? null,
      enneagram_type: parsed.enneagramType ?? null,
      primary_archetype: parsed.primaryArchetype ?? null,
      zodiac_sign: parsed.zodiacSign ?? null,
      personality_notes: parsed.personalityNotes ?? null,
    };

    const { data, error } = await supabase
      .from("profile")
      .insert([insertPayload])
      .select("id,nickname,focus_areas,mood_baseline")
      .single();

    if (error || !data) {
      console.error(error);
      return NextResponse.json({ message: "Gagal menyimpan profil" }, { status: 500 });
    }

    return NextResponse.json(
      {
        id: data.id,
        nickname: data.nickname,
        focusAreas: data.focus_areas ?? [],
        moodBaseline: data.mood_baseline,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }
}
