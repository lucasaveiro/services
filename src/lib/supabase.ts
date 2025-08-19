import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials are not configured. Using placeholder values; functionality will be limited.",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://example.supabase.co",
  supabaseAnonKey || "public-anon-key",
);

