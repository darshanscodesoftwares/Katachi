import { RenderPage } from '@katachi/renderer'
import { googleFontsUrl } from '@/lib/fonts'
import { starterPortfolioConfig } from '@/lib/portfolio'

export const metadata = {
  title: 'Demo portfolio — Katachi',
  description: 'The starter portfolio rendered exactly like a published page — no database needed.',
}

/**
 * Local demo of the PUBLIC output: the starter config through the same
 * renderer the real /p/[slug] route uses. Statically prerendered, zero DB.
 */
export default function DemoPage() {
  const config = starterPortfolioConfig('Demo portfolio')
  const page = config.pages[0]
  if (!page) return null
  const fontsUrl = googleFontsUrl(config.theme)

  return (
    <>
      {fontsUrl ? <link rel="stylesheet" href={fontsUrl} precedence="default" /> : null}
      <RenderPage
        config={config}
        page={page}
        ctx={{ mode: 'public', pageHref: () => '/demo' }}
      />
    </>
  )
}
