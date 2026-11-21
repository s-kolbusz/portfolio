---
title: "The production blob is the starting point for the hero: its shape and mutation are already good, it needs polish and expression"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 5, tokens: 23481 }
id: l-512157c1
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/viscous-puddle/shaders.ts
  - src/components/canvas/viscous-puddle.tsx
---

## Decided
On 2026-11-15, after the particle liquid and a blob rebuilt from scratch in EffectCraft, the owner said the shape and mutation of the blob on the current live site "already looked really good" and only needed some polish and expression. He asked to take that live blob as the starting point and make it more beautiful, instead of inventing a new one. He also said the most important thing is the cursor's interaction with the blob, which a pre-rendered clip cannot give, and that the blob must be a living, mutating blob, not a circle.

## Tried and ruled out
- Rebuilding the blob from several drifting lobes in EffectCraft: smooth, but it is a different character from his own blob and cannot react to the cursor.

## Watch out
- The live blob is a signed distance shape in one fragment shader: a rounded box that starts as a circle, a breathing term, a noise drift of its centre, one octave of noise on the distance as its ripple, and the cursor ball joined by a smooth union. Its mutation is therefore small-scale; "expression" has to come from larger-scale deformation and from how it answers the cursor, not from a new technique.
- The production hero and signature scene share this shader and its choreography; work on a copy on the samples route until he approves a result.

In the code: `src/components/canvas/viscous-puddle/shaders.ts` (`FRAGMENT_SRC`, `smin`, `uBall`), `src/components/canvas/viscous-puddle.tsx` (pointer and ball easing), samples route `src/app/[locale]/design/hero/[variant]/page.tsx`.
