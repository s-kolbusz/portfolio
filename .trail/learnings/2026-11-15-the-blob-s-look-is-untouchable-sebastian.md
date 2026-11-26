---
title: "The blob's look is untouchable: flat, pastel, soft-edged; critics and defaults never override it"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 15, tokens: 103045 }
id: l-75390edb
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/hero-samples/matter-renderer.ts
  - src/components/canvas/hero-samples/matter-story.ts
  - src/components/canvas/hero-samples/things.ts
  - src/components/sections/hero-assembly.tsx
  - src/components/canvas/viscous-puddle/shaders.ts
---

## Decided
On 2026-11-15 the owner saw the hero's liquid with rim light, gloss and a tonal gradient and rejected it outright: "Płaski, pastelowy blob, to był cały zamysł". The job on the blob is its motion, how it transforms and how it reacts, never its material. All shading was removed; the liquid is again one flat pastel green with a soft edge and a slightly deeper middle, as in production.

## Tried and ruled out
Following outside critics who asked for specular, meniscus, value range and a contact shadow on the liquid: it turned the blob into a 3D bead and destroyed the site's main motif. Treating an unanswered intake question ("tonal range, light and grain allowed" as a default) as consent: it contradicted a rule he had already set.

## Watch out
Brief any reviewer that the flat pastel blob is a given, or they will mark it down as "matte clay" and push towards gloss. Deeper flat tones are fine inside set drawings only. After any change to the surface shader, compare the liquid with the production blob before showing anything.

In the code: the surface shader in src/components/canvas/hero-samples/matter-renderer.ts; production reference in src/components/canvas/viscous-puddle/shaders.ts.
