import { defaultPortfolioConfig, type PortfolioConfig } from '@katachi/schema'
import { describe, expect, it } from 'vitest'
import { publishDraft, type PublishStore } from './publish'

type VersionRow = { id: string; portfolioId: string; config: unknown; label: string | null }

function makeFakeStore(draftConfig: unknown) {
  let nextId = 1
  const versions = new Map<string, VersionRow>()
  const portfolio = {
    id: 'p1',
    slug: 'mine',
    draftVersionId: null as string | null,
    publishedVersionId: null as string | null,
  }

  if (draftConfig !== undefined) {
    const draft: VersionRow = { id: 'draft1', portfolioId: 'p1', config: draftConfig, label: 'Draft' }
    versions.set(draft.id, draft)
    portfolio.draftVersionId = draft.id
  }

  const store: PublishStore = {
    async getPortfolio(id) {
      return id === portfolio.id
        ? { id: portfolio.id, slug: portfolio.slug, draftVersionId: portfolio.draftVersionId }
        : null
    },
    async getVersionConfig(versionId) {
      return versions.get(versionId)?.config
    },
    async createVersion(portfolioId, config, label) {
      const id = `v${nextId++}`
      versions.set(id, { id, portfolioId, config, label })
      return { id }
    },
    async setPublishedVersion(_portfolioId, versionId) {
      portfolio.publishedVersionId = versionId
    },
  }

  return { store, portfolio, versions }
}

describe('publishDraft', () => {
  it('errors for an unknown portfolio', async () => {
    const { store } = makeFakeStore(defaultPortfolioConfig())
    expect(await publishDraft(store, 'nope')).toEqual({ ok: false, error: 'not_found' })
  })

  it('errors when no draft pointer exists', async () => {
    const { store } = makeFakeStore(undefined)
    expect(await publishDraft(store, 'p1')).toEqual({ ok: false, error: 'no_draft' })
  })

  it('rejects an invalid draft config at the boundary', async () => {
    const { store } = makeFakeStore({ version: 99, nonsense: true })
    expect(await publishDraft(store, 'p1')).toEqual({ ok: false, error: 'invalid_config' })
  })

  it('snapshots the draft into a new version and moves the pointer', async () => {
    const config = defaultPortfolioConfig()
    const { store, portfolio, versions } = makeFakeStore(config)

    const result = await publishDraft(store, 'p1', new Date('2026-06-10T12:00:00Z'))
    expect(result).toEqual({ ok: true, versionId: 'v1', slug: 'mine' })
    expect(portfolio.publishedVersionId).toBe('v1')
    // draft pointer untouched — draft stays mutable
    expect(portfolio.draftVersionId).toBe('draft1')
    expect(versions.get('v1')?.label).toBe('Published 2026-06-10')
  })

  it('keeps the published snapshot isolated from later draft edits', async () => {
    const config = defaultPortfolioConfig()
    const { store, versions } = makeFakeStore(config)
    await publishDraft(store, 'p1')

    // simulate continued editing of the mutable draft tree
    config.theme.colors.primary = '#mutated'

    const published = versions.get('v1')?.config as PortfolioConfig
    expect(published.theme.colors.primary).not.toBe('#mutated')
  })

  it('creates a distinct version per publish (history accumulates)', async () => {
    const { store, portfolio, versions } = makeFakeStore(defaultPortfolioConfig())
    await publishDraft(store, 'p1')
    await publishDraft(store, 'p1')
    expect(portfolio.publishedVersionId).toBe('v2')
    expect(versions.size).toBe(3) // draft + two published snapshots
  })
})
