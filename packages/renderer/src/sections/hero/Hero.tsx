import type { SectionRenderProps } from '../../registry'
import type { HeroProps } from './schema'

export function Hero({ props }: SectionRenderProps<HeroProps>) {
  // Phase 1 variant: 'centered'. 'split' and 'full-bleed' arrive in Phase 2.
  return (
    <div className="ka-hero ka-hero--centered">
      <h1 className="ka-hero__name">{props.name}</h1>
      {props.tagline ? <p className="ka-hero__tagline">{props.tagline}</p> : null}
      {props.ctas.length > 0 ? (
        <div className="ka-hero__ctas">
          {props.ctas.map((cta, i) => (
            <a key={cta.id || i} className={i === 0 ? 'ka-btn ka-btn--solid' : 'ka-btn ka-btn--outline'} href={cta.href}>
              {cta.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
