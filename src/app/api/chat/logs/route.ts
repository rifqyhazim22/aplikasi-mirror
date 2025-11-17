import { NextResponse } from "next/server";
import { z } from "zod";
import type { Database } from "@/lib/database.types";
import { getSupabaseClient } from "@/lib/supabase";

const querySchema = z.object({
  profileId: z.string().uuid(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

type ConversationRow = Database["public"]["Tables"]["conversation_log"]["Row"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parseResult = querySchema.safeParse({
    profileId: searchParams.get("profileId"),
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json({ message: "profileId wajib diisi" }, { status: 400 });
  }

  const { profileId, limit } = parseResult.data;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("conversation_log")
    .select("id,profile_id,role,content,created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true })
    .limit(limit ?? 30);

  if (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal membaca log" }, { status: 500 });
  }

  const rows = (data ?? []) as Pick<
    ConversationRow,
    "id" | "profile_id" | "role" | "content" | "created_at"
  >[];

  return NextResponse.json(
    rows.map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      createdAt: row.created_at,
    })),
  );
}
