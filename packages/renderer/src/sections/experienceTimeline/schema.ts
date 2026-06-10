import { createId, defaultSection, z } from '@katachi/schema'
import type { ContentField } from '../../registry'

const itemSchema = z.object({
  id: z.string().default(''),
  role: z.string().default('Role'),
  company: z.string().default('Company'),
  period: z.string().default('2024 — now'),
  description: z.string().default(''),
})

export const experienceTimelinePropsSchema = z.object({
  heading: z.string().default('Experience'),
  items: z.array(itemSchema).default([]),
})

export type ExperienceTimelineProps = z.output<typeof experienceTimelinePropsSchema>

export const experienceTimelineContentFields: ContentField[] = [
  { kind: 'text', key: 'heading', label: 'Heading' },
  {
    kind: 'list',
    key: 'items',
    label: 'Entries',
    itemLabelKey: 'role',
    itemFields: [
      { kind: 'text', key: 'role', label: 'Role' },
      { kind: 'text', key: 'company', label: 'Company' },
      { kind: 'text', key: 'period', label: 'Period' },
      { kind: 'textarea', key: 'description', label: 'Description' },
    ],
    createItem: () => ({ id: createId(), role: 'Role', company: 'Company', period: '', description: '' }),
  },
]

export function createExperienceTimelineSection() {
  const section = defaultSection('experienceTimeline', 'verticalLine', {
    heading: 'Experience',
    items: [
      {
        id: createId(),
        role: 'Your most recent role',
        company: 'Company',
        period: '2024 — now',
        description: 'What you did and the impact it had.',
      },
    ],
  })
  section.label = 'Experience'
  return section
}
