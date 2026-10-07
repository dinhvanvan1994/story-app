import { createClient } from "@supabase/supabase-js";

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;
const missingVariables = [
  ["VITE_SUPABASE_URL", VITE_SUPABASE_URL],
  ["VITE_SUPABASE_ANON_KEY", VITE_SUPABASE_ANON_KEY],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variable${missingVariables.length > 1 ? "s" : ""}: ${missingVariables.join(", ")}`,
  );
}

export const supabaseClient = createClient(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
);
