import { describe, expect, it } from 'vitest'
import {
  backgroundLayerSchema,
  blockSchema,
  conditionSchema,
  defaultPortfolioConfig,
  defaultSection,
  defaultThemeTokens,
  parsePortfolioConfig,
  portfolioConfigSchema,
  safeParsePortfolioConfig,
  sectionSchema,
  styleOverridesSchema,
  themeTokensOverrideSchema,
  themeTokensSchema,
} from '../index'

describe('defaults', () => {
  it('defaultPortfolioConfig validates against portfolioConfigSchema', () => {
    expect(() => parsePortfolioConfig(defaultPortfolioConfig())).not.toThrow()
  })

  it('defaultThemeTokens validates and allows extra swatches', () => {
    const theme = defaultThemeTokens()
    theme.colors.brandPink = '#ff66aa'
    expect(themeTokensSchema.parse(theme).colors.brandPink).toBe('#ff66aa')
  })

  it('generates unique ids', () => {
    const a = defaultSection('hero', 'centered')
    const b = defaultSection('hero', 'centered')
    expect(a.id).not.toBe(b.id)
  })
})

describe('portfolioConfigSchema', () => {
  it('rejects unknown schema versions', () => {
    const config = { ...defaultPortfolioConfig(), version: 2 }
    expect(safeParsePortfolioConfig(config).success).toBe(false)
  })

  it('rejects a theme missing a core color', () => {
    const config = defaultPortfolioConfig()
    const { primary: _dropped, ...rest } = config.theme.colors
    const broken = { ...config, theme: { ...config.theme, colors: rest } }
    expect(portfolioConfigSchema.safeParse(broken).success).toBe(false)
  })

  it('round-trips a config with sections, blocks and backgrounds', () => {
    const config = defaultPortfolioConfig()
    const section = defaultSection('hero', 'centered', { name: 'Ada' })
    section.background = [{ id: 'bg1', type: 'gradient', props: { from: { token: 'colors.primary' } } }]
    section.blocks = [
      {
        id: 'b1',
        type: 'stack',
        props: {},
        children: [{ id: 'b2', type: 'badge', props: { label: 'hi' } }],
      },
    ]
    config.pages[0]!.sections.push(section)
    const parsed = parsePortfolioConfig(JSON.parse(JSON.stringify(config)))
    expect(parsed.pages[0]!.sections[0]!.blocks[0]!.children![0]!.type).toBe('badge')
  })
})

describe('styleOverridesSchema', () => {
  it('accepts token refs and raw CSS for ColorValue fields', () => {
    const style = {
      background: { token: 'colors.surface' },
      color: '#fff',
      padding: { top: '8px', bottom: '8px' },
      radius: { tl: '4px', br: '12px' },
      shadow: ['0 1px 2px rgba(0,0,0,0.2)', 'inset 0 0 0 1px #000'],
    }
    expect(styleOverridesSchema.safeParse(style).success).toBe(true)
  })

  it('rejects out-of-range opacity', () => {
    expect(styleOverridesSchema.safeParse({ opacity: 1.5 }).success).toBe(false)
  })
})

describe('conditionSchema', () => {
  it('accepts every condition flavor and rejects unknown types', () => {
    expect(conditionSchema.safeParse({ type: 'always' }).success).toBe(true)
    expect(conditionSchema.safeParse({ type: 'hidden' }).success).toBe(true)
    expect(conditionSchema.safeParse({ type: 'breakpoint', show: ['mobile'] }).success).toBe(true)
    expect(conditionSchema.safeParse({ type: 'dateRange', from: '2026-01-01' }).success).toBe(true)
    expect(conditionSchema.safeParse({ type: 'nope' }).success).toBe(false)
  })
})

describe('themeTokensOverrideSchema', () => {
  it('accepts sparse deep partials', () => {
    const override = { colors: { primary: '#123456' }, typeScale: { ratio: 1.333 } }
    expect(themeTokensOverrideSchema.safeParse(override).success).toBe(true)
  })

  it('accepts partial font refs', () => {
    const override = { fonts: { heading: { family: 'Lora' } } }
    expect(themeTokensOverrideSchema.safeParse(override).success).toBe(true)
  })
})

describe('recursive blocks', () => {
  it('validates deep nesting', () => {
    const block = {
      id: '1',
      type: 'grid',
      props: {},
      children: [
        { id: '2', type: 'stack', props: {}, children: [{ id: '3', type: 'badge', props: {} }] },
      ],
    }
    expect(blockSchema.safeParse(block).success).toBe(true)
  })
})

describe('section + background', () => {
  it('rejects unknown background layer types', () => {
    expect(
      backgroundLayerSchema.safeParse({ id: 'x', type: 'lava-lamp', props: {} }).success,
    ).toBe(false)
  })

  it('requires props and blocks on sections', () => {
    expect(sectionSchema.safeParse({ id: 's', type: 'hero', variant: 'centered' }).success).toBe(
      false,
    )
  })
})
