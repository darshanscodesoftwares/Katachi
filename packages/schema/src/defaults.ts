import type { BackgroundLayer, BackgroundLayerType } from './background'
import type { Block, NavConfig, Page, PortfolioConfig, PortfolioMeta, Section } from './document'
import type { FontRef, ThemeTokens } from './tokens'
import { createId } from './util'

export function defaultFontRef(overrides: Partial<FontRef> = {}): FontRef {
  return { family: 'Inter', source: 'google', fallback: 'sans-serif', ...overrides }
}

export function defaultThemeTokens(): ThemeTokens {
  return {
    colors: {
      background: '#ffffff',
      surface: '#f6f6f8',
      text: '#15151a',
      textMuted: '#6b6b76',
      primary: '#4f46e5',
      secondary: '#0ea5e9',
      accent: '#f59e0b',
      border: '#e4e4e9',
    },
    fonts: {
      heading: defaultFontRef({ family: 'Manrope' }),
      body: defaultFontRef(),
      mono: defaultFontRef({ family: 'JetBrains Mono', fallback: 'monospace' }),
    },
    typeScale: { basePx: 16, ratio: 1.25 },
    spacing: { unitPx: 8 },
    radii: { sm: '4px', md: '8px', lg: '16px', full: '9999px' },
    shadows: {
      sm: '0 1px 2px rgba(20, 20, 30, 0.06)',
      md: '0 4px 12px rgba(20, 20, 30, 0.08)',
      lg: '0 16px 40px rgba(20, 20, 30, 0.12)',
    },
    motion: { fast: '150ms', base: '250ms', slow: '400ms', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  }
}

export function defaultNavConfig(overrides: Partial<NavConfig> = {}): NavConfig {
  return { layout: 'top', logoText: 'Katachi', links: [], ...overrides }
}

export function defaultBlock(type: string, props: Record<string, unknown> = {}): Block {
  return { id: createId(), type, props }
}

export function defaultSection(
  type: string,
  variant: string,
  props: Record<string, unknown> = {},
): Section {
  return { id: createId(), type, variant, props, blocks: [] }
}

export function defaultBackgroundLayer(
  type: BackgroundLayerType,
  props: Record<string, unknown> = {},
): BackgroundLayer {
  return { id: createId(), type, props }
}

export function defaultPage(overrides: Partial<Page> = {}): Page {
  return { id: createId(), slug: '', title: 'Home', sections: [], ...overrides }
}

export function defaultPortfolioMeta(overrides: Partial<PortfolioMeta> = {}): PortfolioMeta {
  return { title: 'My portfolio', ...overrides }
}

export function defaultPortfolioConfig(overrides: Partial<PortfolioConfig> = {}): PortfolioConfig {
  return {
    version: 1,
    theme: defaultThemeTokens(),
    nav: defaultNavConfig(),
    pages: [defaultPage()],
    meta: defaultPortfolioMeta(),
    ...overrides,
  }
}
