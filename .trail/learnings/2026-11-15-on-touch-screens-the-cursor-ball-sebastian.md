---
title: "On touch screens the cursor ball follows a finger, read from touch events because pointer events stop when scrolling starts"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 4, tokens: 34079 }
id: l-ed7e435b
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - src/components/canvas/viscous-puddle.tsx
  - src/components/sections/hero-blob-lab.tsx
  - src/components/canvas/hero-samples/blob-lab.ts
  - src/components/canvas/viscous-puddle/character.test.ts
  - src/components/canvas/viscous-puddle/character.ts
  - src/components/canvas/viscous-puddle/choreography.ts
  - src/components/canvas/viscous-puddle/shaders.ts
  - src/components/canvas/viscous-puddle/webgl.ts
---

## Decided
On 2026-11-15 the owner asked for the cursor ball to follow a finger on the home page too, as it does on the tuning bench. While a finger is on the screen the ball goes to it, on any screen size, and returns to the blob when it lifts. A mouse leads the ball on wide screens as before.

## Tried and ruled out
- Pointer events for the finger (the bench's first version): the browser sends a pointer cancel as soon as the finger starts to scroll, so the ball let go after the first few pixels of every swipe. Touch events keep arriving for the whole gesture.

## Watch out
- Because a scrolling finger is on the screen the whole time, on phones the ball now accompanies it through the whole opening, including the next scene. If that gets in the way, limit the lead to the hero.
- Checked only with synthetic touches on an emulated phone in Chromium, not on a real iPhone or in Safari.
- Phones also emit a mouse move after a tap; the narrow-screen gate on the mouse path is what keeps the ball from sticking where the tap was.

In the code: `src/components/canvas/viscous-puddle.tsx` (`onTouch`, `touching`, `followPointer`), `src/components/sections/hero-blob-lab.tsx` (`onTouch`).
