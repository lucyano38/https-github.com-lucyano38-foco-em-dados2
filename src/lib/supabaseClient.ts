import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[SupabaseClient] Atencao: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY nao foram configuradas.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseServiceRole = supabase;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
