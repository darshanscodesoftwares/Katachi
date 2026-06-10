import { z } from 'zod'

export const backgroundLayerTypes = [
  'color',
  'gradient',
  'image',
  'svgPattern',
  'noise',
  'particles',
  'video',
  'shader',
] as const

export type BackgroundLayerType = (typeof backgroundLayerTypes)[number]

export type BackgroundLayer = {
  id: string
  type: BackgroundLayerType
  props: Record<string, unknown> // colors as ColorValue (token refs!), speed, density, angle…
  opacity?: number
  blendMode?: string
  parallax?: number // 0 = fixed with content, 1 = full parallax
}

export const backgroundLayerSchema: z.ZodType<BackgroundLayer> = z.object({
  id: z.string(),
  type: z.enum(backgroundLayerTypes),
  props: z.record(z.string(), z.unknown()),
  opacity: z.number().min(0).max(1).optional(),
  blendMode: z.string().optional(),
  parallax: z.number().optional(),
})
