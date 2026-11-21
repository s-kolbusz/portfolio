---
title: "The hero needs a scenario before polish: one matter, things in three states; the two transitions carry the story"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 1, tokens: 4496 }
id: l-2656a611
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-historia-strony-koncept.md
  - src/components/canvas/hero-samples/matter-story.ts
---

## Decided
On 2026-11-15, after seeing the particle liquid live, the owner said the hero "does not tell any story, it only shows off skill" and that the layout is still strange and empty. He asked for a scenario before any polishing of motion. The proposed thesis (one matter, and from it things in three states: works = sets fully and stands still, in progress = never sets completely, understood and put aside) he accepted as a direction, explicitly as a starting point and not a finished state. He wants the detail worked out where the story actually happens: how drops make a new image and how an image goes back into the blob.

## Tried and ruled out
- Polishing the liquid's defects first (regular star, slab, thin letters): he stopped it; better motion would not give the hero something to say.
- /cook for this: it compares against reference images, and he found nothing to refer to ("we are making a new thing, not copying"). A loop without references uses the scenario as the reference: gates per moment, 60 fps strips, and a cold reader who retells what the strips show.

## Watch out
- A scenario at the level of acts is not enough for him; write each transition step by step with its cause, on a concrete thing, so he can correct it.
- Things, their one-line descriptions and their states are his facts to give; do not invent them. The generic tagline and a caption in a corner are part of why it reads as a show.
- Motion that exists only to impress (all drops leaving at once, matter thrown outwards before it returns) is what he reads as showing off; every move needs a cause a viewer can see.

In the code: docs/design/2026-11-14-historia-strony-koncept.md, section 6, defines the states of things; the story's forming and melting live in src/components/canvas/hero-samples/matter-story.ts (sow, letGo).
