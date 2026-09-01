/**
 * Centralized Supabase browser client.
 *
 * Env vars (set in Vercel dashboard or .env.local):
 *   VITE_SUPABASE_URL       – e.g. https://xyz.supabase.co
 *   VITE_SUPABASE_ANON_KEY  – anon / public key from Supabase dashboard
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

if (!url || !anonKey) {
  console.warn(
    '[supabaseClient] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.',
    'Auth and database calls will fail. Set these in Vercel → Settings → Environment Variables.',
  );
}

/**
 * Shared Supabase instance for the browser.
 * Safe to call even when env vars are missing — requests will simply fail
 * with a clear console warning instead of crashing the app.
 */
export const supabase: SupabaseClient = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-key',
);

/**
 * Helper: check whether the client is properly configured.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);
