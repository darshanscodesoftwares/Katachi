import type { SectionDefinition } from '../../registry'
import { Hero } from './Hero'
import { createHeroSection, heroContentFields, heroPropsSchema, type HeroProps } from './schema'

export const heroDefinition: SectionDefinition<HeroProps> = {
  type: 'hero',
  label: 'Hero',
  variants: ['centered'],
  propsSchema: heroPropsSchema,
  contentFields: heroContentFields,
  create: createHeroSection,
  component: Hero,
}
