'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useStudio } from './store'

const SAVE_LABEL = {
  saved: { text: 'Saved', dot: 'bg-emerald-500' },
  dirty: { text: 'Unsaved changes', dot: 'bg-amber-400' },
  saving: { text: 'Saving…', dot: 'bg-amber-400 animate-pulse' },
  error: { text: 'Save failed — retrying on next change', dot: 'bg-red-500' },
} as const

export function TopBar({ name, slug }: { name: string; slug: string }) {
  const portfolioId = useStudio((s) => s.portfolioId)
  const saveState = useStudio((s) => s.saveState)
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'published' | 'error'>('idle')

  async function publish() {
    if (!portfolioId) return
    setPublishState('publishing')
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/publish`, { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      setPublishState('published')
      setTimeout(() => setPublishState('idle'), 4000)
    } catch {
      setPublishState('error')
      setTimeout(() => setPublishState('idle'), 4000)
    }
  }

  const save = SAVE_LABEL[saveState]

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-4">
      <Link href="/" className="text-sm font-extrabold tracking-tight text-zinc-900">
        Katachi
      </Link>
      <span className="truncate text-sm text-zinc-500">{name}</span>

      <span className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500">
        <span className={`h-2 w-2 rounded-full ${save.dot}`} />
        {save.text}
      </span>

      <a
        href={`/p/${slug}`}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        View public ↗
      </a>

      <button
        type="button"
        onClick={publish}
        disabled={publishState === 'publishing'}
        className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {publishState === 'publishing'
          ? 'Publishing…'
          : publishState === 'published'
            ? 'Published ✓'
            : publishState === 'error'
              ? 'Publish failed — retry'
              : 'Publish'}
      </button>

      <form action="/auth/signout" method="post">
        <button type="submit" className="text-xs text-zinc-400 hover:text-zinc-700">
          Sign out
        </button>
      </form>
    </header>
  )
}
