---
title: "The subpage template is only a shared frame; every subpage designs its own middle, and the ready2order frame is not the template"
author: Sebastian
date: 2026-11-26
branch: redesign/decyzje
cost: { minutes: 1, tokens: 18392 }
id: l-3b87bcd2
scope: repo
status: active
src: agent
touches:
  - src/components/sections/ready2order-scene.tsx
---

## Decided
On 2026-11-26 the owner approved the ready2order case-study frame (dark scene colour, question, three decisions over the same bundle map, receipt, −50%, contact, door to piczura.com) as the design of the ready2order page only. He rejected it as the universal subpage template: "every subpage can't look like ready2order".
So the shared template is the frame only: the top bar, the first-screen grammar (label, Mattone question or title, facts), the ending (the home page's contact block, then a door to the next page), the type and spacing system, and the motion on entry and on the door. Everything between the first screen and the ending is designed per page from its own material.

## Tried and ruled out
Presenting one fully designed page as "the template". The owner reads such a frame as every page looking the same.

## Watch out
Show the template as the frame applied to two or three different pages (for example ready2order, "Kim jestem" with its paths, "Jak pracuję z agentami"), so the shared part and the free part are both visible.

In the code: nothing built yet. Subpages will live under src/app/v2/[locale]/ next to page.tsx and share its layout.tsx; the ready2order page grows out of src/components/sections/ready2order-scene.tsx. The approved ready2order frame (r2o.html plus screenshots) lives outside the repo in the session notes folder, podfolder podstrona-kadr.
