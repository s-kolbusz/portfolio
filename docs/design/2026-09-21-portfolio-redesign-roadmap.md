# Portfolio redesign — staged task briefs

> **ZASTĄPIONE 2026-09-24** przez [decyzje redesignu](./2026-09-24-redesign-decyzje.md). Archiwum. Lista usterek z audytu (A1–A9) nadal obowiązuje, ale kierunek wizualny, założenia o ograniczaniu ruchu, pozycjonowanie i mapa strony z tego dokumentu już nie.

Date: 2026-09-21
Status: Execution sequence approved by the owner on 2026-09-21. Task 1 audit and
structural recommendations delivered; Task 2 is in progress and its first visual
studies were rejected. No visual direction has been selected.
Source of truth: [Discovery brief](./2026-09-20-portfolio-redesign-brief.md).

## Delivery principles

- Preserve the green blob, typography, motion and cursor interactions as identity
  assets. Refine them through prototypes rather than assuming every current
  implementation must remain unchanged.
- Work and customer identity lead the presentation. Personal context supports them.
- Natural scrolling underpins the journey, with selective immersive scenes and
  direct routes to information and enquiry.
- Avoid a homepage-only redesign. Prove continuity through a project page and
  enquiry before rolling out a new visual language.
- Scope each implementation task so it can be reviewed and integrated without
  requiring all remaining pages to be rebuilt simultaneously.
- Preserve current functionality, routes, languages and themes unless a specific
  change has been agreed. Inventory necessary redirects before route changes.
- Treat case-study contribution, customer permissions and outcome evidence as
  content dependencies. Do not publish invented results or imply sole authorship
  of team work.

## Shared definition of done

Every visual or interaction task includes evidence at these CSS viewports:

| Phone     | Landscape tablet | Laptop     | Desktop     | Ultrawide   |
| --------- | ---------------- | ---------- | ----------- | ----------- |
| 390 × 844 | 1024 × 768       | 1440 × 900 | 1920 × 1080 | 3440 × 1440 |

Ultrawide is explicitly confirmed; the other dimensions are provisional test
anchors. They do not establish popularity rankings. Check intermediate widths and
content reflow as well.

For every affected journey, review:

- Composition, image crops, readable text widths, wrapping and vertical spacing.
- Touch, mouse, keyboard and visible focus. Essential content never depends on hover.
- Short viewport heights, zoom, long Polish labels and realistic text lengths.
- Natural scroll, scene entry/exit, interrupted transitions, back navigation and
  reduced-motion behaviour.
- Loading, empty/error states where applicable, and stability as media loads.
- Relevant accessibility and performance checks. Establish actual current metrics
  before claiming an improvement; reconcile media budgets with repository targets.
- Both locales and current themes until a different scope is agreed.

Use screenshot comparisons for stable states and interaction checks for motion and
navigation. Generate committed visual snapshots on Linux. Run tests relevant to
the changed behaviour rather than indiscriminately repeating the whole suite.

## Task 1 — Map the current experience and proposed structure

**Status:** Audit and planning deliverables complete within the documented scope.
Detailed structural recommendations are ready for review, not implemented.

**Outputs:** [Experience audit](./2026-09-21-portfolio-experience-audit.md) and
[sitemap/content map](./2026-09-21-portfolio-sitemap-content-map.md).

**Outcome:** A concrete sitemap and content map that remove competing priorities.

**Work:**

- Inventory all current routes, navigation surfaces, sections and enquiry paths.
- Review the homepage, work index, one full case study, Services, CV and calculator
  at the five formats. Include the behaviour of transitions, not just static views.
- Record evidence of inconsistent navigation, hidden imagery, excessive text and
  layout problems. Distinguish observed defects from subjective design choices.
- Map each section to keep, shorten, relocate, combine or retire as a proposal.
- Specify primary Work / About / Contact navigation and secondary Services / Lab
  placement, with CV accessible through About.
- Outline each destination's purpose and content. Decide section versus route for
  Contact and the relationship between About and the existing CV route.
- Identify existing URLs that need preservation or a deliberate redirect decision.

**Deliverables:** Current/proposed sitemap, content disposition table, annotated
findings, and page outlines.

**Complete when:** Client, employer and Lab visitors each have an explicit path to
the information and action they need, and each current page has a disposition.

**Boundary:** Read-only audit and planning; no application redesign.

## Task 2 — Define the visual and motion language

**Status:** Both initial studies rejected by the owner for losing the site's cold,
technical identity. Follow the [visual reset](./2026-09-21-portfolio-visual-reset.md)
before producing further comparisons. Typography remains exploratory, not approved.

**Depends on:** Task 1's page purposes.

**Outcome:** A reusable visual language that preserves the site's personality.

**Work:**

- Compare two or three concrete visual treatments within the agreed identity.
  Vary composition, image scale, typography hierarchy and motion restraint rather
  than presenting unrelated rebrands.
- Define roles for expressive typography, body copy and technical metadata.
- Specify shared backgrounds, spacing, navigation and focus/interaction states.
- Define how project imagery influences individual scenes without replacing the
  portfolio's navigation, typography or motion conventions.
- Storyboard the blob's role in the introduction, scene transitions and ending.
  Establish where it rests so that project imagery remains legible.
- Describe motion by purpose and trigger, including cancellation, fast scrolling,
  touch responses and reduced-motion equivalents.
- Define ultrawide compositions deliberately and touch behaviour independently of
  viewport width.

**Deliverables:** Visual comparisons, selected design rules, motion storyboard and
five-format composition sheets for a shared introduction and project scene.

**Complete when:** One direction is chosen based on actual visual examples, and the
same rules explain both a portfolio scene and a customer-led case-study scene.

