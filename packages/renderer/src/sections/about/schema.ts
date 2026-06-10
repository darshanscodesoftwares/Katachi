import { defaultSection, z } from '@katachi/schema'
import type { ContentField } from '../../registry'

export const aboutPropsSchema = z.object({
  heading: z.string().default('About me'),
  body: z
    .string()
    .default('Write a short story about yourself here.\n\nSeparate paragraphs with a blank line.'),
  portraitUrl: z.string().default(''),
  portraitAlt: z.string().default(''),
})

export type AboutProps = z.output<typeof aboutPropsSchema>

export const aboutContentFields: ContentField[] = [
  { kind: 'text', key: 'heading', label: 'Heading' },
  { kind: 'textarea', key: 'body', label: 'Body (blank line = new paragraph)' },
  { kind: 'text', key: 'portraitUrl', label: 'Portrait image URL' },
  { kind: 'text', key: 'portraitAlt', label: 'Portrait alt text' },
]

export function createAboutSection() {
  const section = defaultSection('about', 'textPortrait', aboutPropsSchema.parse({}))
  section.label = 'About'
  return section
}
