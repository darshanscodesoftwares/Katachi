import type { SectionRenderProps } from '../../registry'
import type { ContactProps } from './schema'

/**
 * Plain HTML form, zero client JS: posts to the shell's API route, which
 * redirects back with ?sent=1. In Studio mode the fieldset is disabled so
 * canvas clicks can't fire real submissions.
 */
export function Contact({ props, ctx }: SectionRenderProps<ContactProps>) {
  return (
    <div className="ka-contact ka-contact--form" id="contact">
      <h2 className="ka-heading">{props.heading}</h2>
      {props.intro ? <p className="ka-contact__intro">{props.intro}</p> : null}
      <form className="ka-contact__form" action={props.actionUrl} method="post">
        <fieldset className="ka-contact__fields" disabled={ctx.mode === 'studio'}>
          {ctx.portfolioId ? <input type="hidden" name="portfolioId" value={ctx.portfolioId} /> : null}
          <label className="ka-field">
            <span className="ka-field__label">Name</span>
            <input className="ka-field__input" type="text" name="name" required maxLength={200} />
          </label>
          <label className="ka-field">
            <span className="ka-field__label">Email</span>
            <input className="ka-field__input" type="email" name="email" required maxLength={320} />
          </label>
          <label className="ka-field">
            <span className="ka-field__label">Message</span>
            <textarea className="ka-field__input" name="message" rows={5} required maxLength={5000} />
          </label>
          <button className="ka-btn ka-btn--solid" type="submit">
            {props.submitLabel}
          </button>
        </fieldset>
      </form>
      {props.email ? (
        <p className="ka-contact__fallback">
          Or email me directly: <a href={`mailto:${props.email}`}>{props.email}</a>
        </p>
      ) : null}
    </div>
  )
}
