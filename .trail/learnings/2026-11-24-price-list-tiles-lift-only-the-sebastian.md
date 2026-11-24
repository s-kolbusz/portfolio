---
title: "Price list tiles: lift only the tile under the pointer, and show each creative trace once"
author: Sebastian
date: 2026-11-24
branch: redesign/decyzje
cost: { minutes: 30, tokens: 259875 }
id: l-def39062
scope: repo
status: active
src: agent
touches:
  - src/components/sections/how-i-work-end-ground.ts
  - src/components/sections/how-i-work-end.css
  - src/components/sections/how-i-work-end.tsx
  - src/components/sections/how-i-work.tsx
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
---

## Decided
- With a mouse the tile structure stays put. Only the tile under the pointer is lifted: it rises a few pixels, gets a soft shadow, is drawn opaque and on top of its neighbours, and settles back when the pointer leaves.
- On the left ("for you") structure, each kind of creative trace (display-face letter, green swatch, crop frame, motion curve) appears at most once, and only on a tile that is fully visible below the bar. The rest stay plain paper, in larger proportions.

## Tried and ruled out
- Pushing tiles away from the pointer, leaning them with its movement, slight rotation. The owner called it "somehow weird": the tiles are semi-transparent, so where they slid over each other darker overlaps appeared and the whole grid floated. The lifted tile's shadow was also covered by neighbours drawn after it.
- A trace on every left tile on a half-module grid. The owner called it "too chaotic and repetitive at once" (only four kinds, so they repeated).

## Watch out
- Lifted tiles must be drawn in a second pass, after all others, or their shadow is clipped.
- The finer half-module grid is used only when a half module is at least about 90 px. Below that (phone, tablet) the traces got cramped, so it falls back to whole modules.

In the code: website/src/components/sections/how-i-work-end-ground.ts (drawTile with the `late` second pass, `trace`, the `wants` assignment in `structure`).
