'use client'

import { sectionRegistry } from '@katachi/renderer'
import { useState } from 'react'
import { getActivePage, useStudio } from './store'
import { ThemeEditor } from './ThemeEditor'

export function LeftPanel() {
  const [tab, setTab] = useState<'sections' | 'theme'>('sections')

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="flex border-b border-zinc-200">
        {(['sections', 'theme'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 py-2 text-sm font-semibold capitalize ${
              tab === id ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-zinc-500'
            }`}
          >
            {id}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'sections' ? <SectionsTab /> : <ThemeEditor />}
      </div>
    </aside>
  )
}

function SectionsTab() {
  const config = useStudio((s) => s.config)
  const activePageId = useStudio((s) => s.activePageId)
  const selectedSectionId = useStudio((s) => s.selectedSectionId)
  const setActivePage = useStudio((s) => s.setActivePage)
  const selectSection = useStudio((s) => s.selectSection)
  const moveSection = useStudio((s) => s.moveSection)
  if (!config) return null

  const page = getActivePage(config, activePageId)
  if (!page) return null

  return (
    <div className="flex flex-col gap-4 p-3">
      <div>
        <h3 className="mb-2 text-xs font-bold tracking-wide text-zinc-400 uppercase">Pages</h3>
        <ul className="flex flex-col gap-1">
          {config.pages.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setActivePage(p.id)}
                className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${
                  p.id === page.id ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {p.title}
                <span className="ml-1 text-xs text-zinc-400">/{p.slug}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold tracking-wide text-zinc-400 uppercase">Sections</h3>
        {page.sections.length === 0 ? (
          <p className="px-2 text-sm text-zinc-400">No sections on this page yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {page.sections.map((section, index) => {
              const label =
                section.label ?? sectionRegistry[section.type]?.label ?? section.type
              const selected = section.id === selectedSectionId
              return (
                <li
                  key={section.id}
                  className={`group flex items-center gap-1 rounded-md px-2 py-1.5 ${
                    selected ? 'bg-indigo-50' : 'hover:bg-zinc-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectSection(section.id)}
                    className={`flex-1 truncate text-left text-sm ${
                      selected ? 'font-semibold text-indigo-700' : 'text-zinc-700'
                    }`}
                  >
                    {label}
                  </button>
                  <div className="flex flex-col opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label={`Move ${label} up`}
                      disabled={index === 0}
                      onClick={() => moveSection(section.id, -1)}
                      className="px-1 text-[10px] leading-3 text-zinc-400 hover:text-zinc-800 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${label} down`}
                      disabled={index === page.sections.length - 1}
                      onClick={() => moveSection(section.id, 1)}
                      className="px-1 text-[10px] leading-3 text-zinc-400 hover:text-zinc-800 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
