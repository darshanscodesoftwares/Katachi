import { NextResponse } from 'next/server'
import { safeParsePortfolioConfig } from '@katachi/schema'
import { jsonError, requireApiUser } from '@/lib/api'
import { getPrisma } from '@/lib/prisma'

type RouteParams = { params: Promise<{ id: string }> }

async function getOwnedPortfolio(userId: string, portfolioId: string) {
  const prisma = getPrisma()
  return prisma.portfolio.findFirst({ where: { id: portfolioId, userId } })
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { user, response } = await requireApiUser()
  if (!user) return response
  const { id } = await params

  const portfolio = await getOwnedPortfolio(user.id, id)
  if (!portfolio?.draftVersionId) return jsonError(404, 'not_found')

  const prisma = getPrisma()
  const draft = await prisma.portfolioVersion.findUnique({
    where: { id: portfolio.draftVersionId },
  })
  if (!draft) return jsonError(404, 'not_found')
  return NextResponse.json({ config: draft.config, versionId: draft.id })
}

/** Autosave target: validates the full config tree (§15.4) and overwrites the draft. */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { user, response } = await requireApiUser()
  if (!user) return response
  const { id } = await params

  const portfolio = await getOwnedPortfolio(user.id, id)
  if (!portfolio?.draftVersionId) return jsonError(404, 'not_found')

  const body = (await request.json().catch(() => null)) as { config?: unknown } | null
  const parsed = safeParsePortfolioConfig(body?.config)
  if (!parsed.success) return jsonError(400, 'invalid_config')

  const prisma = getPrisma()
  await prisma.portfolioVersion.update({
    where: { id: portfolio.draftVersionId },
    data: { config: JSON.parse(JSON.stringify(parsed.data)) },
  })
  return NextResponse.json({ ok: true })
}
