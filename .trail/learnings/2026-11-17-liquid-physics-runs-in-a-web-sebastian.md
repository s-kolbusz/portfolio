---
title: Liquid physics runs in a web worker so drawing stays smooth on devices without a JIT
author: Sebastian
date: 2026-11-17
branch: redesign/decyzje
cost: { minutes: 4, tokens: 178517 }
id: l-5fbe7760
scope: repo
status: active
src: agent
touches:
  - cook/ciecz-czastki/worker.js
---

## Decided
The particle-liquid physics runs in its own worker thread. The page only sends cursor/finger input and tilt there, and draws particle positions it gets back, interpolating between the last two physics states. Reason: Safari on iPad (and some iPhones) runs without a JIT, so one physics step takes ~28 ms and, when it ran on the main thread, it capped drawing at ~30 fps. Owner chose this over reducing particle count, because fewer particles make the liquid coarser.

## Tried and ruled out
- Fewer particles first: rejected, it costs visual quality.
- Measuring in Playwright WebKit with JSC_useJIT=0: WebKit browser is not installed here (needs a download), so not used.

## Watch out
- Rendering is one physics state behind the input (~1 step, ~30 ms on iPad).
- The click/tap impulse is one-shot: the page sends it once and zeroes it. The worker keeps the max until the next step uses it, so it is not lost between steps.
- Position buffers are transferred back and forth. Never send back the buffer that is still the newest snapshot.
- Workers don't load over file://. Test through the http server.

In the code:
- cook/ciecz-czastki/worker.js: owns createSim and the step loop (light mode: one step of up to 4 base steps; otherwise up to 4 steps of 1).
- index.html: `physics` worker, snapA/snapB with EMA gap, `?fps` shows states/s and steps/s.
- No-JIT check on Mac: chromium.launch({ args: ['--js-flags=--jitless'] }). Result: 120 fps vs 83 before, physics at full 120/120 steps/s.
