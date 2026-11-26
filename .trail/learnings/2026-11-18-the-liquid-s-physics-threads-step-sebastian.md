---
title: "The liquid's physics threads step on every frame, because Low Power Mode throttles their timers; drops without physics stay as a fallback"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 3, tokens: 28666 }
id: l-052016c0
scope: repo
status: active
replaces: l-51c86578
src: agent
---

## Decided
- On 2026-11-18 the owner's iPad Pro M2 ran ready2order's physics at 12 of 120 steps a second (30 fps). JIT is ON on that iPad; the owner confirmed it firmly, so never blame it. The screenshot showed Low Power Mode (yellow battery). That mode throttles a worker's own setTimeout loop and caps rAF at 30 fps.
- Both physics workers (hero and ready2order) now run the steps due on every per-frame message from the page (targets / cursor), up to 8 at a time, because 30 fps owes 4 per frame. Their own timer loop stays for the gaps between frames.
- Drops without physics remain the fallback when the physics still manages under 60 steps/s over its first 1.5 s on screen.

## Tried and ruled out
- Explaining the lag by Safari without a JIT. It was wrong for this iPad.
- Bigger particles: they make threads between drops.

## Watch out
- Verified by throttling the worker's setTimeout to at least 330 ms. The old loop fell back to drops without physics; the frame-driven loop kept 121/120 steps/s. Playwright's ctx.route does not intercept dedicated worker scripts, so throttle inside the worker source to test.

In the code: drops.worker.ts and physics.worker.ts (the targets / cur handler calls tick(), cap n < 8); drops-stage.ts makeStill / watch; ?pomiar, ?bezfizyki.
