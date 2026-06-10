import { createId, defaultSection, z } from '@katachi/schema'
import type { ContentField } from '../../registry'

const ctaSchema = z.object({
  id: z.string().default(''),
  label: z.string().default('Get in touch'),
  href: z.string().default('#contact'),
})

export const heroPropsSchema = z.object({
  name: z.string().default('Your Name'),
  tagline: z.string().default('I design and build things for the web.'),
  ctas: z.array(ctaSchema).default([]),
})

export type HeroProps = z.output<typeof heroPropsSchema>

export const heroContentFields: ContentField[] = [
  { kind: 'text', key: 'name', label: 'Name' },
  { kind: 'textarea', key: 'tagline', label: 'Tagline' },
  {
    kind: 'list',
    key: 'ctas',
    label: 'CTA buttons',
    itemLabelKey: 'label',
    itemFields: [
      { kind: 'text', key: 'label', label: 'Label' },
      { kind: 'text', key: 'href', label: 'Link' },
    ],
    createItem: () => ({ id: createId(), label: 'New button', href: '#' }),
  },
]

export function createHeroSection() {
  const section = defaultSection('hero', 'centered', {
    name: 'Your Name',
    tagline: 'I design and build things for the web.',
    ctas: [{ id: createId(), label: 'Get in touch', href: '#contact' }],
  })
  section.label = 'Hero'
  return section
}
