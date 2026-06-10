import { z } from 'zod'

// Any color-ish value may be a raw CSS value OR a token reference.
// Token refs are what make SVG/CSS backgrounds re-theme automatically.
export type ColorValue = string | { token: string } // e.g. { token: 'colors.primary' }

export const colorValueSchema: z.ZodType<ColorValue> = z.union([
  z.string(),
  z.object({ token: z.string() }),
])

export type Sides<T = string> = { top?: T; right?: T; bottom?: T; left?: T }
export type Corners<T = string> = { tl?: T; tr?: T; br?: T; bl?: T }

export function sidesSchema<T extends z.ZodTypeAny>(value: T) {
  return z.object({
    top: value.optional(),
    right: value.optional(),
    bottom: value.optional(),
    left: value.optional(),
  })
}

export function cornersSchema<T extends z.ZodTypeAny>(value: T) {
  return z.object({
    tl: value.optional(),
    tr: value.optional(),
    br: value.optional(),
    bl: value.optional(),
  })
}

export type BorderSide = { width: string; style: string; color: ColorValue }

export const borderSideSchema: z.ZodType<BorderSide> = z.object({
  width: z.string(),
  style: z.string(),
  color: colorValueSchema,
})

export const breakpoints = ['mobile', 'tablet', 'desktop'] as const
export type Breakpoint = (typeof breakpoints)[number]
export const breakpointSchema = z.enum(breakpoints)

export const entrancePresets = ['fade', 'slide-up', 'slide-left', 'zoom', 'blur-in'] as const

export type StyleOverrides = {
  // box
  padding?: Sides
  margin?: Sides
  width?: string
  maxWidth?: string
  minHeight?: string
  align?: 'start' | 'center' | 'end'
  gap?: string
  // surface
  background?: ColorValue
  border?: Sides<BorderSide>
  radius?: Corners
  shadow?: string[] // stackable, supports inset
  opacity?: number
  backdropBlur?: string // glassmorphism
  blendMode?: string
  // text
  color?: ColorValue
  fontFamily?: 'heading' | 'body' | 'mono'
  fontSize?: string
  fontWeight?: number
  lineHeight?: string
  letterSpacing?: string
  textTransform?: 'none' | 'uppercase' | 'capitalize'
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textShadow?: string
  gradientText?: { from: ColorValue; to: ColorValue; angle: number }
  // behavior
  hideOn?: Breakpoint[]
  sticky?: boolean
  zIndex?: number
  hover?: {
    background?: ColorValue
    color?: ColorValue
    shadow?: string[]
    lift?: boolean
    scale?: number
    glow?: ColorValue
  }
  entrance?: {
    preset: (typeof entrancePresets)[number]
    delayMs?: number
    durationMs?: number
    easing?: string
  }
  // escape hatch — scoped to this node's wrapper only
  customCss?: string
}

const stringSides = sidesSchema(z.string())

export const styleOverridesSchema: z.ZodType<StyleOverrides> = z.object({
  padding: stringSides.optional(),
  margin: stringSides.optional(),
  width: z.string().optional(),
  maxWidth: z.string().optional(),
  minHeight: z.string().optional(),
  align: z.enum(['start', 'center', 'end']).optional(),
  gap: z.string().optional(),
  background: colorValueSchema.optional(),
  border: sidesSchema(borderSideSchema).optional(),
  radius: cornersSchema(z.string()).optional(),
  shadow: z.array(z.string()).optional(),
  opacity: z.number().min(0).max(1).optional(),
  backdropBlur: z.string().optional(),
  blendMode: z.string().optional(),
  color: colorValueSchema.optional(),
  fontFamily: z.enum(['heading', 'body', 'mono']).optional(),
  fontSize: z.string().optional(),
  fontWeight: z.number().optional(),
  lineHeight: z.string().optional(),
  letterSpacing: z.string().optional(),
  textTransform: z.enum(['none', 'uppercase', 'capitalize']).optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  textShadow: z.string().optional(),
  gradientText: z
    .object({ from: colorValueSchema, to: colorValueSchema, angle: z.number() })
    .optional(),
  hideOn: z.array(breakpointSchema).optional(),
  sticky: z.boolean().optional(),
  zIndex: z.number().optional(),
  hover: z
    .object({
      background: colorValueSchema.optional(),
      color: colorValueSchema.optional(),
      shadow: z.array(z.string()).optional(),
      lift: z.boolean().optional(),
      scale: z.number().optional(),
      glow: colorValueSchema.optional(),
    })
    .optional(),
  entrance: z
    .object({
      preset: z.enum(entrancePresets),
      delayMs: z.number().optional(),
      durationMs: z.number().optional(),
      easing: z.string().optional(),
    })
    .optional(),
  customCss: z.string().optional(),
})
