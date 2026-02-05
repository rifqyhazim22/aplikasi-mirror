import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";

const metricsSchema = z.object({
  luma: z.number().optional(),
  frameCount: z.number().optional(),
  valence: z.number().optional().nullable(),
  energy: z.number().optional().nullable(),
  tension: z.number().optional().nullable(),
  cues: z.array(z.string()).optional(),
  headPose: z
    .object({
      pitch: z.number(),
      yaw: z.number(),
      roll: z.number(),
    })
    .optional()
    .nullable(),
  expressions: z
    .array(
      z.object({
        label: z.string(),
        score: z.number(),
      })
    )
    .optional(),
});

const schema = z.object({
  profileId: z.string().uuid(),
  emotion: z.string().min(2).max(32),
  confidence: z.number().min(0).max(1),
  timestamp: z.number().optional(),
  metrics: metricsSchema.optional(),
});

export async function POST(req: Request) {
  try {
    const payload = schema.parse(await req.json());
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("camera_emotion_log").insert([
      {
        profile_id: payload.profileId,
        emotion: payload.emotion,
        confidence: payload.confidence,
        metadata: payload.metrics ?? {},
      },
    ]);
    if (error) {
      console.error("Supabase insert error", error);
      return NextResponse.json({ message: "Gagal menyimpan log" }, { status: 500 });
    }
    return NextResponse.json({ message: "ok" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Payload tidak valid", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
