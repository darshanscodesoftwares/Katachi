import type { SectionDefinition } from '../../registry'
import { ProjectsGrid } from './ProjectsGrid'
import {
  createProjectsGridSection,
  projectsGridContentFields,
  projectsGridPropsSchema,
  type ProjectsGridProps,
} from './schema'

export const projectsGridDefinition: SectionDefinition<ProjectsGridProps> = {
  type: 'projectsGrid',
  label: 'Projects grid',
  variants: ['cards'],
  propsSchema: projectsGridPropsSchema,
  contentFields: projectsGridContentFields,
  create: createProjectsGridSection,
  component: ProjectsGrid,
}
