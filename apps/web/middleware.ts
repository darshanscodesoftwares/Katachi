import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/studio')

  // Env vars not pasted yet (CLAUDE.md Current Status): let routes through —
  // /studio runs in local demo mode (no auth, no DB), /login shows the notice.
  if (!SUPABASE_CONFIGURED) {
    return NextResponse.next()
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
