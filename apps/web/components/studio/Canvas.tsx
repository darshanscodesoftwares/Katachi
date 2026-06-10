'use client'

import { RenderSection, resolveTokens } from '@katachi/renderer'
import { useEffect, type CSSProperties } from 'react'
import { googleFontsUrl } from '@/lib/fonts'
import { getActivePage, useStudio } from './store'

const FONT_LINK_ID = 'katachi-canvas-fonts'

/**
 * Live preview through the REAL renderer (§11) — the same components the
 * public route uses — wrapped in selection chrome.
 */
export function Canvas() {
  const config = useStudio((s) => s.config)
  const activePageId = useStudio((s) => s.activePageId)
  const selectedSectionId = useStudio((s) => s.selectedSectionId)
  const selectSection = useStudio((s) => s.selectSection)

  // Shell-owned font loading: swap the <link> whenever theme fonts change.
  const fontsUrl = config ? googleFontsUrl(config.theme) : null
  useEffect(() => {
    if (!fontsUrl) return
    let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = FONT_LINK_ID
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    if (link.href !== fontsUrl) link.href = fontsUrl
  }, [fontsUrl])

  if (!config) return null
  const page = getActivePage(config, activePageId)
  if (!page) return null

  const pageVars = resolveTokens(config.theme, page.themeOverride) as CSSProperties

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-100 p-6">
      <div
        className="ka-page mx-auto max-w-5xl overflow-hidden rounded-lg shadow-sm ring-1 ring-zinc-200"
        style={pageVars}
      >
        {page.sections.length === 0 ? (
          <p className="p-16 text-center text-sm text-zinc-400">This page has no sections yet.</p>
        ) : (
          page.sections.map((section) => {
            const selected = section.id === selectedSectionId
            return (
              <div
                key={section.id}
                onClick={() => selectSection(section.id)}
                className={`relative cursor-pointer transition ${
                  selected
                    ? 'outline-2 outline-offset-[-2px] outline-indigo-500'
                    : 'hover:outline-2 hover:outline-offset-[-2px] hover:outline-indigo-300'
                }`}
              >
                <RenderSection
                  section={section}
                  theme={config.theme}
                  pageThemeOverride={page.themeOverride}
                  ctx={{ mode: 'studio' }}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
