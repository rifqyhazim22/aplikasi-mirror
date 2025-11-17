import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase env belum lengkap. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY terisi.",
  );
}

export type SupabaseClient = ReturnType<typeof createClient<Database>>;

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient<Database>(supabaseUrl ?? "", supabaseKey ?? "", {
      auth: {
        persistSession: false,
      },
    });
  }
  return cachedClient;
}
