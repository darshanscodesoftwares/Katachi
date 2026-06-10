import type { SectionDefinition } from '../../registry'
import { Skills } from './Skills'
import { createSkillsSection, skillsContentFields, skillsPropsSchema, type SkillsProps } from './schema'

export const skillsDefinition: SectionDefinition<SkillsProps> = {
  type: 'skills',
  label: 'Skills',
  variants: ['badgeCloud'],
  propsSchema: skillsPropsSchema,
  contentFields: skillsContentFields,
  create: createSkillsSection,
  component: Skills,
}
