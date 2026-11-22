---
title: "Desktop menu: names pinned to the proportional ruler stay unreadable or noisy; next try is a calm list beside a plain progress line"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 19, tokens: 148605 }
id: l-071057e7
scope: repo
status: active
src: agent
touches:
  - src/components/sections/how-i-work-case.tsx
  - src/components/ui/site-nav/site-nav.css
  - src/components/ui/site-nav/site-nav.tsx
  - src/components/ui/site-nav/stops.test.ts
  - src/components/ui/site-nav/stops.ts
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
---

## Decided
On 2026-11-22 the owner called the desktop menu "creative but hard to read" and approved a frame of it as a calm list: the touch list's big names, one per row, with the current part in full ink and the rest quieter. The scale becomes a plain travelled line beside the list. Hovering a name shows that part's one-line fact. Built the same day: on desktop the rows surface one after another behind the liquid, the ink runs along the line to the part under the pointer or keyboard focus, and that name dries from a blur into ink. The list rules now apply everywhere; the desktop block only adds sizes, the sentence and the motion.

## Tried and ruled out
- Names hanging vertically from the ticks (the shipped version since 18.11): 10 px grey mono, written top to bottom, and clustered at the left because the first four parts are short. The owner said it's hard to read.
- Upright names spaced evenly, alternating above and below the ruler, each joined to its tick by an elbow callout line. The owner said it was "even more mess and noise, just denser". Any layout that pins all 11 names to the proportional ruler at once needs either tiny text or many lines.

## Watch out
The ruler is proportional to page length, so its first ticks always crowd together. Don't anchor readable labels to tick positions.

In the code: frames live in docs/design/exploration/menu-desktop (frame.js = the rejected callouts, frame-list.css = the list frame, injected on the live menu for screenshots). Shipped desktop rules: site-nav.css .ruler__name (writing-mode: vertical-rl).
