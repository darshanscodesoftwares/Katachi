'use client'

import { create } from 'zustand'
import type { PortfolioConfig, Section, ThemeTokens } from '@katachi/schema'

export type SaveState = 'saved' | 'dirty' | 'saving' | 'error'

type StudioState = {
  portfolioId: string | null
  config: PortfolioConfig | null
  activePageId: string | null
  selectedSectionId: string | null
  saveState: SaveState

  initialize: (portfolioId: string, config: PortfolioConfig) => void
  setSaveState: (state: SaveState) => void
  setActivePage: (pageId: string) => void
  selectSection: (sectionId: string | null) => void

  /** Every edit flows through here: clone → mutate → mark dirty (autosave picks it up). */
  updateConfig: (mutate: (config: PortfolioConfig) => void) => void
  updateSection: (sectionId: string, mutate: (section: Section) => void) => void
  moveSection: (sectionId: string, direction: -1 | 1) => void
  updateTheme: (mutate: (theme: ThemeTokens) => void) => void
}

export const useStudio = create<StudioState>((set) => ({
  portfolioId: null,
  config: null,
  activePageId: null,
  selectedSectionId: null,
  saveState: 'saved',

  initialize: (portfolioId, config) =>
    set({
      portfolioId,
      config,
      activePageId: config.pages[0]?.id ?? null,
      selectedSectionId: config.pages[0]?.sections[0]?.id ?? null,
      saveState: 'saved',
    }),

  setSaveState: (saveState) => set({ saveState }),
  setActivePage: (activePageId) => set({ activePageId, selectedSectionId: null }),
  selectSection: (selectedSectionId) => set({ selectedSectionId }),

  updateConfig: (mutate) =>
    set((state) => {
      if (!state.config) return state
      const next = structuredClone(state.config)
      mutate(next)
      return { config: next, saveState: 'dirty' }
    }),

  updateSection: (sectionId, mutate) =>
    set((state) => {
      if (!state.config) return state
      const next = structuredClone(state.config)
      for (const page of next.pages) {
        const section = page.sections.find((s) => s.id === sectionId)
        if (section) {
          mutate(section)
          return { config: next, saveState: 'dirty' }
        }
      }
      return state
    }),

  moveSection: (sectionId, direction) =>
    set((state) => {
      if (!state.config) return state
      const next = structuredClone(state.config)
      for (const page of next.pages) {
        const index = page.sections.findIndex((s) => s.id === sectionId)
        if (index !== -1) {
          const target = index + direction
          if (target < 0 || target >= page.sections.length) return state
          const [section] = page.sections.splice(index, 1)
          page.sections.splice(target, 0, section!)
          return { config: next, saveState: 'dirty' }
        }
      }
      return state
    }),

  updateTheme: (mutate) =>
    set((state) => {
      if (!state.config) return state
      const next = structuredClone(state.config)
      mutate(next.theme)
      return { config: next, saveState: 'dirty' }
    }),
}))

/** The active page object, or the first page as fallback. */
export function getActivePage(config: PortfolioConfig, activePageId: string | null) {
  return config.pages.find((page) => page.id === activePageId) ?? config.pages[0]
}
