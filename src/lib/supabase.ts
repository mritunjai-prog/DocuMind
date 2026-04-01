import { createClient } from "@supabase/supabase-js";

// Note: You will need to add these variables to your .env file
// VITE_SUPABASE_URL="your-project-url"
// VITE_SUPABASE_ANON_KEY="your-anon-key"

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://placeholder-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
