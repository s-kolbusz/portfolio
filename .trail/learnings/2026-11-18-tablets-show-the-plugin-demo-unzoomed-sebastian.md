---
title: "Tablets show the plugin demo unzoomed; ready2order's physics is not made lighter with bigger particles"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 14, tokens: 91904 }
id: l-9284bfa2
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/canvas/liquid-hero/drops.worker.ts
  - src/components/sections/aspect-demo.tsx
  - src/components/canvas/liquid-hero/liquid-stage.ts
---

## Decided
- On 2026-11-18 the owner's iPad video showed the Payload window tiny and changing size. Touch screens now get it at its natural size, as phones do. Desktops keep the zoom to 78% of the height.

## Tried and ruled out
- Bigger particles (1.45x, about half as many) for slow devices in ready2order: small parts no longer come apart cleanly and threads form between drops. Threads are ruled out.

## Watch out
- Safari lays the wireframe out taller than Chrome (1420 vs 1152 px at 1035 px wide), so the height fit zoomed it to 0.46. Its toolbar changes innerHeight while scrolling, which re-ran the fit.
- On the owner's iPad the ready2order liquid lagged and smeared at the bottom of the map. WebKit on a Mac (with JIT) runs it at the full 120 steps/s, so the cause is still unmeasured. Open /en?pomiar on the device to read physics steps/s, fps and particle count. It runs about 3x the hero's particles.
- The TILT button needs HTTPS (iOS gives the motion sensor only to secure pages), so it is missing on http://<LAN IP>.

In the code: aspect-demo.tsx fitNow (pointer: coarse); drops-stage.ts `probe`; drops.worker.ts `steps` in the positions message.
