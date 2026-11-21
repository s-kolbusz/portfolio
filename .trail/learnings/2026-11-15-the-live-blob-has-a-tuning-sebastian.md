---
title: "The live blob has a tuning bench on the samples route: production at zero, new behaviours behind dials the owner sets by eye"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 9, tokens: 99683 }
id: l-f80e99e2
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/hero-samples/blob-lab.ts
  - src/components/canvas/hero-samples/blob-lab-shader.ts
  - src/components/sections/hero-blob-lab.tsx
  - src/components/canvas/viscous-puddle/shaders.ts
---

## Decided
On 2026-11-15 the owner agreed to put the production blob on the samples route with sliders. The bench copies the hero's resting blob formula for formula (same radius, breathing, drift, ripple, cursor ball, follow time, soft edge, pixel-ratio cap), so with every dial at zero it is the live blob. Behind dials it adds: a larger-scale wander of the outline, the body leaning after the pointer, a bridge between body and ball (reaching in, a thread on the way out), a gulp when the ball goes in, and the ball drawing out along its motion. He tunes by eye and copies the values; the agent only supplies mechanisms. Production stays untouched until he approves values.

## Tried and ruled out
- Wander made of two noise octaves with a strong domain warp: the outline got corners and looked knobbly in stills. One long wave bent by a slower one keeps broad lobes.
- Impulses for the gulp given as raw velocities: the swing was under 1% and invisible. An impulse has to be sized by the spring's own frequency so the swing reaches the intended share.
- The panel at the top right: it sat on the site's own dock and theme switch, and on a phone it covered the blob. It lives top left on wide screens and folds above the dock on phones.

## Watch out
- While the pointer is over the panel the ball goes back to rest, on purpose, so dragging a slider does not drag the ball.
- Motion was checked only as stills from a real browser; how it feels is his call.
- Reading saved dial values in an effect trips the lint rule against setting state in effects; the values live in a small external store read with useSyncExternalStore.

In the code: `src/components/canvas/hero-samples/blob-lab.ts` (`stepBlobLab`, `PRODUCTION`, `PROPOSAL`), `src/components/canvas/hero-samples/blob-lab-shader.ts`, `src/components/sections/hero-blob-lab.tsx`, route /pl/design/hero/blob; the original is `src/components/canvas/viscous-puddle/shaders.ts`.
