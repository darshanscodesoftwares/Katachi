import type { User } from '@supabase/supabase-js'
import { getPrisma } from './prisma'
import { createClient } from './supabase/server'

/** Current Supabase user, or null. Server-side only. */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** Mirrors the Supabase auth user into the Profile table (§5) and returns it. */
export async function ensureProfile(user: User) {
  const prisma = getPrisma()
  const email = user.email ?? `${user.id}@unknown.invalid`
  return prisma.profile.upsert({
    where: { id: user.id },
    update: { email },
    create: {
      id: user.id,
      email,
      name: (user.user_metadata?.full_name as string | undefined) ?? null,
    },
  })
}
