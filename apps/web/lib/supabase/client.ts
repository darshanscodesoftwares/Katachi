'use client'

import { createBrowserClient } from '@supabase/ssr'

/** Browser Supabase client. Call only after checking env (login UI guards). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
