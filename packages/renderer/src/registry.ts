import type { BackgroundLayer, Section } from '@katachi/schema'
import type { ComponentType } from 'react'
import type { z } from '@katachi/schema'

/** Shell-provided context. Never fetched by the renderer itself (§2.1). */
export type RenderContext = {
  mode: 'studio' | 'public'
  portfolioId?: string
  /** Maps a page to its public href. The shell owns URL structure. */
  pageHref?: (slug: string) => string
}

export type SectionRenderProps<P> = {
  props: P
  variant: string
  section: Section
  ctx: RenderContext
}

/**
 * Inspector manifest: declares the Content-tab fields for a section type so
 * the Studio renders editing UI generically (registry-driven, no switches).
 */
export type ContentField =
  | { kind: 'text' | 'textarea'; key: string; label: string; placeholder?: string }
  | {
      kind: 'list'
      key: string
      label: string
      /** item prop used as the row title in the Studio list editor */
      itemLabelKey: string
      itemFields: Array<{ kind: 'text' | 'textarea'; key: string; label: string }>
      createItem: () => Record<string, unknown>
    }

// Sections are heterogeneous; the registry stores them type-erased.
export type SectionDefinition<P = any> = {
  type: string
  label: string
  /** all variants this type supports; index 0 = default (Phase 1 ships one each) */
  variants: string[]
  propsSchema: z.ZodType<P, unknown>
  contentFields: ContentField[]
  create: () => Section
  component: ComponentType<SectionRenderProps<P>>
}

export type BackgroundPreset = {
  id: string
  label: string
  create: () => BackgroundLayer[]
}
