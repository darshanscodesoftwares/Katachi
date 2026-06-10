import type { SectionRenderProps } from '../../registry'
import type { SkillsProps } from './schema'

export function Skills({ props }: SectionRenderProps<SkillsProps>) {
  return (
    <div className="ka-skills ka-skills--badge-cloud">
      <h2 className="ka-heading">{props.heading}</h2>
      <ul className="ka-skills__cloud">
        {props.skills.map((skill, i) => (
          <li key={skill.id || i} className="ka-skills__badge">
            {skill.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
