import { NextResponse } from 'next/server'
import { getUser } from './auth'
import { hasDatabaseEnv, hasSupabaseEnv } from './env'

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

/**
 * Common API guard: 503 while env is unconfigured (never a crash, CLAUDE.md
 * Current Status), 401 without a session. Returns the auth user otherwise.
 */
export async function requireApiUser() {
  if (!hasSupabaseEnv() || !hasDatabaseEnv()) {
    return { user: null, response: jsonError(503, 'not_configured') }
  }
  const user = await getUser()
  if (!user) {
    return { user: null, response: jsonError(401, 'unauthorized') }
  }
  return { user, response: null }
}
