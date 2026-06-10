import type {
  ColorValue,
  StyleOverrides,
  ThemeTokens,
  ThemeTokensOverride,
} from '@katachi/schema'

/**
 * The style cascade (CLAUDE.md §7). Pure functions only — this module is the
 * most-reused code in the project and must stay free of React/DOM/env access.
 */

/** Spacing scale multipliers (CLAUDE.md §6): scale = unitPx × step. */
export const SPACING_STEPS = [0.5, 1, 2, 3, 4, 6, 8, 12, 16] as const

/** Type scale: name → exponent n in size = basePx * ratio^n. */
export const TYPE_SCALE_STEPS: ReadonlyArray<readonly [string, number]> = [
  ['xs', -2],
  ['sm', -1],
  ['base', 0],
  ['lg', 1],
  ['xl', 2],
  ['2xl', 3],
  ['3xl', 4],
  ['4xl', 5],
]

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : override) as T
  }
  const out: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue
    out[key] = isPlainObject(value) && isPlainObject(out[key]) ? deepMerge(out[key], value) : value
  }
  return out as T
}

/** Deep-merge theme overrides in cascade order: global → page → section. */
export function mergeTheme(
  theme: ThemeTokens,
  ...overrides: Array<ThemeTokensOverride | undefined>
): ThemeTokens {
  return overrides.reduce<ThemeTokens>((acc, override) => deepMerge(acc, override), theme)
}

/** camelCase / dotted token key → kebab-case CSS identifier. */
function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/\./g, '-')
}

function fontStack(font: { family: string; fallback: string }): string {
  return `"${font.family}", ${font.fallback}`
}

function spacingVarName(step: number): string {
  return `--space-${String(step).replace('.', '-')}`
}

/**
 * Resolve the token cascade to a flat CSS-variable map, e.g.
 * `--color-primary`, `--font-heading`, `--space-4`, `--radius-md`, `--text-xl`.
 * Applied as inline style on each section wrapper.
 */
export function resolveTokens(
  theme: ThemeTokens,
  pageOverride?: ThemeTokensOverride,
  sectionOverride?: ThemeTokensOverride,
): Record<string, string> {
  const t = mergeTheme(theme, pageOverride, sectionOverride)
  const vars: Record<string, string> = {}

  for (const [key, value] of Object.entries(t.colors)) {
    vars[`--color-${kebab(key)}`] = value
  }

  vars['--font-heading'] = fontStack(t.fonts.heading)
  vars['--font-body'] = fontStack(t.fonts.body)
  vars['--font-mono'] = t.fonts.mono ? fontStack(t.fonts.mono) : 'monospace'

  for (const [name, n] of TYPE_SCALE_STEPS) {
    const px = t.typeScale.basePx * Math.pow(t.typeScale.ratio, n)
    vars[`--text-${name}`] = `${Number(px.toFixed(2))}px`
  }

  for (const step of SPACING_STEPS) {
    vars[spacingVarName(step)] = `${Number((t.spacing.unitPx * step).toFixed(2))}px`
  }

  for (const [key, value] of Object.entries(t.radii)) vars[`--radius-${kebab(key)}`] = value
  for (const [key, value] of Object.entries(t.shadows)) vars[`--shadow-${kebab(key)}`] = value
  for (const [key, value] of Object.entries(t.motion)) vars[`--motion-${kebab(key)}`] = value

  return vars
}

const TOKEN_GROUP_PREFIX: Record<string, string> = {
  colors: 'color',
  fonts: 'font',
  radii: 'radius',
  shadows: 'shadow',
  motion: 'motion',
  spacing: 'space',
  typeScale: 'text',
}

/**
 * Token ref → `var(--…)`. Always a var reference, never a literal value, so
 * anything built from token refs re-themes instantly when the palette changes.
 */
export function tokenToVar(token: string): string {
  const dot = token.indexOf('.')
  if (dot === -1) return `var(--${kebab(token)})`
  const group = token.slice(0, dot)
  const rest = token.slice(dot + 1)
  const prefix = TOKEN_GROUP_PREFIX[group] ?? kebab(group)
  return `var(--${prefix}-${kebab(rest)})`
}

