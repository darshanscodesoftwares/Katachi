import type { SectionDefinition } from '../../registry'
import { About } from './About'
import { aboutContentFields, aboutPropsSchema, createAboutSection, type AboutProps } from './schema'

export const aboutDefinition: SectionDefinition<AboutProps> = {
  type: 'about',
  label: 'About',
  variants: ['textPortrait'],
  propsSchema: aboutPropsSchema,
  contentFields: aboutContentFields,
  create: createAboutSection,
  component: About,
}
