---
title: "The hero's matter is a real particle liquid shaped by fields; what it needed and what failed"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 16, tokens: 579649 }
id: l-66b2d8ef
scope: repo
status: active
replaces: l-7add24b3
src: agent
touches:
  - cook/frame-time.mjs
---

## Decided
On 2026-11-15/16 the spring-to-slot matter in the hero sample was replaced by a particle liquid; no particle has a place. Pressure is double density relaxation, pairs that close in are braked, and surface tension is a separate pull up the slope of a blurred "full or not" grid. A drawing is a wall (signed distance) plus a thirst that only attracts where matter is missing. About a third of the matter is marked as what the letters draw, and the blob is divided by one attractor per part of the drawing, each bit of matter answering to the strongest. Checked on 60 fps strips from the real page at 390x844, 1440x900 and 3440x1440.

## Tried and ruled out
Cohesion from pair pressure alone: jams like plasticine, then collapses. More stiffness than about 1200 1/s² at two substeps: blows up. Tension without braking: big bodies implode. A thirst that repels surplus: throws matter out of the frame. Letters pulling from afar or on all matter: rain flies through, blob glues to both words. A burst to take the blob apart: foam. Attractors whose pulls add: they cancel and the blob only grows arms.

## Watch out
Particle sizes must be scattered, not graded across a body: a smooth size gradient makes a drop fall apart. Motion can be judged only from dense strips; the page's clock is stepped by hand for that. The start of the blob's division is still a too-regular star, and letters fill to about 75-85%.

In the code: src/components/canvas/hero-samples/matter-fluid.ts, matter-moulds.ts, matter-story.ts; local tools cook/strips.mjs, cook/frame-time.mjs, cook/rig.
