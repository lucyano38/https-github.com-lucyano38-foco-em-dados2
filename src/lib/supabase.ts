import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ioijbixifvbosythznhh.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvaWpiaXhpZnZib3N5dGh6bmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjk4MzksImV4cCI6MjA5OTk0NTgzOX0.mnX7iKNChokWSGnJm8iep58Cu_syKKOpr-ywwKt2hBs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
