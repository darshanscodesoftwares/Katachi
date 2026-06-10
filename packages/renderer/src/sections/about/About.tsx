import type { SectionRenderProps } from '../../registry'
import type { AboutProps } from './schema'

export function About({ props }: SectionRenderProps<AboutProps>) {
  const paragraphs = props.body.split(/\n\s*\n/).filter(Boolean)
  return (
    <div className={`ka-about ka-about--text-portrait${props.portraitUrl ? '' : ' ka-about--no-portrait'}`}>
      <div className="ka-about__text">
        <h2 className="ka-heading">{props.heading}</h2>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {props.portraitUrl ? (
        <div className="ka-about__portrait">
          <img src={props.portraitUrl} alt={props.portraitAlt} loading="lazy" />
        </div>
      ) : null}
    </div>
  )
}
