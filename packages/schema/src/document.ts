import { z } from 'zod'
import { backgroundLayerSchema, type BackgroundLayer } from './background'
import { conditionSchema, responsiveOverridesSchema, type Condition, type ResponsiveOverrides } from './behavior'
import { styleOverridesSchema, type StyleOverrides } from './style'
import { themeTokensOverrideSchema, themeTokensSchema, type ThemeTokens, type ThemeTokensOverride } from './tokens'

// ---------- nav ----------
export type NavLink = {
  id: string
  label: string
  pageId?: string // internal link to a Page
  href?: string // external link
}

export type NavConfig = {
  layout: 'top' | 'side' | 'hidden'
  logoText?: string
  logoAssetId?: string
  links: NavLink[]
}

export const navLinkSchema: z.ZodType<NavLink> = z.object({
  id: z.string(),
  label: z.string(),
  pageId: z.string().optional(),
  href: z.string().optional(),
})

export const navConfigSchema: z.ZodType<NavConfig> = z.object({
  layout: z.enum(['top', 'side', 'hidden']),
  logoText: z.string().optional(),
  logoAssetId: z.string().optional(),
  links: z.array(navLinkSchema),
})

// ---------- document tree ----------
export type Block = {
  id: string
  type: string // see Block Library
  props: Record<string, unknown> // per-type, validated by that block's Zod schema
  style?: StyleOverrides
  responsive?: ResponsiveOverrides
  visibility?: Condition
  children?: Block[] // recursion = nesting, custom sections, grids
}

export const blockSchema: z.ZodType<Block> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.string(), z.unknown()),
    style: styleOverridesSchema.optional(),
    responsive: responsiveOverridesSchema.optional(),
    visibility: conditionSchema.optional(),
    children: z.array(blockSchema).optional(),
  }),
)

export type Section = {
  id: string
  type: string // see Section Library — 'custom' uses raw blocks
  variant: string // layout variant within the type
  label?: string // shown in Studio tree
  props: Record<string, unknown> // per-type content, validated by that section's Zod schema (§8)
  themeOverride?: ThemeTokensOverride // section-level themes
  background?: BackgroundLayer[] // stacked bottom → top
  visibility?: Condition
  responsive?: ResponsiveOverrides
  style?: StyleOverrides
  blocks: Block[]
}

export const sectionSchema: z.ZodType<Section> = z.object({
  id: z.string(),
  type: z.string(),
  variant: z.string(),
  label: z.string().optional(),
  props: z.record(z.string(), z.unknown()),
  themeOverride: themeTokensOverrideSchema.optional(),
  background: z.array(backgroundLayerSchema).optional(),
  visibility: conditionSchema.optional(),
  responsive: responsiveOverridesSchema.optional(),
  style: styleOverridesSchema.optional(),
  blocks: z.array(blockSchema),
})

export type PageSeo = { title?: string; description?: string; ogImageAssetId?: string }

export type Page = {
  id: string
  slug: string // '' = home
  title: string
  hiddenFromNav?: boolean
  seo?: PageSeo
  themeOverride?: ThemeTokensOverride // per-page presets
  sections: Section[]
}

const pageSeoSchema: z.ZodType<PageSeo> = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImageAssetId: z.string().optional(),
})

export const pageSchema: z.ZodType<Page> = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  hiddenFromNav: z.boolean().optional(),
  seo: pageSeoSchema.optional(),
  themeOverride: themeTokensOverrideSchema.optional(),
  sections: z.array(sectionSchema),
})

export type PortfolioMeta = {
  title: string
  description?: string
  faviconAssetId?: string
  ogImageAssetId?: string
}

export const portfolioMetaSchema: z.ZodType<PortfolioMeta> = z.object({
  title: z.string(),
  description: z.string().optional(),
  faviconAssetId: z.string().optional(),
  ogImageAssetId: z.string().optional(),
})

export type PortfolioConfig = {
  version: 1 // schema version for future migrations
  theme: ThemeTokens
  nav: NavConfig // links, logo, layout: 'top' | 'side' | 'hidden'
  pages: Page[]
  meta: PortfolioMeta
}

export const portfolioConfigSchema: z.ZodType<PortfolioConfig> = z.object({
  version: z.literal(1),
  theme: themeTokensSchema,
  nav: navConfigSchema,
  pages: z.array(pageSchema),
  meta: portfolioMetaSchema,
})

/** Boundary helper: throws ZodError on invalid input. */
export function parsePortfolioConfig(data: unknown): PortfolioConfig {
  return portfolioConfigSchema.parse(data)
}

/** Boundary helper: returns a result instead of throwing. */
export function safeParsePortfolioConfig(data: unknown) {
  return portfolioConfigSchema.safeParse(data)
}
