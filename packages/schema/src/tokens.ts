import { z } from 'zod'
import type { DeepPartial } from './util'

export type FontRef = {
  family: string // "Inter" | uploaded family name
  source: 'google' | 'custom'
  url?: string // custom .woff2 asset URL
  fallback: string // "sans-serif"
}

export const fontRefSchema: z.ZodType<FontRef> = z.object({
  family: z.string(),
  source: z.enum(['google', 'custom']),
  url: z.string().optional(),
  fallback: z.string(),
})

/** Core named colors every theme must define; extra user swatches ride along as string entries. */
export const coreColorKeys = [
  'background',
  'surface',
  'text',
  'textMuted',
  'primary',
  'secondary',
  'accent',
  'border',
] as const

export type ThemeColors = {
  background: string
  surface: string
  text: string
  textMuted: string
  primary: string
  secondary: string
  accent: string
  border: string
} & Record<string, string>

export type ThemeTokens = {
  colors: ThemeColors
  fonts: { heading: FontRef; body: FontRef; mono?: FontRef }
  typeScale: { basePx: number; ratio: number } // sizes = base * ratio^n
  spacing: { unitPx: number } // scale = unit × [0.5,1,2,3,4,6,8,12,16]
  radii: { sm: string; md: string; lg: string; full: string }
  shadows: { sm: string; md: string; lg: string }
  motion: { fast: string; base: string; slow: string; easing: string }
}

const themeColorsSchema = z
  .object({
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    textMuted: z.string(),
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    border: z.string(),
  })
  .catchall(z.string())

const fontsSchema = z.object({
  heading: fontRefSchema,
  body: fontRefSchema,
  mono: fontRefSchema.optional(),
})

const typeScaleSchema = z.object({ basePx: z.number().positive(), ratio: z.number().positive() })
const spacingSchema = z.object({ unitPx: z.number().positive() })
const radiiSchema = z.object({ sm: z.string(), md: z.string(), lg: z.string(), full: z.string() })
const shadowsSchema = z.object({ sm: z.string(), md: z.string(), lg: z.string() })
const motionSchema = z.object({
  fast: z.string(),
  base: z.string(),
  slow: z.string(),
  easing: z.string(),
})

export const themeTokensSchema: z.ZodType<ThemeTokens> = z.object({
  colors: themeColorsSchema,
  fonts: fontsSchema,
  typeScale: typeScaleSchema,
  spacing: spacingSchema,
  radii: radiiSchema,
  shadows: shadowsSchema,
  motion: motionSchema,
})

/** Deep-partial ThemeTokens — the shape of page/section themeOverride. */
export type ThemeTokensOverride = DeepPartial<ThemeTokens>

const fontRefPartial = z.object({
  family: z.string().optional(),
  source: z.enum(['google', 'custom']).optional(),
  url: z.string().optional(),
  fallback: z.string().optional(),
})

export const themeTokensOverrideSchema: z.ZodType<ThemeTokensOverride> = z.object({
  colors: z.record(z.string(), z.string()).optional(),
  fonts: z
    .object({
      heading: fontRefPartial.optional(),
      body: fontRefPartial.optional(),
      mono: fontRefPartial.optional(),
    })
    .optional(),
  typeScale: typeScaleSchema.partial().optional(),
  spacing: spacingSchema.partial().optional(),
  radii: radiiSchema.partial().optional(),
  shadows: shadowsSchema.partial().optional(),
  motion: motionSchema.partial().optional(),
})
