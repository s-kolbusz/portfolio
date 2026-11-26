---
title: "The site menu speaks the hero's language (paper, ink, green liquid), not stronypodhale's dark green and orange"
author: Sebastian
date: 2026-11-17
branch: redesign/decyzje
cost: { minutes: 29, tokens: 296045 }
id: l-2059a828
scope: repo
status: active
src: agent
touches:
  - cook/nawigacja/index.html
  - src/components/ui/site-nav/stops.ts
  - src/components/ui/site-nav/stops.test.ts
  - src/components/ui/site-nav/menu-water.ts
  - src/components/ui/site-nav/site-nav.tsx
  - src/components/ui/site-nav/site-nav.css
---

## Decided
On 2026-11-17 the owner rejected a menu built as the dark water sheet with contour lines and orange numbered pins: dark green and orange are stronypodhale.pl's colours, and pins belong to its scene. The menu must belong to the site itself: the language of the hero and the transition. It is now paper and ink, poured in by a front of the hero's green liquid from the MENU button; "you are here" is the hero's small green drop. He liked the page scale in the bar (a hairline with a tick per part, the drop riding along it) and asked to keep polishing it.

## Tried and ruled out
- Docks (bottom icon dock, theme/language pill): removed; they covered the hero on phones and did not fit the design. The dark-theme toggle went with them (the theme is forced light).
- Orange pins as menu numbers, and contour lines in the menu: "we are not making an outdoor site"; the contour lines are already close to too many.

## Watch out
- Never lock page scroll with overflow: hidden on html/body. Hiding the scrollbar changes the page width, the liquid hero sees a width change and rebuilds itself, which flashes white. Stop wheel and touchmove on the menu instead, and stop Lenis.
- Elements that start as display: none do not run CSS transitions when shown; the menu uses visibility: hidden, and the per-line reveal delays are measured before the phase switches to open.
- stronypodhale.pl in the menu is set exactly as its logo (Cabinet Grotesk, two weights, two colours); that is the only orange allowed there.

In the code: src/components/ui/site-nav/ (site-nav.tsx, site-nav.css, menu-water.ts, stops.ts with tests); client-overlays.tsx loads it; forcedTheme="light" in src/app/[locale]/layout.tsx.
