# Portfolio redesign — discovery brief

Date: 2026-09-20
Last updated: 2026-09-21
Status: Discovery brief and staged roadmap approved by the owner on 2026-09-21.
Task 1's detailed structure is now documented for review; visual design and
implementation have not been approved as finished.
Scope: Strategy, experience design, and staged planning. No application changes yet.

Task 1 outputs: [Current-experience audit](./2026-09-21-portfolio-experience-audit.md)
and [sitemap/content map](./2026-09-21-portfolio-sitemap-content-map.md).

## Purpose

Refine the existing portfolio into a coherent, cinematic experience that makes the
work compelling and easy to explore across phone, landscape tablet, laptop,
desktop, and ultrawide screens. Preserve the qualities the owner values while
resolving inconsistent subpages, text-heavy presentation, and confusing structure.

The original ambition to set a high standard in Podhale is a quality aspiration.
The personal portfolio targets wider Polish and international opportunities;
stronypodhale.pl is the owner's specialist brand serving local businesses.

## Confirmed decisions

### Audience and commercial priorities

- Primary outcome: premium independent projects and agency collaborations.
- Secondary outcome: senior engineering roles and long-term contracts remain
  supported and discoverable.
- Offer priority: complete websites from direction to launch, then broader digital
  products, then specialist frontend execution.
- Client priority: established businesses whose websites undersell them, then
  technology companies, then founders launching something new.
- Publish a starting investment or typical range for website commissions, with
  restrained presentation near the enquiry. Actual amounts, scope, and wording
  remain undecided.

### Identity and experience

- Preserve the green blob, typography, animation system, and cursor interactions
  as important parts of the identity.
- The experience should feel cinematic, alive, and like a journey.
- Natural scrolling is the foundation, with selective immersive chapter moments.
- Visitors control the pace and can reach relevant information directly. Discovery
  should not require solving an unfamiliar interface.
- The work leads the visual story. Customers' identities should remain recognisable.
- Personal imagery is selective and supporting. Process photography is unnecessary.
- This is refinement of an existing identity, not permission to replace it wholesale.

### Work and brand relationships

- Zakofy is an anchor project for the direction.
- stronypodhale is an owned specialist brand with a real market and commercial role.
  Present it naturally as a venture/case study with relevant links; avoid rigid
  separation or excessive promotion.
- Piczura's modelling portfolio is the intended strongest future example. It is
  still being built and must be finished before being presented as completed work.
- Keep room for engineering experience alongside commissioned projects, accurately
  distinguishing individual contribution from team output.

### Lab and 3D printing

- Place 3D printing primarily within a Lab/Explorations area.
- Retain a commercial path where relevant: the experiment's own page can contain
  the calculator and an invitation to discuss a print.
- It should not compete with the main website offer for homepage prominence.
- The precise Lab name remains a proposal; secondary navigation placement is agreed.

### Navigation hierarchy

- Primary navigation: Work, About, Contact.
- Services has secondary placement, clearly linked from the homepage's capabilities
  section. It can provide detailed scope and practical information.
- Lab is accessible through secondary navigation and relevant contextual links.
- About provides access to engineering experience and the CV.
- Exact labels, menu interaction, and whether Contact targets a section or a route
  remain to be designed across all five formats.

### Case-study identity

- Use a consistent portfolio identity with project-led scenes.
- Navigation, typography, spacing, and motion remain recognisable across projects.
- Customer imagery can influence scene backgrounds, colours, and composition.
- The green blob can connect entrances, transitions, and endings. Its exact
  choreography will be explored in the visual/motion design stage.
- Each case study may change the atmosphere while keeping orientation and
  navigation clear. A full adoption of each customer's visual system is not the
  selected direction.

### Enquiry flow

- Primary contact method: a short enquiry form with direct email also visible.
- Ask for name, email, and a brief project description; budget and timing are optional.
- Display starting investment or typical range guidance near the enquiry. Values
  and final wording remain to be decided.
- Keep a clear route for employment and collaboration enquiries without requiring
  those visitors to invent a project budget or scope.
