import { createId, defaultSection, z } from '@katachi/schema'
import type { ContentField } from '../../registry'

const skillSchema = z.object({
  id: z.string().default(''),
  label: z.string().default('Skill'),
})

export const skillsPropsSchema = z.object({
  heading: z.string().default('Skills'),
  skills: z.array(skillSchema).default([]),
})

export type SkillsProps = z.output<typeof skillsPropsSchema>

export const skillsContentFields: ContentField[] = [
  { kind: 'text', key: 'heading', label: 'Heading' },
  {
    kind: 'list',
    key: 'skills',
    label: 'Skills',
    itemLabelKey: 'label',
    itemFields: [{ kind: 'text', key: 'label', label: 'Label' }],
    createItem: () => ({ id: createId(), label: 'New skill' }),
  },
]

export function createSkillsSection() {
  const section = defaultSection('skills', 'badgeCloud', {
    heading: 'Skills',
    skills: ['TypeScript', 'React', 'Design systems', 'Figma'].map((label) => ({
      id: createId(),
      label,
    })),
  })
  section.label = 'Skills'
  return section
}