**Boundary:** Design exploration; avoid prematurely building a broad component library.

## Task 3 — Prepare Zakofy's case-study material

**Depends on:** Task 1; may overlap with Task 2 after the page outline is established.

**Outcome:** Enough specific, accurate content to prototype a real project journey.

**Work:**

- Confirm the owner's actual responsibilities, collaborators and starting materials.
- Establish the customer context, key design decisions and observable outcome.
- Audit available images and interface captures; list only the additional material
  needed to tell the story, including mobile views and useful motion recordings.
- Select imagery and crops appropriate to all five formats.
- Write a concise narrative with optional deeper technical content and supported
  claims. Keep client testimony distinct from the owner's commentary.
- Define the homepage project introduction and the full case study together.

**Deliverables:** Verified content outline, final/provisional copy with clear status,
asset manifest and a bounded asset-production list.

**Complete when:** The story demonstrates the work visually and identifies personal
contribution without relying on generic claims about quality or performance.

**Boundary:** Zakofy only. Piczura is not required to complete this task.

## Task 4 — Prototype one complete journey

**Depends on:** Tasks 2 and 3.

**Outcome:** Validate the experience before wider implementation.

**Scope:** Homepage introduction and featured Zakofy scene → Zakofy case study →
enquiry, including navigation back to the work.

**Work:**

- Use real content and imagery from Task 3.
- Include natural scroll, one justified immersive moment and the proposed cursor
  interactions, with complete touch and reduced-motion treatments.
- Prototype consistent navigation and transitions between pages.
- Include the short enquiry layout and nearby provisional investment guidance;
  keep prototype submission clearly non-production.
- Review all five formats and intermediate widths. Check both deliberate exploration
  and a visitor who immediately wants work, experience or contact information.
- Record what worked, what needs revision, and any unjustified complexity.

**Deliverables:** Reviewable connected prototype and a short findings/decision log.

**Complete when:** The experience feels continuous across pages, imagery communicates
the project immediately, and each input mode supports a direct path to enquiry.

**Boundary:** This is a prototype, not an implicit production release or full-site rebuild.

## Task 5 — Implement shared foundations and enquiry

**Depends on:** Task 4's selected approach.

Split into separate reviewable implementation tasks:

1. Shared layout, typography rules and navigation, compatible with existing pages.
2. Agreed motion primitives, blob behaviour and cursor/touch responses.
3. Enquiry form and investment guidance.

For the enquiry, require name, email and a brief description; budget and timing are
optional. Preserve a visible email alternative and an appropriate route for
employment/collaboration. Specify validation, accessible error/success feedback,
submission progress, duplicate prevention, abuse protection and delivery failure
handling. Choose the delivery mechanism after inspecting existing infrastructure;
avoid committing to a provider in the design brief.

**Complete when:** Shared elements work across current and upcoming pages, and the
enquiry has verified delivery and usable failure states. Use an authorised test
destination for delivery checks.

**Boundary:** No mass rewrite of remaining case studies or CV content.

## Task 6 — Ship the first coherent project journey

**Depends on:** Task 5 and approved content from Task 3.

Split into separate tasks for the homepage narrative and the Zakofy case study,
then validate the connected journey before publishing the redesign slice.

- Replace excessive text with the agreed balance of imagery, concise copy and
  optional detail.
- Keep the offer hierarchy clear and provide the same enquiry destination throughout.
- Preserve routes or apply the explicit migration decisions from Task 1.
- Apply the shared definition of done and verify page transitions with real motion
  enabled, alongside deterministic snapshots.

**Complete when:** Homepage, Zakofy and enquiry form a coherent, usable experience
at all five formats without breaking access to remaining destinations.

## Task 7 — Extend the system through bounded page tasks

**Depends on:** Task 6's verified patterns.

Create distinct briefs for:

- Work index: visual browsing with immediate imagery and clear project access.
- stronypodhale: owned-brand case study and contextual links to the specialist offer.
- About/experience/CV: concise personal introduction, engineering depth, accessible
  employment information and preservation of relevant CV functionality.
- Services: practical scope, fit, investment guidance and answers to common questions.
- Lab and printing: visual exploration plus the calculator and a contextual commercial
  enquiry path.
- Other existing projects: decide prominence and prepare accurate content individually.

Each task must specify its own content, assets, route treatment, motion requirements
and five-format acceptance evidence. Avoid copying the entire Zakofy composition
onto projects with different material or stories.

## Task 8 — Introduce Piczura when ready

**Depends on:** Completion of the Piczura project and sufficient final assets.

- Confirm contribution and the project's publishable state.
- Develop a story and scene compositions suited to its photography and identity.
- Reuse the portfolio's established navigation, typography and motion language.
- Reassess featured-work order based on the completed result.
- Validate the same five-format contract before promoting it as the flagship.

**Complete when:** Piczura is honestly presented as finished work and demonstrates
the system's ability to accommodate a distinct customer identity.

## Decisions intentionally deferred to the relevant task

- Actual investment figures and commercial wording: before Task 5's enquiry work.
- Precise project contribution and supported results: each project's content task.
- Theme or language scope changes: explicit decisions before affecting current support.
- Exact motion timing, layout and media crops: prototype and visual review.
- Delivery provider, media implementation and performance tradeoffs: inspect and
  measure during the relevant technical task.
- Analytics and success measures: define during Task 1, using available evidence;
  avoid arbitrary conversion targets before establishing a baseline.

## Recommended next task

Continue with Task 2: visual and motion treatments using Task 1's page purposes
and content map. Compare the opening, a Zakofy scene and Contact across all five
formats. Task 3 prepares the real case material; Task 4 connects and tests the
chosen design before production work.