- Homepage, case studies, and Services link to the same enquiry destination.
- The Lab's commercial enquiries may use this destination with appropriate context.
- The final form layout, delivery mechanism, validation and feedback behaviour will
  be specified in the contact task.

## Working positioning — proposed wording, not approved copy

An independent designer and developer who helps established businesses turn an
underwhelming website into a distinctive, carefully built digital presence, with
the engineering depth to support more complex products.

Actual case studies must establish the owner's contribution before publishing
claims about creative direction, branding, design, writing, or business outcomes.

## Initial evidence

Read-only inspection covered repository documentation, project content, design
tokens, the project book implementation, visual test configuration, and live Polish
homepage/project views. This was an initial inspection, not a complete audit of all
routes, devices, themes, or languages.

- The homepage currently combines engineering positioning, website packages,
  employment credentials, and a 3D-print calculator.
- The desktop projects route uses a horizontal book interaction; the narrower
  layout presents projects vertically. This changes the navigation model.
- The desktop book index initially reserves its preview area for hover discovery.
- Project images, gallery captures, and a portrait illustration already exist.
  Perceived lack of imagery is partly a presentation issue; new assets may still
  be needed.
- Current English project descriptions emphasise technology and performance. They
  contain limited specific explanation of visual decisions and contribution.
- Existing performance and business claims are content assertions, not independently
  verified evidence. Validate them before reuse.
- The shared Playwright configuration currently defines Desktop Chrome only. The
  visual suite covers the homepage, CV, and project book, with overrides that hide
  or neutralise animation. Those snapshots cannot establish motion quality or the
  required five-format coverage.

## Responsive contract

Every future redesign brief must specify composition, navigation, media treatment,
motion, and acceptance checks for all five formats.

| Format           | CSS viewport | Decision status        |
| ---------------- | ------------ | ---------------------- |
| Phone            | 390 × 844    | Provisional checkpoint |
| Landscape tablet | 1024 × 768   | Provisional checkpoint |
| Laptop           | 1440 × 900   | Provisional checkpoint |
| Desktop          | 1920 × 1080  | Provisional checkpoint |
| Ultrawide        | 3440 × 1440  | Explicitly requested   |

These are representative test viewports, not verified popularity rankings. Review
available audience analytics before claiming they represent the site's most common
sizes. CSS viewport dimensions are distinct from physical display resolution.

Proposed acceptance rules:

- Maintain useful layouts between checkpoints and at narrow widths and text zoom.
- Phone: intentional vertical compositions and visible project imagery; touch must
  provide a complete experience without cursor effects.
- Landscape tablet: test touch interaction at desktop-like widths and limited
  vertical space; do not infer hover capability from width.
- Laptop: keep key scene content and controls usable within the available height.
- Desktop: use the intended cinematic compositions with clear navigation.
- Ultrawide: deliberately distribute imagery and space while keeping text readable;
  do not simply stretch the laptop layout.
- Give each immersive sequence a natural-flow and reduced-motion treatment. Core
  content and navigation remain available regardless of animation capability.
- Review both English and Polish content. Decide theme scope before visual sign-off.
- Combine deterministic screenshots with real scroll, touch, keyboard, navigation,
  loading, and motion checks. A screenshot alone is insufficient acceptance.
- Generate committed visual-regression baselines on Linux, per repository guidance.

