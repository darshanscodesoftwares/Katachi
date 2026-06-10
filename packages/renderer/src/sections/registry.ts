import type { SectionDefinition } from '../registry'
import { aboutDefinition } from './about'
import { contactDefinition } from './contact'
import { experienceTimelineDefinition } from './experienceTimeline'
import { heroDefinition } from './hero'
import { projectsGridDefinition } from './projectsGrid'
import { skillsDefinition } from './skills'

/**
 * Section registry (§8): adding a folder + an entry here is ALL that is needed
 * for a type to appear in the Studio. Phase 1 sections are zero-client-JS
 * server components, so a static map ships nothing to visitors; per-type lazy
 * loading starts when the first client-interactive section lands (decision
 * logged in CLAUDE.md).
 */
export const sectionRegistry: Record<string, SectionDefinition> = {
  hero: heroDefinition,
  about: aboutDefinition,
  projectsGrid: projectsGridDefinition,
  experienceTimeline: experienceTimelineDefinition,
  skills: skillsDefinition,
  contact: contactDefinition,
}

export const sectionDefinitions: SectionDefinition[] = Object.values(sectionRegistry)
