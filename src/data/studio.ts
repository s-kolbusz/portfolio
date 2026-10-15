// stronypodhale.pl — the web studio the owner runs. Local websites for Podhale
// firms are its market, so client work for them is described there and this site
// links to it (SEB-19, SEB-20, SEB-21, SEB-66).
//
// Loaded by next.config.ts through project-redirects.ts: relative imports only.

export const STUDIO = {
  /** The node stronypodhale.pl declares for itself; its `founder` points back here. */
  id: 'https://stronypodhale.pl/#business',
  name: 'stronypodhale.pl',
  url: 'https://stronypodhale.pl/',
  pages: {
    /** The company-site offer, which shows the catalogue projects as its examples. */
    companySite: 'https://stronypodhale.pl/strona-firmowa/',
    /** The work section of the home page, for projects no offer page shows. */
    work: 'https://stronypodhale.pl/#realizacje',
  },
} as const

/**
 * `rel` for links to the studio. No `noreferrer` on purpose — elsewhere external
 * links carry it — so stronypodhale.pl's analytics can see a visit came from here.
 * `noopener` is all `target="_blank"` needs.
 */
export const STUDIO_LINK_REL = 'noopener'
