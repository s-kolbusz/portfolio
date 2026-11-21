---
title: The live home page blob now has the tuned character; it acts only on the free blob so the scroll story is unchanged
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 10, tokens: 87980 }
id: l-58983cf9
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/hero-samples/blob-lab-shader.ts
  - src/components/canvas/hero-samples/blob-lab.test.ts
  - src/components/canvas/hero-samples/blob-lab.ts
  - src/components/sections/hero-blob-lab.tsx
  - src/components/canvas/viscous-puddle/character.ts
  - src/components/canvas/viscous-puddle/choreography.ts
  - src/components/canvas/viscous-puddle/shaders.ts
  - src/components/canvas/viscous-puddle.tsx
---

## Decided
On 2026-11-15 the owner approved moving the blob's tuned behaviours from the bench to the live home page. They live in one shared module that both the bench and the production blob run, so what is tuned is what ships: the outline wanders on a large scale, the body leans after the pointer, it rings and grows when the cursor ball goes in, and the ball draws out along its motion. His values are the shipped setting. The bridge between body and ball was removed at his request.

## Tried and ruled out
- Letting the character act through the whole scroll: the same shader draws the blob clinging to the name and the water sheet of the next scene, where a wandering outline or a lean would fight the choreography. The choreography now reports how much the body is still the free blob, and everything except the ball's stretch is scaled by that.

## Watch out
- The body's distance must be bent before the smooth union with the ball; the union is what keeps the join clean.
- Visual regression tests hide canvases, so they do not see the blob; the blob's look is checked by stills and by the owner.
- The home page on phones still has no ball under the finger; the bench has one. Whether to add it is his decision.
- End-to-end tests were not run for this change (they would reuse his running server on port 3000).

In the code: `src/components/canvas/viscous-puddle/character.ts` (`stepCharacter`, `TUNED`, `PLAIN`), `src/components/canvas/viscous-puddle/choreography.ts` (`loose`), `src/components/canvas/viscous-puddle/shaders.ts` (`uSquash`, `uStretch`, `uMutate`, `drawnOut`), `src/components/canvas/viscous-puddle.tsx`, bench in `src/components/canvas/hero-samples/blob-lab.ts`.
