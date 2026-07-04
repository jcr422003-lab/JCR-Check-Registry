import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export async function signInWithMagicLink(email: string) {
  if (!supabase) {
    return { error: new Error('Supabase is not configured') }
  }

  return supabase.auth.signInWithOtp({ email })
}

export async function signOut() {
  if (!supabase) {
    return { error: new Error('Supabase is not configured') }
  }

  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  if (!supabase) {
    return null
  }

  const { data } = await supabase.auth.getUser()
  return data.user
}
