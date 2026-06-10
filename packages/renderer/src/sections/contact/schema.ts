import { defaultSection, z } from '@katachi/schema'
import type { ContentField } from '../../registry'

export const contactPropsSchema = z.object({
  heading: z.string().default('Get in touch'),
  intro: z.string().default('Have a project in mind? Send me a message.'),
  email: z.string().default(''),
  submitLabel: z.string().default('Send message'),
  // The shell owns URLs; this default matches apps/web's API route.
  actionUrl: z.string().default('/api/contact'),
})

export type ContactProps = z.output<typeof contactPropsSchema>

export const contactContentFields: ContentField[] = [
  { kind: 'text', key: 'heading', label: 'Heading' },
  { kind: 'textarea', key: 'intro', label: 'Intro' },
  { kind: 'text', key: 'email', label: 'Fallback email (shown under the form)' },
  { kind: 'text', key: 'submitLabel', label: 'Submit button label' },
]

export function createContactSection() {
  const section = defaultSection('contact', 'form', contactPropsSchema.parse({}))
  section.label = 'Contact'
  return section
}
