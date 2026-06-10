import type { SectionDefinition } from '../../registry'
import { Contact } from './Contact'
import { contactContentFields, contactPropsSchema, createContactSection, type ContactProps } from './schema'

export const contactDefinition: SectionDefinition<ContactProps> = {
  type: 'contact',
  label: 'Contact',
  variants: ['form'],
  propsSchema: contactPropsSchema,
  contentFields: contactContentFields,
  create: createContactSection,
  component: Contact,
}
