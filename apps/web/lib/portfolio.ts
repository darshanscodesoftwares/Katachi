import {
  defaultNavConfig,
  defaultPortfolioConfig,
  defaultPortfolioMeta,
  type PortfolioConfig,
} from '@katachi/schema'
import { backgroundPresets, sectionRegistry } from '@katachi/renderer'
import { getPrisma } from './prisma'

/** The six Phase 1 sections, in default page order. */
const STARTER_SECTION_TYPES = [
  'hero',
  'about',
  'projectsGrid',
  'experienceTimeline',
  'skills',
  'contact',
] as const

/** A ready-to-edit starter portfolio built from the section registry defaults. */
export function starterPortfolioConfig(title: string): PortfolioConfig {
  const config = defaultPortfolioConfig({
    nav: defaultNavConfig({ logoText: title }),
    meta: defaultPortfolioMeta({ title }),
  })
  const home = config.pages[0]
  if (home) {
    home.sections = STARTER_SECTION_TYPES.flatMap((type) => {
      const definition = sectionRegistry[type]
      return definition ? [definition.create()] : []
    })
    const hero = home.sections[0]
    const aurora = backgroundPresets.find((preset) => preset.id === 'aurora')
    if (hero && aurora) hero.background = aurora.create()
  }
  return config
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'portfolio'
}

/** Creates a portfolio plus its mutable draft version and wires the pointer. */
export async function createPortfolioWithDraft(userId: string, name: string) {
  const prisma = getPrisma()
  const config = starterPortfolioConfig(name)

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? slugify(name) : `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`
    try {
      return await prisma.$transaction(async (tx) => {
        const portfolio = await tx.portfolio.create({ data: { userId, name, slug } })
        const draft = await tx.portfolioVersion.create({
          data: {
            portfolioId: portfolio.id,
            config: JSON.parse(JSON.stringify(config)),
            label: 'Draft',
          },
        })
        return tx.portfolio.update({
          where: { id: portfolio.id },
          data: { draftVersionId: draft.id },
        })
      })
    } catch (error) {
      const isUniqueViolation =
        typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002'
      if (!isUniqueViolation) throw error
    }
  }
  throw new Error('Could not allocate a unique portfolio slug.')
}

/** First portfolio for a user, creating one on first Studio visit. */
export async function getOrCreateFirstPortfolio(userId: string, fallbackName: string) {
  const prisma = getPrisma()
  const existing = await prisma.portfolio.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })
  if (existing) return existing
  return createPortfolioWithDraft(userId, fallbackName)
}
