// The ways to reach Sebastian, in the order the contact section lists them under the e-mail.
// `labelKey` is a key in the `contact` messages; `handle` is what the section shows in large type.

export const CONTACT_EMAIL = 'office@kolbusz.xyz'

interface ContactLink {
  id: string
  labelKey: string
  url: string
  handle: string
  /** opens another site (gets ↗ and a new tab) */
  external: boolean
}

export const contactLinks: ContactLink[] = [
  {
    // the number from the public CV; on the site since 2026-11-24 (owner's yes)
    id: 'phone',
    labelKey: 'phone',
    url: 'tel:+48533542880',
    handle: '+48 533 542 880',
    external: false,
  },
  {
    id: 'linkedin',
    labelKey: 'linkedin',
    url: 'https://linkedin.com/in/skolbusz',
    handle: 'in/skolbusz',
    external: true,
  },
  {
    id: 'github',
    labelKey: 'github',
    url: 'https://github.com/s-kolbusz',
    handle: 's-kolbusz',
    external: true,
  },
  {
    id: 'x',
    labelKey: 'x',
    url: 'https://x.com/s_kolbusz',
    handle: '@s_kolbusz',
    external: true,
  },
]
