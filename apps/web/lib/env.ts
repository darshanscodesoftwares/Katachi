/**
 * Environment guards. Supabase env vars arrive later (CLAUDE.md §16 + Current
 * Status); nothing may crash at import time or block the build when they are
 * absent — routes degrade to the /setup notice instead.
 */

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

export function hasDatabaseEnv(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

export function isAppConfigured(): boolean {
  return hasSupabaseEnv() && hasDatabaseEnv()
}
