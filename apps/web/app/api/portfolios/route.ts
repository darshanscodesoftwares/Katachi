import { NextResponse } from 'next/server'
import { z } from '@katachi/schema'
import { requireApiUser } from '@/lib/api'
import { ensureProfile } from '@/lib/auth'
import { createPortfolioWithDraft } from '@/lib/portfolio'
import { getPrisma } from '@/lib/prisma'

export async function GET() {
  const { user, response } = await requireApiUser()
  if (!user) return response

  const prisma = getPrisma()
  const portfolios = await prisma.portfolio.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, slug: true, publishedVersionId: true, updatedAt: true },
  })
  return NextResponse.json({ portfolios })
}

const createBodySchema = z.object({ name: z.string().min(1).max(120).default('My portfolio') })

export async function POST(request: Request) {
  const { user, response } = await requireApiUser()
  if (!user) return response

  const body = createBodySchema.safeParse(await request.json().catch(() => ({})))
  if (!body.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  await ensureProfile(user)
  const portfolio = await createPortfolioWithDraft(user.id, body.data.name)
  return NextResponse.json({ portfolio }, { status: 201 })
}
