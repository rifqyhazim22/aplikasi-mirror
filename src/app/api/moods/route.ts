import { NextResponse } from "next/server";
import { z } from "zod";
import type { Database } from "@/lib/database.types";
import { getSupabaseClient } from "@/lib/supabase";

const moodSchema = z.object({
  profileId: z.string().uuid(),
  mood: z.string().trim().min(2),
  note: z.string().trim().max(360).optional(),
  source: z.string().trim().max(30).optional().default("demo"),
});

type MoodRow = Database["public"]["Tables"]["mood_entry"]["Row"];
type MoodInsert = Database["public"]["Tables"]["mood_entry"]["Insert"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");
  const supabase = getSupabaseClient();

  let query = supabase
    .from("mood_entry")
    .select("id,profile_id,mood,note,source,created_at")
    .order("created_at", { ascending: false })
    .limit(profileId ? 50 : 20);

  if (profileId) {
    query = query.eq("profile_id", profileId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal membaca mood" }, { status: 500 });
  }

  const rows = (data ?? []) as Pick<
    MoodRow,
    "id" | "profile_id" | "mood" | "note" | "source" | "created_at"
  >[];

  return NextResponse.json(
    rows.map((row) => ({
      id: row.id,
      profileId: row.profile_id,
      mood: row.mood,
      note: row.note,
      source: row.source,
      createdAt: row.created_at,
    })),
  );
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = moodSchema.parse(payload);
    const supabase = getSupabaseClient();

    const insertPayload: MoodInsert = {
      profile_id: parsed.profileId,
      mood: parsed.mood,
      note: parsed.note ?? null,
      source: parsed.source ?? "demo",
    };

    const { data, error } = await supabase
      .from("mood_entry")
      .insert([insertPayload])
      .select("id,profile_id,mood,note,source,created_at")
      .single();

    if (error || !data) {
      console.error(error);
      return NextResponse.json({ message: "Gagal mencatat mood" }, { status: 500 });
    }

    return NextResponse.json(
      {
        id: data.id,
        profileId: data.profile_id,
        mood: data.mood,
        note: data.note,
        source: data.source,
        createdAt: data.created_at,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }
}
