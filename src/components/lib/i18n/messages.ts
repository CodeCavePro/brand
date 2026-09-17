/* The text brand components render that no caller passes in: validation
 * errors, button titles, landmark names and the names of icon-only controls.
 *
 * English is built in, so a consumer that provides nothing renders what these
 * components always rendered. A site in another language hands its translation
 * to provideBrandMessages() once, from its Vue app entrypoint, instead of
 * threading one prop per string through every call site.
 *
 * WHY THE APP ENTRYPOINT AND NOT A PARENT COMPONENT. Astro renders every island,
 * and every component it renders without a client directive, as a separate Vue
 * app, so a provide() in one component reaches nothing in the next. The app
 * entrypoint is the one place each of those apps passes through, on the server
 * and in the browser alike:
 *
 *   // astro.config.mjs
 *   vue({ appEntrypoint: '/src/pages/_app' })
 *
 *   // src/pages/_app.ts
 *   export default (app: App) => provideBrandMessages(app, russian)
 *
 * A {name} in a string is filled by formatMessage(). A translation keeps every
 * placeholder and puts it wherever its grammar needs. */
import { inject, type App, type InjectionKey } from 'vue'

export interface BrandMessages {
  contactForm: {
    /** A required field left empty. */
    required: string
    invalidEmail: string
    invalidLinkedIn: string
    /** {max}: the field's character limit. */
    tooLong: string
    /** The submit button. */
    submit: string
    /** The alert after a submission the CRM accepted. */
    sent: string
    /** The alert after a submission that failed. */
    notSent: string
    /** Accessible name of the button that dismisses either alert. */
    closeAlert: string
  }
  articlePreview: {
    /** {minutes}: the article's reading time. */
    readingTime: string
  }
  technologyCard: {
    /** The link to the service a card names. */
    explore: string
  }
  brandNav: {
    /** Accessible name of the top bar's navigation landmark. */
    label: string
  }
  subNavbar: {
    /** Accessible name of the section bar's navigation landmark. */
    label: string
  }
  mobileMenu: {
    /** Accessible name of the burger button that opens and closes the drawer. */
    toggle: string
    /** Accessible name of the button that leaves the services list. */
    back: string
  }
  review: {
    /** {name}: the reviewer. Accessible name of the link to their LinkedIn. */
    linkedin: string
  }
}

/** Any subset of the strings, by group. What is left out stays English. */
export type BrandMessagesOverride = {
  [Group in keyof BrandMessages]?: Partial<BrandMessages[Group]>
}

export const ENGLISH_BRAND_MESSAGES: BrandMessages = {
  contactForm: {
    required: 'This field is required',
    invalidEmail: 'Please enter valid email',
    invalidLinkedIn: 'Please enter valid LinkedIn page link',
    tooLong: 'You faced characters limits. Max length is {max}',
    submit: 'Leave consultation request',
    sent: 'Sent! We will contact you within next 1-3 business days.',
    notSent: 'We could not send your request. Please try again, or email us at hello@codecave.pro.',
    closeAlert: 'Close',
  },
  articlePreview: {
    readingTime: 'Reading time: {minutes} m.',
  },
  technologyCard: {
    explore: 'Explore service',
  },
  brandNav: {
    label: 'Main',
  },
  subNavbar: {
    label: 'Section',
  },
  mobileMenu: {
    toggle: 'Menu',
    back: 'Back',
  },
  review: {
    linkedin: '{name} on LinkedIn',
  },
}

/* Symbol.for rather than Symbol(): the key has to be the same value in the
 * module the site's entrypoint imports and the one each component imports, and
 * a consumer that aliases this package at a local build can load it twice. */
const KEY = Symbol.for('codecave.brand.messages') as InjectionKey<BrandMessages>

/** Makes every brand component in `app` render `messages`, English where they leave a string out. */
export const provideBrandMessages = (app: App, messages: BrandMessagesOverride): void => {
  const merged = Object.fromEntries(
    Object.entries(ENGLISH_BRAND_MESSAGES).map(([group, strings]) => [
      group,
      { ...strings, ...messages[group as keyof BrandMessages] },
    ]),
  ) as unknown as BrandMessages
  app.provide(KEY, merged)
}

/** The strings a component renders. Call it in setup. */
export const useBrandMessages = (): BrandMessages => inject(KEY, ENGLISH_BRAND_MESSAGES)

/** Fills the {name} placeholders of a message. A placeholder with no value is left as written. */
export const formatMessage = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : placeholder)
