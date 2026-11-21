---
title: "The aspect-preview crop fields stay greyed out until a crop is drawn; that is right, do not change the plugin"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 1, tokens: 98358 }
id: l-66b9907b
scope: repo
status: active
src: agent
touches:
  - src/components/sections/ready2order-scene.tsx
---

## Decided
On 2026-11-18 the owner first reported that the crop numbers in the plugin demo "do not update". He then saw that the greyed-out zeros are the crop's own data: with no crop drawn there is nothing to show, and the fields follow the mode picked beside them. A plugin change (fields active from the start, release 0.4.1) was proposed and turned down: do not break something that works.

## Watch out
Anything faded in on scroll that holds buttons or links must be inert until shown. Otherwise the cursor ring wraps invisible items (ready2order's list did this).

In the code: payload-plugin-aspect-preview `AspectPreviewEditor` (crop inputs disabled without a real crop); src/components/sections/ready2order-scene.tsx (`.r2o-done` inert until shown).
