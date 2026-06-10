import { defaultThemeTokens } from '@katachi/schema'
import { describe, expect, it } from 'vitest'
import { mergeTheme, resolveColorValue, resolveTokens, styleToCss, tokenToVar } from './cascade'

describe('resolveTokens', () => {
  it('maps colors to --color-* vars (camelCase → kebab)', () => {
    const vars = resolveTokens(defaultThemeTokens())
    expect(vars['--color-primary']).toBe('#4f46e5')
    expect(vars['--color-text-muted']).toBe('#6b6b76')
  })

  it('includes user-defined extra swatches', () => {
    const theme = defaultThemeTokens()
    theme.colors.brandPink = '#ff66aa'
    expect(resolveTokens(theme)['--color-brand-pink']).toBe('#ff66aa')
  })

  it('builds font stacks and falls back for missing mono', () => {
    const theme = defaultThemeTokens()
    const vars = resolveTokens(theme)
    expect(vars['--font-heading']).toBe('"Manrope", sans-serif')
    expect(vars['--font-body']).toBe('"Inter", sans-serif')

    delete theme.fonts.mono
    expect(resolveTokens(theme)['--font-mono']).toBe('monospace')
  })

  it('computes the type scale as base * ratio^n', () => {
    const vars = resolveTokens(defaultThemeTokens()) // base 16, ratio 1.25
    expect(vars['--text-base']).toBe('16px')
    expect(vars['--text-xl']).toBe('25px')
    expect(vars['--text-sm']).toBe('12.8px')
  })

  it('computes the spacing scale unit × [0.5,1,2,3,4,6,8,12,16]', () => {
    const vars = resolveTokens(defaultThemeTokens()) // unit 8
    expect(vars['--space-0-5']).toBe('4px')
    expect(vars['--space-1']).toBe('8px')
    expect(vars['--space-4']).toBe('32px')
    expect(vars['--space-16']).toBe('128px')
  })

  it('emits radii, shadows and motion vars', () => {
    const vars = resolveTokens(defaultThemeTokens())
    expect(vars['--radius-md']).toBe('8px')
    expect(vars['--shadow-lg']).toContain('40px')
    expect(vars['--motion-base']).toBe('250ms')
    expect(vars['--motion-easing']).toContain('cubic-bezier')
  })

  it('deep-merges global → page → section, later wins', () => {
    const theme = defaultThemeTokens()
    const vars = resolveTokens(
      theme,
      { colors: { primary: '#111111' }, typeScale: { basePx: 18 } },
      { colors: { primary: '#222222' } },
    )
    expect(vars['--color-primary']).toBe('#222222')
    expect(vars['--text-base']).toBe('18px')
    // untouched keys survive the merge
    expect(vars['--color-accent']).toBe(theme.colors.accent)
  })

  it('does not mutate the input theme (pure function)', () => {
    const theme = defaultThemeTokens()
    const snapshot = JSON.parse(JSON.stringify(theme))
    resolveTokens(theme, { colors: { primary: '#000' } }, { spacing: { unitPx: 4 } })
    expect(theme).toEqual(snapshot)
  })
})

describe('mergeTheme', () => {
  it('merges nested font overrides without dropping siblings', () => {
    const merged = mergeTheme(defaultThemeTokens(), { fonts: { heading: { family: 'Lora' } } })
    expect(merged.fonts.heading.family).toBe('Lora')
    expect(merged.fonts.heading.fallback).toBe('sans-serif')
    expect(merged.fonts.body.family).toBe('Inter')
  })

  it('ignores undefined overrides', () => {
    const theme = defaultThemeTokens()
    expect(mergeTheme(theme, undefined, undefined)).toEqual(theme)
  })
})

describe('tokenToVar / resolveColorValue', () => {
  it('resolves token refs to var() references, never literals', () => {
    expect(tokenToVar('colors.primary')).toBe('var(--color-primary)')
    expect(tokenToVar('colors.textMuted')).toBe('var(--color-text-muted)')
    expect(tokenToVar('fonts.heading')).toBe('var(--font-heading)')
    expect(tokenToVar('radii.md')).toBe('var(--radius-md)')
    expect(tokenToVar('shadows.sm')).toBe('var(--shadow-sm)')
    expect(tokenToVar('spacing.4')).toBe('var(--space-4)')
    expect(tokenToVar('motion.base')).toBe('var(--motion-base)')
  })

  it('passes raw CSS strings through untouched', () => {
    expect(resolveColorValue('#abcdef')).toBe('#abcdef')
    expect(resolveColorValue('rgb(0 0 0 / 50%)')).toBe('rgb(0 0 0 / 50%)')
    expect(resolveColorValue({ token: 'colors.accent' })).toBe('var(--color-accent)')
  })
})

describe('styleToCss', () => {
  it('returns an empty object for undefined style', () => {
    expect(styleToCss(undefined)).toEqual({})
  })

  it('maps per-side padding/margin and box fields', () => {
    const css = styleToCss({
      padding: { top: '8px', left: '16px' },
      margin: { bottom: '24px' },
      maxWidth: '960px',
      gap: '12px',
      align: 'center',
    })
    expect(css.paddingTop).toBe('8px')
    expect(css.paddingLeft).toBe('16px')
    expect(css.marginBottom).toBe('24px')
    expect(css.maxWidth).toBe('960px')
    expect(css.gap).toBe('12px')
    expect(css.alignItems).toBe('center')
    expect(css).not.toHaveProperty('paddingRight')
  })

  it('resolves ColorValue token refs in surface/text fields', () => {
    const css = styleToCss({
      background: { token: 'colors.surface' },
      color: { token: 'colors.primary' },
      fontFamily: 'heading',
    })
    expect(css.background).toBe('var(--color-surface)')
    expect(css.color).toBe('var(--color-primary)')
    expect(css.fontFamily).toBe('var(--font-heading)')
  })

  it('joins stacked shadows and builds per-side borders / per-corner radii', () => {
    const css = styleToCss({
      shadow: ['0 1px 2px #0002', 'inset 0 0 0 1px #0001'],
      border: { top: { width: '1px', style: 'solid', color: { token: 'colors.border' } } },
      radius: { tl: '4px', br: '12px' },
    })
    expect(css.boxShadow).toBe('0 1px 2px #0002, inset 0 0 0 1px #0001')
    expect(css.borderTop).toBe('1px solid var(--color-border)')
    expect(css.borderTopLeftRadius).toBe('4px')
    expect(css.borderBottomRightRadius).toBe('12px')
    expect(css).not.toHaveProperty('borderBottom')
  })

  it('builds gradient text and sticky behavior', () => {
    const css = styleToCss({
      gradientText: { from: { token: 'colors.primary' }, to: '#fff', angle: 45 },
      sticky: true,
      zIndex: 5,
    })
    expect(css.background).toBe('linear-gradient(45deg, var(--color-primary), #fff)')
    expect(css.backgroundClip).toBe('text')
    expect(css.color).toBe('transparent')
    expect(css.position).toBe('sticky')
    expect(css.zIndex).toBe(5)
  })
})
