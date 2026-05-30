import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// Prefer legacy anon key (better SDK compatibility), fallback to publishable key
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_NOT_CONFIGURED')
  }
  return createBrowserClient(supabaseUrl, supabaseKey)
}

export function isSupabaseReady(): boolean {
  return !!(supabaseUrl && supabaseKey)
}
