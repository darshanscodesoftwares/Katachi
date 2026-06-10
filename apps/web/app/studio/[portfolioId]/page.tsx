import { notFound, redirect } from 'next/navigation'
import { safeParsePortfolioConfig } from '@katachi/schema'
import { StudioEditor } from '@/components/studio/StudioEditor'
import { getUser } from '@/lib/auth'
import { isAppConfigured } from '@/lib/env'
import { starterPortfolioConfig } from '@/lib/portfolio'
import { getPrisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Studio — Katachi' }

export default async function StudioPortfolioPage({
  params,
}: {
  params: Promise<{ portfolioId: string }>
}) {
  if (!isAppConfigured()) redirect('/setup')

  const user = await getUser()
  if (!user) redirect('/login')

  const { portfolioId } = await params
  const prisma = getPrisma()
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  })
  if (!portfolio) notFound()

  // Self-heal a missing draft pointer (e.g. interrupted creation).
  let draftVersionId = portfolio.draftVersionId
  if (!draftVersionId) {
    const draft = await prisma.portfolioVersion.create({
      data: {
        portfolioId: portfolio.id,
        config: JSON.parse(JSON.stringify(starterPortfolioConfig(portfolio.name))),
        label: 'Draft',
      },
    })
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { draftVersionId: draft.id },
    })
    draftVersionId = draft.id
  }

  const draft = await prisma.portfolioVersion.findUnique({ where: { id: draftVersionId } })
  const parsed = safeParsePortfolioConfig(draft?.config)
  const initialConfig = parsed.success ? parsed.data : starterPortfolioConfig(portfolio.name)

  return (
    <StudioEditor
      portfolioId={portfolio.id}
      name={portfolio.name}
      slug={portfolio.slug}
      initialConfig={initialConfig}
    />
  )
}
