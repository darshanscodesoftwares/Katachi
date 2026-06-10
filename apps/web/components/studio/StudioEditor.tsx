'use client'

import type { PortfolioConfig } from '@katachi/schema'
import { useEffect, useRef } from 'react'
import { Canvas } from './Canvas'
import { Inspector } from './Inspector'
import { LeftPanel } from './LeftPanel'
import { useStudio } from './store'
import { TopBar } from './TopBar'

const AUTOSAVE_DEBOUNCE_MS = 1500

export function StudioEditor(props: {
  portfolioId: string
  name: string
  slug: string
  initialConfig: PortfolioConfig
}) {
  const initialize = useStudio((s) => s.initialize)
  const config = useStudio((s) => s.config)
  const saveState = useStudio((s) => s.saveState)
  const setSaveState = useStudio((s) => s.setSaveState)
  const portfolioId = useStudio((s) => s.portfolioId)

  const latestConfig = useRef<PortfolioConfig | null>(null)
  useEffect(() => {
    latestConfig.current = config
  }, [config])

  useEffect(() => {
    initialize(props.portfolioId, props.initialConfig)
  }, [initialize, props.portfolioId, props.initialConfig])

  // Autosave (§11): debounced 1.5 s after the last change → PATCH the draft.
  useEffect(() => {
    if (saveState !== 'dirty' || !config || !portfolioId) return
    const timer = setTimeout(async () => {
      const sent = config
      setSaveState('saving')
      try {
        const res = await fetch(`/api/portfolios/${portfolioId}/draft`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ config: sent }),
        })
        if (!res.ok) throw new Error(String(res.status))
        // edits made while the request was in flight stay dirty
        setSaveState(latestConfig.current === sent ? 'saved' : 'dirty')
      } catch {
        setSaveState('error')
      }
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [config, saveState, portfolioId, setSaveState])

  // Warn before closing with unsaved work.
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (useStudio.getState().saveState !== 'saved') event.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  if (!config || portfolioId !== props.portfolioId) {
    return <div className="flex h-screen items-center justify-center text-sm text-zinc-400">Loading Studio…</div>
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      <TopBar name={props.name} slug={props.slug} />
      <div className="flex min-h-0 flex-1">
        <LeftPanel />
        <Canvas />
        <Inspector />
      </div>
    </div>
  )
}
