import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/studio')

  // Env vars not pasted yet (CLAUDE.md Current Status): degrade to /setup
  // instead of crashing — never block on missing configuration.
  if (!SUPABASE_CONFIGURED) {
    return isProtected
      ? NextResponse.redirect(new URL('/setup', request.url))
      : NextResponse.next()
  }

  const { user, response } = await updateSession(request)

  if (isProtected && !user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }
  if (path === '/login' && user) {
    return NextResponse.redirect(new URL('/studio', request.url))
  }
  return response
}

export const config = {
  matcher: ['/studio/:path*', '/login', '/auth/:path*'],
}
