---
title: Act 4 as four static proof screens was rejected as final; it has to become one pinned scroll sequence with motion
author: Sebastian
date: 2026-11-20
branch: redesign/decyzje
cost: { minutes: 15, tokens: 116228 }
id: l-020e3237
scope: repo
status: active
src: agent
touches:
  - next.config.ts
  - public/images/act4/home-hero.webp
  - public/images/act4/home-menu.webp
  - public/images/act4/home-plugin.webp
  - public/images/act4/home-r2o.webp
  - public/images/act4/home-sheet.webp
  - public/images/act4/piczura-jelenie.webp
  - public/images/act4/piczura-miasto.webp
  - public/images/act4/piczura-photo-0.webp
  - public/images/act4/piczura-photo-1.webp
---

## Decided
The owner rejected the shipped act 4 "Don't take my word for it" as final. It was the approved frames ported 1:1 as four stacked static scenes. His words: no creativity, no interaction, flat, linear, broken layout. Good as boards, not as the product. The content and the proofs stay: roles behind one name with live measurements, the handoff relay, the map of the page, piczura.com, the door to stronypodhale.pl. The form is to become one pinned scene driven by scroll, where each beat turns into the next. The proposed scenario: the sentence splits into roles; a relay where the real liquid drop is passed between four people and loses pieces at each handoff, then crosses whole "with me"; the drop pours into a clicked role and opens its proof; the camera pulls out to the whole page with the visitor's path; the client's loose photos fly into the piczura.com scenes; the drop spreads into the stronypodhale sheet.

## Tried and ruled out
Static scenes revealed one by one, without designed motion. The layout also broke: the big date ran into the name, a long English role spilled past the bracket, and there were empty gaps between scenes.

## Watch out
Check every scene at 1280, 1440, 1920 and 375 px, in both languages, before showing it. The drop must have a reason to move (it is being passed), or it reads as the "lift on rails" the owner already rejected.

In the code: src/components/sections/how-i-work.tsx and how-i-work.css hold the rejected static version (commit 93803dcd).
