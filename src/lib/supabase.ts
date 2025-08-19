import { createClient } from "@supabase/supabase-js";

// Supabase credentials are provided via Vite environment variables.
// Throw early if they are missing so the application fails fast with a
// clear message instead of attempting to contact a non-existent project
// (which would surface as a generic "Failed to fetch" error at runtime).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase credentials are not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

