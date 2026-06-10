import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { RenderPage } from '@katachi/renderer'
import { safeParsePortfolioConfig } from '@katachi/schema'
import { hasDatabaseEnv } from '@/lib/env'
import { googleFontsUrl } from '@/lib/fonts'
import { getPrisma } from '@/lib/prisma'

/**
 * Public portfolio (§12): reads ONLY publishedVersionId, renders through the
 * same renderer the Studio canvas uses. ISR: cached until the Publish action
 * calls revalidatePath — draft edits never leak here.
 */
export const revalidate = false
export const dynamicParams = true

type Params = Promise<{ slug: string; page?: string[] }>

const getPublished = cache(async (slug: string) => {
  if (!hasDatabaseEnv()) return null
  const prisma = getPrisma()
  const portfolio = await prisma.portfolio.findUnique({ where: { slug } })
  if (!portfolio?.publishedVersionId) return null
  const version = await prisma.portfolioVersion.findUnique({
    where: { id: portfolio.publishedVersionId },
  })
  const parsed = safeParsePortfolioConfig(version?.config)
  if (!parsed.success) return null
  return { config: parsed.data, portfolioId: portfolio.id }
})

function pageSlugFromSegments(segments: string[] | undefined): string {
  return segments?.join('/') ?? ''
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, page: segments } = await params
  const data = await getPublished(slug)
  if (!data) return {}
  const page = data.config.pages.find((p) => p.slug === pageSlugFromSegments(segments))
  if (!page) return {}

  const siteTitle = data.config.meta.title
  return {
    title: page.seo?.title ?? (page.slug === '' ? siteTitle : `${page.title} — ${siteTitle}`),
    description: page.seo?.description ?? data.config.meta.description,
  }
}

export default async function PublicPortfolioPage({ params }: { params: Params }) {
  const { slug, page: segments } = await params
  const data = await getPublished(slug)
  if (!data) notFound()

  const page = data.config.pages.find((p) => p.slug === pageSlugFromSegments(segments))
  if (!page) notFound()

  const fontsUrl = googleFontsUrl(data.config.theme)

  return (
    <>
      {fontsUrl ? <link rel="stylesheet" href={fontsUrl} precedence="default" /> : null}
      <RenderPage
        config={data.config}
        page={page}
        ctx={{
          mode: 'public',
          portfolioId: data.portfolioId,
          pageHref: (pageSlug) => (pageSlug ? `/p/${slug}/${pageSlug}` : `/p/${slug}`),
        }}
      />
      {/* Zero-framework confirmation for the contact form's ?sent=1 redirect (shell-owned, §2.1). */}
      <script
        dangerouslySetInnerHTML={{
          __html: `if(new URLSearchParams(location.search).has('sent')){var d=document.createElement('div');d.setAttribute('role','status');d.textContent='Message sent — thank you!';d.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:10px 18px;border-radius:8px;font:600 14px system-ui;z-index:50';document.body.appendChild(d);setTimeout(function(){d.remove()},6000);}`,
        }}
      />
    </>
  )
}
