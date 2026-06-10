import type { SectionRenderProps } from '../../registry'
import type { ExperienceTimelineProps } from './schema'

export function ExperienceTimeline({ props }: SectionRenderProps<ExperienceTimelineProps>) {
  return (
    <div className="ka-timeline ka-timeline--vertical">
      <h2 className="ka-heading">{props.heading}</h2>
      <ol className="ka-timeline__list">
        {props.items.map((item, i) => (
          <li key={item.id || i} className="ka-timeline__item">
            <div className="ka-timeline__marker" aria-hidden="true" />
            <div className="ka-timeline__content">
              <div className="ka-timeline__head">
                <h3 className="ka-timeline__role">{item.role}</h3>
                <span className="ka-timeline__company">{item.company}</span>
                {item.period ? <span className="ka-timeline__period">{item.period}</span> : null}
              </div>
              {item.description ? <p className="ka-timeline__desc">{item.description}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
