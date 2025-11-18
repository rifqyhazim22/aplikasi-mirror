import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

const emotionSchema = z.object({
  emotion: z.string().min(3).max(20),
  confidence: z.number().min(0).max(100).optional(),
});

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional(),
});

type CameraLogInsert = Database["public"]["Tables"]["camera_emotion_log"]["Insert"];

export async function POST(request: Request) {
  try {
    const payload = emotionSchema.parse(await request.json());
    const supabase = getSupabaseClient();
    const insertPayload: CameraLogInsert = {
      emotion: payload.emotion,
      confidence: payload.confidence ?? null,
    };
    const { error } = await supabase.from("camera_emotion_log").insert([insertPayload]);
    if (error) {
      throw error;
    }
    return NextResponse.json({ status: "stored" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menyimpan emosi kamera" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    limit: searchParams.get("limit") ?? undefined,
  });
  const limit = parsed.success ? parsed.data.limit ?? 20 : 20;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("camera_emotion_log")
    .select("id,emotion,confidence,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return NextResponse.json({ message: "Tidak bisa membaca log kamera" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
