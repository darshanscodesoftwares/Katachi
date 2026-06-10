import { createId, defaultSection, z } from '@katachi/schema'
import type { ContentField } from '../../registry'

const projectSchema = z.object({
  id: z.string().default(''),
  title: z.string().default('Project title'),
  description: z.string().default('One or two lines about what this project is.'),
  tags: z.string().default(''), // comma-separated for the Phase 1 inspector
  imageUrl: z.string().default(''),
  href: z.string().default(''),
})

export const projectsGridPropsSchema = z.object({
  heading: z.string().default('Selected projects'),
  projects: z.array(projectSchema).default([]),
})

export type ProjectsGridProps = z.output<typeof projectsGridPropsSchema>

export const projectsGridContentFields: ContentField[] = [
  { kind: 'text', key: 'heading', label: 'Heading' },
  {
    kind: 'list',
    key: 'projects',
    label: 'Projects',
    itemLabelKey: 'title',
    itemFields: [
      { kind: 'text', key: 'title', label: 'Title' },
      { kind: 'textarea', key: 'description', label: 'Description' },
      { kind: 'text', key: 'tags', label: 'Tags (comma-separated)' },
      { kind: 'text', key: 'imageUrl', label: 'Image URL' },
      { kind: 'text', key: 'href', label: 'Link' },
    ],
    createItem: () => ({
      id: createId(),
      title: 'New project',
      description: '',
      tags: '',
      imageUrl: '',
      href: '',
    }),
  },
]

export function createProjectsGridSection() {
  const section = defaultSection('projectsGrid', 'cards', {
    heading: 'Selected projects',
    projects: [
      {
        id: createId(),
        title: 'Project one',
        description: 'A short description of this project and the problem it solves.',
        tags: 'design, web',
        imageUrl: '',
        href: '',
      },
      {
        id: createId(),
        title: 'Project two',
        description: 'Another piece of work you are proud of.',
        tags: 'typescript',
        imageUrl: '',
        href: '',
      },
    ],
  })
  section.label = 'Projects'
  return section
}
