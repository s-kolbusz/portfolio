---
title: Hero effects must not replay after a reload or a fast scroll; scene entrances play in time once and are set in place when the page is already past them
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 19, tokens: 266133 }
id: l-7e055191
scope: repo
status: active
src: agent
touches:
  - src/components/sections/aspect-demo.tsx
  - src/components/sections/ready2order-scene.css
  - src/components/sections/ready2order-scene.tsx
  - src/components/ui/rise.tsx
  - src/components/ui/rise.css
  - src/hooks/use-reveal.ts
  - src/hooks/use-reveal.test.tsx
  - src/components/canvas/liquid-hero/liquid-stage.ts
  - src/components/canvas/liquid-hero/loader.ts
---

## Decided
- On 2026-11-18 the owner found that a reload in the middle of the page, or a fast scroll, fired the hero's effects (the name being written, the stronypodhale.pl wordmark rising) and then they vanished. Rule since then: an effect the reader did not scroll through is set in place, never replayed.
- Act 3 (the aspect-preview demo and ready2order) enters in the stronypodhale scene's language: words rise from under their own line (0.8 s, ease-out cubic, staggered), blocks rise uncovered from their bottom edge, played in time once a scene's top passes a line on the screen, and leaving 1.4x faster in reverse. The plugin's Payload window starts at 0.88 scale and grows to full size with the scroll (the owner's idea, instead of drawing the panel in steps). In ready2order the map's blocks come up one by one, the liquid rises from under the map into its middle, the path draws, then step 1, the receipt's first line and the caption. Map labels rise and leave upward instead of fading with the scroll.

## Tried and ruled out
- A fast rise of the ready2order liquid (1.2 s, ease-out): the sudden pull stretched the body into a pointed teardrop. A 2 s ease-in-out rise keeps it a body.

## Watch out
- The cause of the regression: the hero's eased scroll (`shift`) started at 0, so after a reload it swept through the whole transition; the loader played its name show even when the hero was off screen.
- A scene that is already past its line on load, or that the page flew past, gets data-rv-now: transitions are off for two frames, so nothing plays.

In the code:
- src/components/canvas/liquid-hero/liquid-stage.ts: shift starts at scrollNow(), a jump over one screen is taken at once, the lag is capped at 0.5 screen; the act is set finished once the stage leaves upwards (stageTop < -1).
- src/components/canvas/liquid-hero/loader.ts: `skip` option (hero more than half a screen away) behaves like reduced motion and hands over at once.
- src/hooks/use-reveal.ts (useReveal, `rv` event), src/components/ui/rise.tsx + rise.css (.rv-i words, .rv-b blocks, .rv-l lines, --d / --dr delays).
- ready2order-scene.tsx: INTRO clock driven by the `rv` event, frameAt(g, p, intro); aspect-demo.tsx: editor scale effect, fit() measures without the transform.