References: [content-driven responsive design](https://web.dev/articles/responsive-web-design-basics)
and [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

## Information architecture — hierarchy agreed, page details proposed

- Home: cinematic introduction → selected work → capabilities and fit → concise
  personal context → enquiry, with investment guidance near the enquiry.
- Work: a visual index with immediate access to individual case studies.
- Case studies: customer context, finished work, selected decisions, accurate role,
  supported outcomes, and a clear next action.
- About/Experience: personal context and engineering history, with an accessible CV.
- Lab: experiments with optional commercial actions on relevant individual pages.
- Contact: one clear enquiry destination, reachable throughout the experience.

Services and Lab have secondary navigation placement; Work, About, and Contact are
primary. Task 1 now recommends standalone About and Contact routes and outlines
Services in the linked content map. These are detailed proposals for review;
the navigation's visual and interaction design remains open.

## Proposed staged roadmap

Each stage produces something reviewable before subsequent implementation. All
visual and interactive stages carry the five-format contract above.

| Stage                         | Bounded deliverable                                                                                                                             | Completion criterion                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 0. Discovery                  | Confirmed brief, current-route inventory, evidence gaps, success criteria                                                                       | Priority journeys and material open decisions resolved                                   |
| 1. Page structure             | Sitemap, page purposes, content outline, navigation proposal, migration inventory                                                               | Visitors have direct routes to work, fit, experience, and enquiry                        |
| 2. Visual and motion language | Compare 2–3 treatments within the preserved identity; define typography roles, blob behaviour, imagery, transitions, cursor and touch responses | One direction works across representative page types and five formats                    |
| 3. Zakofy story and assets    | Verified contribution, concise story, selected images/captures, asset-production list                                                           | The project can communicate visually without generic claims or long explanatory passages |
| 4. Connected prototype        | Homepage project introduction → Zakofy case study → enquiry, including return navigation                                                        | The same identity survives navigation and works across all five formats                  |
| 5. Shared foundation          | Implement agreed navigation, layout, typography and motion primitives                                                                           | Existing and new pages remain usable during incremental rollout                          |
| 6. First complete journey     | Ship the approved homepage/case-study/enquiry path as a coherent slice                                                                          | Functional, responsive, accessibility, motion and performance checks pass                |
| 7. Remaining destinations     | Separate tasks for work index, other case studies, experience/CV, Lab and printing                                                              | Each destination meets the same contract before release                                  |
| 8. Piczura feature            | Add the completed project with verified material and its own art direction                                                                      | It fits the established system and merits flagship placement                             |

Piczura completion need not block discovery or the Zakofy prototype. Any change to
existing routes needs a deliberate preservation/redirect decision; route removal
is not implied by this draft sitemap.

## Template for future implementation briefs

1. Visitor problem and desired outcome.
2. Scope, dependencies, affected pages, and explicit non-goals.
3. Content and asset requirements, including provenance and accurate contribution.
4. Visual and motion behaviour, including entry, exit, interruption and return states.
5. Requirements at each of the five formats and between them.
6. Touch, keyboard, reduced-motion and loading behaviour.
7. Acceptance evidence, relevant tests, and performance budgets.
8. Rollout boundaries and compatibility with pages not yet redesigned.

## Open decisions and evidence gaps

- Detailed page structure, Services content, and navigation interaction design.
- Actual investment guidance, enquiry presentation and delivery mechanism.
- The owner's precise contribution to each featured project and publishable results.
- Visual alternatives within the agreed shared identity and project-led scenes;
  the blob's precise choreography beyond the hero.
- Selection and prominence of existing projects outside the three named priorities.
- Media production needs, including motion captures and an optional portrait.
- Language priority and light/dark theme scope; current bilingual/theme support is
  not authorised for removal.
- Success measures for qualified enquiries, comprehension and employer access.
- Available audience/device analytics and final responsive test coverage.
- Performance budgets reconciled with richer imagery and cinematic motion. Existing
  README budgets remain the starting constraint until deliberately reviewed.

## Change log

- 2026-09-21: Confirmed a short enquiry form plus visible direct email, optional
  budget/timing, nearby investment guidance, and support for employment and
  collaboration enquiries. Added a separate actionable roadmap for staged work.

- 2026-09-21: Confirmed shared portfolio identity with project-led case-study scenes,
  allowing customer imagery to influence scene colour and composition while
  navigation, typography, spacing, and motion retain continuity.

- 2026-09-21: Confirmed Work / About / Contact as primary navigation, with Services
  and Lab in secondary positions and CV accessible through About. Page details and
  navigation interaction remain proposals.

- 2026-09-20: Captured discovery decisions through agreement on public starting
  investment/range guidance. Information architecture and roadmap remain proposals.