/** Resolve a ColorValue: raw CSS strings pass through, token refs become var() references. */
export function resolveColorValue(value: ColorValue): string {
  return typeof value === 'string' ? value : tokenToVar(value.token)
}

/** Loose CSS property bag, compatible with React's `style` prop. */
export type CssProps = Record<string, string | number>

const FONT_FAMILY_VARS = {
  heading: 'var(--font-heading)',
  body: 'var(--font-body)',
  mono: 'var(--font-mono)',
} as const

/**
 * Map StyleOverrides to inline CSS properties (token refs → var()).
 * Pseudo/stateful fields (hover, entrance, customCss, responsive, hideOn)
 * need class generation and land with the Phase 3 inspector.
 */
export function styleToCss(style?: StyleOverrides): CssProps {
  if (!style) return {}
  const css: CssProps = {}

  const sides = (prop: string, values?: { top?: string; right?: string; bottom?: string; left?: string }) => {
    if (!values) return
    if (values.top !== undefined) css[`${prop}Top`] = values.top
    if (values.right !== undefined) css[`${prop}Right`] = values.right
    if (values.bottom !== undefined) css[`${prop}Bottom`] = values.bottom
    if (values.left !== undefined) css[`${prop}Left`] = values.left
  }

  sides('padding', style.padding)
  sides('margin', style.margin)
  if (style.width !== undefined) css.width = style.width
  if (style.maxWidth !== undefined) css.maxWidth = style.maxWidth
  if (style.minHeight !== undefined) css.minHeight = style.minHeight
  if (style.align !== undefined) css.alignItems = style.align
  if (style.gap !== undefined) css.gap = style.gap

  if (style.background !== undefined) css.background = resolveColorValue(style.background)
  if (style.border) {
    const edge = { top: 'borderTop', right: 'borderRight', bottom: 'borderBottom', left: 'borderLeft' } as const
    for (const key of ['top', 'right', 'bottom', 'left'] as const) {
      const b = style.border[key]
      if (b) css[edge[key]] = `${b.width} ${b.style} ${resolveColorValue(b.color)}`
    }
  }
  if (style.radius) {
    const corner = {
      tl: 'borderTopLeftRadius',
      tr: 'borderTopRightRadius',
      br: 'borderBottomRightRadius',
      bl: 'borderBottomLeftRadius',
    } as const
    for (const key of ['tl', 'tr', 'br', 'bl'] as const) {
      const r = style.radius[key]
      if (r !== undefined) css[corner[key]] = r
    }
  }
  if (style.shadow?.length) css.boxShadow = style.shadow.join(', ')
  if (style.opacity !== undefined) css.opacity = style.opacity
  if (style.backdropBlur !== undefined) css.backdropFilter = `blur(${style.backdropBlur})`
  if (style.blendMode !== undefined) css.mixBlendMode = style.blendMode

  if (style.color !== undefined) css.color = resolveColorValue(style.color)
  if (style.fontFamily !== undefined) css.fontFamily = FONT_FAMILY_VARS[style.fontFamily]
  if (style.fontSize !== undefined) css.fontSize = style.fontSize
  if (style.fontWeight !== undefined) css.fontWeight = style.fontWeight
  if (style.lineHeight !== undefined) css.lineHeight = style.lineHeight
  if (style.letterSpacing !== undefined) css.letterSpacing = style.letterSpacing
  if (style.textTransform !== undefined) css.textTransform = style.textTransform
  if (style.textAlign !== undefined) css.textAlign = style.textAlign
  if (style.textShadow !== undefined) css.textShadow = style.textShadow

  if (style.gradientText) {
    const { from, to, angle } = style.gradientText
    css.background = `linear-gradient(${angle}deg, ${resolveColorValue(from)}, ${resolveColorValue(to)})`
    css.WebkitBackgroundClip = 'text'
    css.backgroundClip = 'text'
    css.color = 'transparent'
  }

  if (style.sticky) {
    css.position = 'sticky'
    css.top = '0'
  }
  if (style.zIndex !== undefined) css.zIndex = style.zIndex

  return css
}
