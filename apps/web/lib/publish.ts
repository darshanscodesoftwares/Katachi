import { safeParsePortfolioConfig, type PortfolioConfig } from '@katachi/schema'

/**
 * Publish pointer flow (CLAUDE.md §5): draft stays mutable; Publish snapshots
 * the draft config into a NEW immutable PortfolioVersion and moves
 * publishedVersionId. Storage is injected so the logic unit-tests without a
 * database (§15.7).
 */
export interface PublishStore {
  getPortfolio(id: string): Promise<{ id: string; slug: string; draftVersionId: string | null } | null>
  getVersionConfig(versionId: string): Promise<unknown>
  createVersion(portfolioId: string, config: PortfolioConfig, label: string): Promise<{ id: string }>
  setPublishedVersion(portfolioId: string, versionId: string): Promise<void>
}

export type PublishResult =
  | { ok: true; versionId: string; slug: string }
  | { ok: false; error: 'not_found' | 'no_draft' | 'invalid_config' }

export async function publishDraft(
  store: PublishStore,
  portfolioId: string,
  now: Date = new Date(),
): Promise<PublishResult> {
  const portfolio = await store.getPortfolio(portfolioId)
  if (!portfolio) return { ok: false, error: 'not_found' }
  if (!portfolio.draftVersionId) return { ok: false, error: 'no_draft' }

  const raw = await store.getVersionConfig(portfolio.draftVersionId)
  const parsed = safeParsePortfolioConfig(raw)
  if (!parsed.success) return { ok: false, error: 'invalid_config' }

  // Deep copy: the published snapshot must never alias the mutable draft tree.
  const snapshot = JSON.parse(JSON.stringify(parsed.data)) as PortfolioConfig
  const label = `Published ${now.toISOString().slice(0, 10)}`
  const version = await store.createVersion(portfolio.id, snapshot, label)
  await store.setPublishedVersion(portfolio.id, version.id)

  return { ok: true, versionId: version.id, slug: portfolio.slug }
}
