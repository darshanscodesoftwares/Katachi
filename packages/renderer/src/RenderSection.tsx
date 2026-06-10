import type { Section, ThemeTokens, ThemeTokensOverride } from '@katachi/schema'
import type { CSSProperties } from 'react'
import { BackgroundStack } from './backgrounds/BackgroundStack'
import { resolveTokens, styleToCss } from './cascade'
import type { RenderContext } from './registry'
import { sectionRegistry } from './sections/registry'

export type RenderSectionProps = {
  section: Section
  theme: ThemeTokens
  pageThemeOverride?: ThemeTokensOverride
  ctx: RenderContext
}

/**
 * The single wrapper every section renders through, in Studio and public alike
 * (one renderer = WYSIWYG). Resolves the token cascade to CSS variables on the
 * wrapper, paints backgrounds, then delegates to the registry component.
 */
export function RenderSection({ section, theme, pageThemeOverride, ctx }: RenderSectionProps) {
  // 'hidden' respected everywhere; breakpoint/dateRange conditions get UI in Phase 3.
  if (section.visibility?.type === 'hidden' && ctx.mode === 'public') return null

  const definition = sectionRegistry[section.type]
  const vars = resolveTokens(theme, pageThemeOverride, section.themeOverride)
  const style = { ...vars, ...styleToCss(section.style) } as CSSProperties

  let content = null
  if (definition) {
    const parsed = definition.propsSchema.safeParse(section.props)
    const props = parsed.success ? parsed.data : definition.propsSchema.parse({})
    const Component = definition.component
    content = <Component props={props} variant={section.variant} section={section} ctx={ctx} />
  }

  return (
    <section
      className="ka-section"
      data-node={section.id}
      data-section-type={section.type}
      style={style}
      aria-label={section.label ?? definition?.label ?? section.type}
    >
      {section.background?.length ? <BackgroundStack layers={section.background} /> : null}
      <div className="ka-section__inner">{content}</div>
    </section>
  )
}
