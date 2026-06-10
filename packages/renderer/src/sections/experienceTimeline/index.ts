import type { SectionDefinition } from '../../registry'
import { ExperienceTimeline } from './ExperienceTimeline'
import {
  createExperienceTimelineSection,
  experienceTimelineContentFields,
  experienceTimelinePropsSchema,
  type ExperienceTimelineProps,
} from './schema'

export const experienceTimelineDefinition: SectionDefinition<ExperienceTimelineProps> = {
  type: 'experienceTimeline',
  label: 'Experience timeline',
  variants: ['verticalLine'],
  propsSchema: experienceTimelinePropsSchema,
  contentFields: experienceTimelineContentFields,
  create: createExperienceTimelineSection,
  component: ExperienceTimeline,
}
