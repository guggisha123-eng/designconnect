import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_NOT_CONFIGURED')
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function isSupabaseReady(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}
