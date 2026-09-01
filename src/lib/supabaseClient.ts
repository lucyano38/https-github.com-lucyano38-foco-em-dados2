import { createClient } from '@supabase/supabase-js';

// Credenciais reais embutidas hardcoded para eliminar qualquer falha de ambiente na Vercel
const supabaseUrl = 'https://ioijbixifvbosythznhh.supabase.co';
const supabaseAnonKey = 'sb_publishable_-Gi6jjSSNkRce_iua4MEhg_z6urjNg-';

export const isSupabaseConfigured = true;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseServiceRole = supabase;
