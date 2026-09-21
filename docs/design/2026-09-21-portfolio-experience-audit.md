# Portfolio redesign — current-experience audit

Date: 2026-09-21
Status: Task 1 audit complete within the scope below. Recommendations are planning
inputs, not implemented changes or a production quality certification.

Related: [Approved discovery brief](./2026-09-20-portfolio-redesign-brief.md),
[staged roadmap](./2026-09-21-portfolio-redesign-roadmap.md),
[proposed sitemap and content map](./2026-09-21-portfolio-sitemap-content-map.md).

## Main finding

The portfolio already has a recognizable expressive core: green organic form,
large serif typography, warm surfaces and responsive motion. Its weakness is the
sequence around that core. Work arrives after a substantial biography, project
browsing changes interaction model between devices, case studies return to long
technical explanations, and their endings offer another project without an
enquiry. The refinement should start with hierarchy and continuity.

There are project images in the current site. The problem is their visibility,
placement and treatment: images are hidden behind interactions on the homepage,
the large-screen work index begins with an empty preview, and case-study galleries
arrive after several text sections. Adding more decorative images alone would not
resolve this.

## Evidence and limits

The live site at [kolbusz.xyz](https://kolbusz.xyz/en) was inspected with browser
screenshots, rendered DOM geometry, navigation and selected keyboard interactions.
The local source was inspected to explain structure and route behaviour. The
deployed site was not established to be the exact local Git revision; source-only
findings are labelled accordingly.

| Surface             | 390 × 844 | 1024 × 768 | 1440 × 900 | 1920 × 1080 | 3440 × 1440 |
| ------------------- | --------- | ---------- | ---------- | ----------- | ----------- |
| Home                | Reviewed  | Reviewed   | Reviewed   | Reviewed    | Reviewed    |
| Work index          | Reviewed  | Reviewed   | Reviewed   | Reviewed    | Reviewed    |
| Zakofy case study   | Reviewed  | Reviewed   | Reviewed   | Reviewed    | Reviewed    |
| Services            | Reviewed  | Reviewed   | Reviewed   | Reviewed    | Reviewed    |
| CV                  | Reviewed  | Reviewed   | Reviewed   | Reviewed    | Reviewed    |
| Homepage calculator | Reviewed  | Reviewed   | Reviewed   | Reviewed    | Reviewed    |
| Homepage contact    | Reviewed  | Reviewed   | Reviewed   | Reviewed    | Reviewed    |

“Reviewed” means layout and visible content were inspected at that CSS viewport;
it does not mean every control was exhaustively tested. The main matrix used EN
and the light theme. Additional PL spot checks covered the phone homepage and
landscape-tablet work index. Other case studies were inventoried from source,
not audited individually across all five sizes.

These are agreed test anchors, not verified device-popularity rankings. Geometry
can differ slightly because of scrollbars, animation state and browser rendering.
Ultrawide DOM measurements confirmed a 3440-pixel viewport; the screenshot output
did not reliably display the entire width, so apparent screenshot-edge clipping
is not reported as a site defect.

Not completed in this audit: physical touch-device testing, a full keyboard or
screen-reader audit, reduced-motion testing, dark-theme matrix, zoom/intermediate
width checks, performance benchmarks, form delivery, print/PDF output, analytics
dashboard access or user research. These remain explicit prototype and release
checks. No enquiries were sent or customer data entered.

## Findings that should shape the redesign

### A1 — The homepage delays its strongest evidence

**Observed:** At 390 × 844, the work section starts roughly 2,977 CSS pixels down
the page. The About section preceding it is roughly 2,133 pixels tall. The homepage
is approximately 11,000 pixels long at this size. At larger formats work still
follows a substantial personal and technical introduction.

**Implication:** A visitor encounters a large amount of positioning and biography
before seeing evidence of the work. This conflicts with the agreed priority to let
customers and projects lead. It is a hierarchy concern, not proof of lost enquiries.

**Recommendation:** Introduction → immediately visible selected work → concise
capabilities/fit → brief personal context → enquiry. Move full experience and
technical background to About, CV and the relevant case studies. Let the first
project begin after the opening scene without another full biography chapter.

### A2 — Navigation changes identity between destinations

**Observed:** Home and CV use the icon dock. Work, case studies and Services use
Back controls without the same visible primary navigation. The phone dock contains
seven icons, including the calculator and CV, with no persistent text labels.

**Source:** The dock explicitly returns nothing on project listing, project detail
and Services routes. Services uses router history for Back. Case-study Back uses a
Work link for a tracked listing origin and browser history otherwise. The layout's
separate screen-reader navigation does not solve visible wayfinding.

**Implication:** Visitors need to learn different navigation surfaces. A direct
entry can have a Back action whose destination depends on previous browsing.

**Recommendation:** Keep Work, About and Contact available on every public page;
place Services and Lab secondarily. A contextual “All work” link supplements that
navigation. Test browser Back and restoration separately from explicit site links.

### A3 — Landscape tablet exposes the work index's weakest mode

**Observed:** At 1024 × 768 the site switches to the horizontal project book.
The Back control overlaps the English “Selected Work” heading. Long project names
wrap into narrow columns. The preview area initially instructs visitors to hover.
Selecting Zakofy opens a spread in the same URL; a second action opens the case.
On the phone, image cards link directly to the case study.

**Source:** The index changes at the `lg` width breakpoint. Table-of-contents
previews use mouse enter/leave; this component does not supply an equivalent focus
handler. This is not a physical-touch test.

**Recommendation:** Use a visual index with immediate imagery and direct case
links at every size. Explore book-like transitions as optional expression in Task
2 rather than retaining a mandatory intermediary. Choose enhancements by actual
input capability as well as available space.

### A4 — Case-study imagery competes with its own interface

**Observed:** Zakofy's hero puts portfolio title/navigation over a full screenshot
containing the customer's logo, navigation, headline and button. The phone crop
cuts through the customer's headline. This produces two overlapping interface
layers and makes the actual work harder to read.

The “Visual Overview” gallery follows Challenge, Approach, Solution and Results.
Its heading begins around 2,463 pixels down on phone and 2,773 on ultrawide. The
hero grows from roughly 591 to 1,152 pixels high across those formats.

**Recommendation:** Open with one deliberately composed client-led scene. Separate
portfolio controls from depicted website controls. Interleave visual proof with
short explanations. Define separate phone and wide-screen crops; don't assume a
desktop screenshot works as a universal cover image.

### A5 — The case-study ending has no commercial next step

**Observed:** Zakofy's content ends with previous/next project navigation. No
enquiry link or form appears in the case body. On phone, the first case's unused
previous-project half leaves an empty column, while the next project name truncates.

**Recommendation:** End every case with a concise invitation to discuss a related
project, followed by optional next work. Link to a shared Contact route. Make the
next project a usable image/title destination without reserving an empty column.

### A6 — Services and Contact pull attention away from the preferred offer

**Observed:** Services leads with the landing-page package, while the homepage
emphasizes business websites first. Its phone page is approximately 8,700 pixels
long and contains no project imagery. Pricing, technical features and lengthy
descriptions dominate. The availability line still refers to late Q1 2026.

Contact offers a mail link and equally prominent LinkedIn, GitHub and X links,
with no form. A Services enquiry link was activated by keyboard and reached the
homepage contact section successfully. The current local-brand note describes
stronypodhale as providing sites “at lower rates.”

**Recommendation:** Put complete website commissions first; support them with
relevant work. Present restrained investment guidance near the enquiry. Use one
short form plus visible email, with social profiles secondary. Describe
stronypodhale through its specialist audience and offer. Replace stale availability
with wording backed by an explicit review date or omit date-sensitive wording.

### A7 — The calculator is useful but interrupts the main story

**Observed:** The calculator is a substantial homepage chapter before Contact,
with a dock item at the same navigation level as projects and services. The native
Width slider responded to an arrow key and recalculated the displayed estimate.
The tool has an existing quote action.

**Recommendation:** Preserve it as a functioning Lab project with its own optional
print enquiry. Keep a modest route into Lab from the wider site. Relocation should
not remove the calculator or its commercial usefulness.

### A8 — Fixed controls need a shared layout contract

**Observed:** At 1024 × 768 the CV's Print / Save PDF control overlaps the
theme/language control. The project-index Back/title collision is another example
of fixed chrome competing with page content.

The CV's bounded paper-like layout is appropriate for a document. Ultrawide page
content commonly remains in central capped containers; that alone is not a defect.

**Recommendation:** Reserve space for navigation and utilities in the shared shell.
Keep prose and CV readable while allowing selected visual scenes to use more
width. Compose ultrawide layouts deliberately rather than stretching every block.

### A9 — Project claims and internal routes need editorial cleanup

**Source/live content:** Existing narratives include generic engineering language
and numerical claims such as Lighthouse 100, 0.8-second LCP, 400% organic growth
and a 50% bundle reduction. Their supporting evidence was not available in this
audit. Several project client fields say “Freelance,” which describes the engagement
rather than the client. Team contribution needs project-specific clarification.

The internal `/design` preview declares noindex, but the locale sitemap includes
it. This is a source-level publishing inconsistency, not evidence it is indexed.
The PL work index still displays the English hover instruction.

**Recommendation:** Use Task 3 to verify the Zakofy story, authorship, media and
results. Qualify or omit unsupported numbers. Keep the internal design preview
outside public navigation and remove it from public sitemap output in a later
maintenance task. Include UI microcopy in locale review.

## Current route and content inventory

`{locale}` means both `en` and `pl`. There are nine visitor-facing page URLs per
locale, plus an internal design preview. This is a source inventory, not a crawl
of external backlinks.

| Current destination                     | Current purpose                                  | Proposed disposition                        |
| --------------------------------------- | ------------------------------------------------ | ------------------------------------------- |
| `/{locale}`                             | Hero, About, Work, Services, calculator, Contact | Keep URL; shorten and reorder               |
| `/{locale}/projects`                    | Card stack on phone, project book from 1024px    | Keep URL; label Work and unify access       |
| `/{locale}/projects/zakofy`             | Tourism website case                             | Keep; first case to refine                  |
| `/{locale}/projects/your-krakow-travel` | Tourism website case                             | Keep; supporting work, later content review |
| `/{locale}/projects/wellezza`           | Salon website case                               | Keep; supporting work, later content review |
| `/{locale}/projects/billboard-zakopane` | Advertising website case                         | Keep; supporting work, later content review |
| `/{locale}/projects/ready2order`        | Employment/engineering case                      | Keep; connect strongly to About/CV          |
| `/{locale}/services`                    | Packages, workflow, FAQ, local-brand link        | Keep; refocus around preferred commissions  |
| `/{locale}/cv`                          | Experience, credentials and print action         | Keep; supporting route from About           |
| `/{locale}/design`                      | Internal component preview                       | Keep internal; exclude from public sitemap  |

Homepage anchors: `#hero`, `#about`, `#projects`, `#services`, `#calculator`,
`#contact`. A `#page-content-start` skip target also exists and must remain
functional. The proposed map describes compatibility for content anchors.

Infrastructure: `/` redirects to `/en`; `/sitemap.xml` lists locale sitemaps;
`/{locale}/sitemap.xml` rewrites to `/{locale}/sitemap`; `/robots.txt` advertises
the sitemap. These are not navigation destinations. Preserve locale alternates
and metadata during additions. No new redirects have been implemented.

## Measurement before and after

Rybbit is loaded by the current application. No custom event instrumentation was
found in the inspected source. No dashboard was accessed, so traffic composition,
popular devices, enquiry rates and abandonment remain unknown.

Use these questions for the prototype and later baseline:

| Question                                                    | Evidence to gather                                               | Success definition                                                          |
| ----------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Can a new visitor identify the offer and see credible work? | Short comprehension review of opening and first case             | Visitor can describe the offer and name a relevant project without coaching |
| Can a client go from work to enquiry?                       | Home → case → Contact; direct case entry → Contact               | Obvious links, no history-dependent dead end, successful form or email path |
| Can an employer find experience?                            | About → CV / ready2order                                         | Clear route without navigating commission pricing                           |
| Can a Lab visitor still use the calculator?                 | Lab → printing → estimate → print enquiry                        | Tool and commercial context retained                                        |
| Is the experience coherent across devices?                  | Five-format visual/interaction evidence plus intermediate widths | Same page purpose and essential actions, appropriate composition per format |

During implementation, consider anonymous events for case entry, enquiry start,
successful enquiry, email activation and CV access. Define what counts as success
before instrumentation; a button click is not a delivered enquiry. Avoid sending
form text, email addresses or other personal details to analytics. Compare against
a measured baseline instead of inventing a conversion uplift target.

## Source pointers and standards

- [Homepage composition](../../src/app/[locale]/page.tsx)
- [Work index mode switch](../../src/app/[locale]/projects/page.tsx)
- [Dock visibility](../../src/components/ui/dock-nav.tsx)
- [Book preview interactions](../../src/components/features/project/project-book/book-table-of-contents.tsx)
- [Case-study composition](../../src/components/features/project/project-book/project-case-study.tsx)
- [Case-study Back behaviour](../../src/components/ui/case-study-back-button.tsx)
- [Services Back behaviour](../../src/components/ui/services-back-button.tsx)
- [Services content](../../src/components/features/services/services-content.tsx)
- [English messages](../../src/i18n/messages/en.json)
- [Project data](../../src/data/projects-en.ts)
- [Locale sitemap](../../src/app/[locale]/sitemap/route.ts)
- [Analytics integration](../../src/components/analytics/rybbit.tsx)

The standards inform future acceptance criteria; they do not certify this audit:
[responsive layout and input capabilities](https://web.dev/articles/responsive-web-design-basics),
[WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), and
[WAI navigation structure](https://www.w3.org/WAI/tutorials/menus/structure/).
