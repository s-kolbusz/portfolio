---
title: "The ready2order map shows modules like a bundle analyser, its physics runs in a worker, and a rebuild must restart the preview server"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 10, tokens: 82404 }
id: l-43cc1bb0
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/canvas/liquid-hero/drops.worker.ts
  - src/components/sections/ready2order-scene.tsx
  - src/components/sections/ready2order-scene.css
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
---

## Decided
- On 2026-11-18 the owner said empty block rectangles do not read as a bundle. The earlier map with modules inside looked better. Each block now draws its modules from the first frame, and the half-size bundle has its own.
- The owner found the scene slow and stuttering. Its particle physics now runs in a web worker, the same way the hero's does. The page only sends targets and the pointer.

## Watch out
- `pnpm build` rewrites .next under a running `next start` preview, which then breaks. The owner was left with no server twice. After a build, restart the site preview right away (preview_stop, then preview_start site-3107).
- `pnpm format` also reformats untracked-style sketch files in cook/. Restore them with git checkout afterwards.
- Lines under the liquid must stay faint (mixed 0.3 toward the ground), or the glass reads as cracked.

In the code: src/components/canvas/liquid-hero/drops.worker.ts, drops-stage.ts (modules(), uRS = alpha, dashed, modules, edge), ready2order-scene.tsx (frameAt rects).
