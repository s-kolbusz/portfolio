---
title: "The hero liquid itself becomes the water sheet that reveals stronypodhale; physics spreads it, a flood front from its outline fills the rest"
author: Sebastian
date: 2026-11-17
branch: redesign/decyzje
cost: { minutes: 11, tokens: 143821 }
id: l-c996bfb6
scope: repo
status: active
src: agent
touches:
  - cook/ciecz-czastki/index.html
  - cook/ciecz-czastki/sim.js
  - cook/ciecz-czastki/stronypodhale.avif
  - cook/ciecz-czastki/worker.js
  - cook/teren/teren-caly.js
---

## Decided
- On 2026-11-17 the owner chose to have the new particle liquid turn into the sheet itself, with the green darkening as before, everything natural, smooth and organic. The alternative was gathering the liquid into one drop and handing over to the old blob transition. He did not pick that.
- The transition still follows the scenario of 25.09: darken to the site's colour, the page surfaces murky and clears to glass, and the cursor drop stays green.

## Tried and ruled out
- Filling the screen with physics alone. Particles interact only within one radius, so the body can spread about 3× in area before it falls apart into separate dots. The screen is about 10× the body's area. So the physics spreads the body by lowering its rest density and releasing its anchor, and the render grows a flood front outward from the liquid's outline until it covers the frame.

## Watch out
- The flood needs a second distance field (outward from the liquid) every frame during the transition. On an iPad without JIT this extra GPU work is untested.
- The cursor drop's particles are the last rebelN ones. They are splatted into a second channel so they stay green and raised on the dark sheet.

In the code:
- sim.js: P.spread (0…1). It scales rest density (×(1−0.7·spread)), and also the anchor, the anchor damping and the self-weight (×(1−spread)).
- index.html:
  - transition() maps scroll to spread, dark, imageIn, clarity and floodR (P runs over 2.4 screen heights).
  - The flood shader: front = R·(0.62+0.76·noise) − outsideDistance, union with the inside distance.
  - The dark colour is 21,48,31, the median of the screenshot's edges.
