---
title: "The hero's matter is a field of drops with mass, not shapes blended into each other"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 17, tokens: 148565 }
id: l-1bc11e24
scope: repo
status: active
src: agent
touches:
  - "src/app/[locale]/design/hero/[variant]/page.tsx"
  - src/components/canvas/hero-samples/matter-renderer.ts
  - src/components/canvas/hero-samples/matter-story.ts
  - src/components/canvas/hero-samples/things.ts
  - src/components/sections/hero-assembly.tsx
  - src/i18n/messages/en.json
  - docs/design/2026-11-15-how-i-work-with-agents-en.md
  - docs/design/README.md
---

## Decided
The hero sample was rebuilt so the matter is a few thousand small drops, each pulled by a damped spring to where it belongs right now (in the blob, in a travelling drop, on its spot in a drawing). They are drawn as soft spots into an off-screen field that is cut at a threshold, which gives one liquid surface that necks and breaks by itself. A thing is an exact drawing; it replaces the liquid wherever drops have come to rest, so it sets from where the matter arrives. Work runs as a capped critic loop (3 rounds) with state in a local cook folder kept out of git.

## Tried and ruled out
A phase machine that eased the body between poses and cross-faded a circle's distance field into a box's: stitched, linear motion and jumps at the seams. Random per-drop phase in the stirring force: neighbours moved apart and the liquid went lumpy; currents must be shared by neighbours.

## Watch out
Tailwind's translate utilities set the CSS translate property, so clearing style.transform does not undo them: the name stayed hidden until style.translate was set. Timing is random on purpose, so the still harness waits on data-phase and data-thing on the section, not on clock times. Spot size must follow the local spacing of drops or the field's density changes between sheet, blob, drop and drawing.

In the code: src/components/canvas/hero-samples/matter-story.ts, matter-renderer.ts, things.ts; src/components/sections/hero-assembly.tsx; cook/harness.mjs (local only).
