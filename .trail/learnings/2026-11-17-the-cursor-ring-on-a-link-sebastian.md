---
title: "The cursor ring on a link is the keyboard focus ring; the hero's S and K leave the name by their exact shapes, swapped in one frame"
author: Sebastian
date: 2026-11-17
branch: redesign/decyzje
cost: { minutes: 95, tokens: 596339 }
id: l-703a8aa6
scope: repo
status: active
src: agent
touches:
  - cook/ciecz-czastki/index.html
  - src/components/canvas/liquid-hero/liquid-hero.css
  - src/components/canvas/liquid-hero/liquid-stage.ts
  - src/components/sections/hero.tsx
---

## Decided
- On 2026-11-17 the owner said the context cursor and the keyboard focus ring were meant to be identical. The ring wraps a link's whole box 10 px out (where the 2 px focus ring sits at its 8 px offset), in the focus ring's colour and weight. Tab does not pull the cursor ring; each keeps its own place.
- S and K fly from the hero name to the bar corner (scroll 0.35-0.9 of a screen, or with the menu opened on the hero). He rejected the liquid "you are here" body on the menu scale ("artificial") and a glossy CSS dot before it; the scale uses an ink pointer.

## Tried and ruled out
- Wrapping only the text of a link with the cursor ring, and moving the ring to the keyboard-focused element: "you split them and broke the cursor".
- Hiding S and K in the hero with rectangles: Mattone's tight tracking makes K overlap the "o", so a box clips its bowl. Keeping the drawn letters always on top of the canvas: they would sit above the liquid when it flows over the name.

## Watch out
- The name texture carries the initials' exact shapes in channel B, with the rest of the word redrawn over them so overlaps stay the neighbour's; the shader hides B (soft edge included) while data-sk-cut is 1.
- The hero dispatches lq-frame before it draws; sk-flight decides from the frame time alone, so the swap happens in one frame (two rAF loops made the letters blink).

In the code: src/components/ui/custom-cursor.tsx, src/hooks/use-cursor-interactions.ts, src/components/ui/site-nav/sk-flight.tsx, src/components/canvas/liquid-hero/hero-textures.ts (initial), shaders.ts (uSkCut), liquid-stage.ts (lq-frame, data-name).
