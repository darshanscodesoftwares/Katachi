import type { Page, PortfolioConfig } from '@katachi/schema'
import type { CSSProperties } from 'react'
import { resolveTokens } from './cascade'
import type { RenderContext } from './registry'
import { RenderSection } from './RenderSection'

function defaultPageHref(slug: string): string {
  return slug ? `/${slug}` : '/'
}

function Nav({ config, ctx }: { config: PortfolioConfig; ctx: RenderContext }) {
  const pageHref = ctx.pageHref ?? defaultPageHref
  const links = config.nav.links.length
    ? config.nav.links.map((link) => ({
        id: link.id,
        label: link.label,
        href: link.pageId
          ? pageHref(config.pages.find((p) => p.id === link.pageId)?.slug ?? '')
          : (link.href ?? '#'),
      }))
    : config.pages
        .filter((page) => !page.hiddenFromNav)
        .map((page) => ({ id: page.id, label: page.title, href: pageHref(page.slug) }))

  return (
    <header className="ka-nav ka-nav--top">
      <span className="ka-nav__logo">{config.nav.logoText ?? config.meta.title}</span>
      <nav aria-label="Portfolio">
        <ul className="ka-nav__links">
          {links.map((link) => (
            <li key={link.id}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export type RenderPageProps = {
  config: PortfolioConfig
  page: Page
  ctx: RenderContext
}

/** Renders one page of a portfolio: nav + section list under the page's token cascade. */
export function RenderPage({ config, page, ctx }: RenderPageProps) {
  const vars = resolveTokens(config.theme, page.themeOverride) as CSSProperties
  return (
    <div className="ka-page" style={vars}>
      {config.nav.layout !== 'hidden' ? <Nav config={config} ctx={ctx} /> : null}
      <main className="ka-page__main">
        {page.sections.map((section) => (
          <RenderSection
            key={section.id}
            section={section}
            theme={config.theme}
            pageThemeOverride={page.themeOverride}
            ctx={ctx}
          />
        ))}
      </main>
    </div>
  )
}
