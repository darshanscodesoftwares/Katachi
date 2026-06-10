import { z } from 'zod'
import { breakpointSchema, styleOverridesSchema, type Breakpoint, type StyleOverrides } from './style'

export type Condition =
  | { type: 'always' }
  | { type: 'hidden' } // manual toggle in Studio
  | { type: 'breakpoint'; show: Breakpoint[] }
  | { type: 'dateRange'; from?: string; to?: string }

export const conditionSchema: z.ZodType<Condition> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('always') }),
  z.object({ type: z.literal('hidden') }),
  z.object({ type: z.literal('breakpoint'), show: z.array(breakpointSchema) }),
  z.object({ type: z.literal('dateRange'), from: z.string().optional(), to: z.string().optional() }),
])

export type ResponsiveOverrides = Partial<
  Record<Breakpoint, { variant?: string; style?: StyleOverrides }>
>

const responsiveEntry = z.object({
  variant: z.string().optional(),
  style: styleOverridesSchema.optional(),
})

export const responsiveOverridesSchema: z.ZodType<ResponsiveOverrides> = z.object({
  mobile: responsiveEntry.optional(),
  tablet: responsiveEntry.optional(),
  desktop: responsiveEntry.optional(),
})
