import { NextResponse } from 'next/server'
import { z } from '@katachi/schema'
import { hasDatabaseEnv } from '@/lib/env'
import { getPrisma } from '@/lib/prisma'

const submissionSchema = z.object({
  portfolioId: z.string().min(1),
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  message: z.string().min(1).max(5000),
})

/**
 * Zero-JS contact form target (§8): accepts a native form POST, stores the
 * submission, and 303-redirects back to the page with ?sent=1.
 */
export async function POST(request: Request) {
  if (!hasDatabaseEnv()) return NextResponse.json({ error: 'not_configured' }, { status: 503 })

  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  const parsed = submissionSchema.safeParse({
    portfolioId: form.get('portfolioId'),
    name: form.get('name'),
    email: form.get('email'),
    message: form.get('message'),
  })
  if (!parsed.success) return NextResponse.json({ error: 'invalid_submission' }, { status: 400 })

  const prisma = getPrisma()
  const portfolio = await prisma.portfolio.findUnique({ where: { id: parsed.data.portfolioId } })
  if (!portfolio) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  await prisma.contactSubmission.create({ data: parsed.data })

  const referer = request.headers.get('referer')
  if (referer) {
    const back = new URL(referer)
    back.searchParams.set('sent', '1')
    return NextResponse.redirect(back, { status: 303 })
  }
  return NextResponse.json({ ok: true })
}
