import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import type { PortfolioConfig } from '@katachi/schema'
import { jsonError, requireApiUser } from '@/lib/api'
import { getPrisma } from '@/lib/prisma'
import { publishDraft, type PublishStore } from '@/lib/publish'

type RouteParams = { params: Promise<{ id: string }> }

function prismaPublishStore(): PublishStore {
  const prisma = getPrisma()
  return {
    async getPortfolio(id) {
      const portfolio = await prisma.portfolio.findUnique({
        where: { id },
        select: { id: true, slug: true, draftVersionId: true },
      })
      return portfolio
    },
    async getVersionConfig(versionId) {
      const version = await prisma.portfolioVersion.findUnique({ where: { id: versionId } })
      return version?.config
    },
    async createVersion(portfolioId, config, label) {
      const version = await prisma.portfolioVersion.create({
        data: { portfolioId, config: config as object, label },
        select: { id: true },
      })
      return version
    },
    async setPublishedVersion(portfolioId, versionId) {
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { publishedVersionId: versionId },
      })
    },
  }
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { user, response } = await requireApiUser()
  if (!user) return response
  const { id } = await params

  const prisma = getPrisma()
  const owned = await prisma.portfolio.findFirst({ where: { id, userId: user.id } })
  if (!owned) return jsonError(404, 'not_found')

  const result = await publishDraft(prismaPublishStore(), id)
  if (!result.ok) {
    const status = result.error === 'invalid_config' ? 400 : 404
    return jsonError(status, result.error)
  }

  // On-demand ISR (§12): the public route caches until the next publish.
  revalidatePath(`/p/${result.slug}`)
  const version = await prisma.portfolioVersion.findUnique({ where: { id: result.versionId } })
  const config = version?.config as PortfolioConfig | undefined
  for (const page of config?.pages ?? []) {
    if (page.slug) revalidatePath(`/p/${result.slug}/${page.slug}`)
  }

  return NextResponse.json({ ok: true, versionId: result.versionId, slug: result.slug })
}
