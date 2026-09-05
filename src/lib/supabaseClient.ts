import { createClient } from '@supabase/supabase-js';

// Leitura estritamente segura das variáveis de ambiente sem fallbacks hardcoded
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[SupabaseClient] Atencao: NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY nao foram configuradas corretamente no arquivo .env ou na Vercel.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
export const supabaseServiceRole = supabase;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
