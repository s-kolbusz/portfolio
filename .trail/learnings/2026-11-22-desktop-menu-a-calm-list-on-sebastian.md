---
title: "Desktop menu: a calm list on the left, and each part's sign on the right built from the site's own type, not screenshots or drawings"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 28, tokens: 306140 }
id: l-0476ffd9
scope: repo
status: active
src: agent
touches:
  - src/components/sections/how-i-work-case.css
  - src/components/sections/how-i-work-case.tsx
  - public/video/act4/piczura-wybiegi-60.jpg
  - public/video/act4/piczura-wybiegi-60.mp4
  - cook/akt4/pricing-board/index.html
  - src/i18n/messages/en.json
---

## Decided
On 2026-11-22 the owner liked a frame where the right half of the desktop menu shows the pointed-at part's "sign": one fact or element of that part, set in the site's own type and rules. Examples: "−50%" with before/after bars for ready2order, the four crafts on a line for act 4, the rates for Prices, "2016" for About. The fact sentence sits under it. He said that with signs the list needs no lens (bigger current name), so the list stays calm: current in ink, the rest quieter.

## Tried and ruled out
- Screenshots of each section on the right: "dumb", low quality, with the Next.js dev badge cropped in.
- Drawings or pictograms made in code: rejected twice the same day for the price list ("a joke").
- A lens list (current name huge, others shrinking with distance): near names came out too big and too close, far ones tiny; dropped once the signs carried the right half.

## Watch out
- Never mix languages in what the owner sees: PL keys hold Polish placeholders (nav.how_i_work "Jak pracuję", nav.prices "Cennik", navFacts, navSigns), EN keys English. All of it is placeholder copy until it goes through Codex.
- The touch list's scrolling box (max-height from --route-room) must stay off on desktop, or a resize while the menu is open clips the list.

In the code: src/components/ui/site-nav/nav-sign.tsx (one case per stop id), site-nav.tsx (NavSign replaces the old big word), site-nav.css (desktop block: .sign*), messages navSigns in src/i18n/messages/en.json and pl.json.
