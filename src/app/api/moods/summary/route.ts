import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";

const querySchema = z.object({
  days: z.coerce.number().min(1).max(90).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ days: searchParams.get("days") ?? undefined });
  if (!parsed.success) {
    return NextResponse.json({ message: "Parameter tidak valid" }, { status: 400 });
  }
  const days = parsed.data.days ?? 14;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("mood_entry")
    .select("created_at,mood,source")
    .gte("created_at", fromDate.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal membaca mood" }, { status: 500 });
  }

  const summaryMap = new Map<string, { count: number; moods: string[]; sources: string[] }>();
  for (const row of data ?? []) {
    const dateKey = row.created_at?.split("T")[0] ?? "unknown";
    const record = summaryMap.get(dateKey) ?? { count: 0, moods: [], sources: [] };
    record.count += 1;
    if (row.mood) record.moods.push(row.mood);
    if (row.source) record.sources.push(row.source);
    summaryMap.set(dateKey, record);
  }

  const summary = Array.from(summaryMap.entries())
    .map(([date, value]) => ({ date, ...value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json(summary);
}
