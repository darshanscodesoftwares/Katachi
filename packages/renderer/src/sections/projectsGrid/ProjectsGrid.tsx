import type { SectionRenderProps } from '../../registry'
import type { ProjectsGridProps } from './schema'

function splitTags(tags: string): string[] {
  return tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export function ProjectsGrid({ props }: SectionRenderProps<ProjectsGridProps>) {
  return (
    <div className="ka-projects ka-projects--cards">
      <h2 className="ka-heading">{props.heading}</h2>
      <ul className="ka-projects__grid">
        {props.projects.map((project, i) => {
          const tags = splitTags(project.tags)
          const card = (
            <>
              {project.imageUrl ? (
                <img className="ka-projects__image" src={project.imageUrl} alt="" loading="lazy" />
              ) : null}
              <div className="ka-projects__body">
                <h3 className="ka-projects__title">{project.title}</h3>
                {project.description ? <p className="ka-projects__desc">{project.description}</p> : null}
                {tags.length > 0 ? (
                  <ul className="ka-tags">
                    {tags.map((tag) => (
                      <li key={tag} className="ka-tag">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </>
          )
          return (
            <li key={project.id || i} className="ka-projects__card">
              {project.href ? (
                <a className="ka-projects__link" href={project.href}>
                  {card}
                </a>
              ) : (
                card
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
