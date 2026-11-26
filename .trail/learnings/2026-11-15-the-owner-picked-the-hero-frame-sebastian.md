---
title: The owner picked the hero frame where his name is biggest; the three lines stay a block beside it
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 1, tokens: 5371 }
id: l-7636bfac
scope: repo
status: active
src: agent
touches:
  - src/components/sections/hero-frame.tsx
  - src/components/sections/hero.tsx
---

## Decided
On 2026-11-15 the owner saw three still frames for the hero (name biggest, words biggest, matter biggest) and picked the first: his "name frames the object" skeleton, with the three lines as one block in the corner. He gave no reason. This is the second time he has chosen that skeleton, so it is settled. He wants a step-by-step motion scenario for a frame, each move with its cause, to correct before any motion code is written.
## Tried and ruled out
- The three lines as a full-width poster with the name as a signature: recommended to him and not picked.
- The whole story in one frame (loose drops, drops running together, one body): not picked; it was also the least finished still.
## Watch out
- In the chosen frame the three lines are the smallest element on the screen. That was named to him as its main risk before he chose; do not quietly enlarge them, raise it with him.
- The pull-apart gesture makes small pieces, which this blob draws as smoke, and on a phone the finger that pulls the blob also scrolls the page. Neither can be settled in a still.

In the code: the chosen frame is the `kadr-imie` variant in `src/components/sections/hero-frame.tsx`; the production hero is `src/components/sections/hero.tsx`.
