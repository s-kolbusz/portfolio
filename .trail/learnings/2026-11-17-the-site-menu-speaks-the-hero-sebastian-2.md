---
title: "The site menu speaks the hero's language (paper, ink, green liquid), not stronypodhale's dark green and orange"
author: Sebastian
date: 2026-11-17
branch: redesign/decyzje
cost: { minutes: 8, tokens: 26934 }
id: l-57794eb3
scope: repo
status: active
replaces: l-2059a828
src: agent
---

## Decided
On 2026-11-17 the owner rejected a menu built as the dark water sheet with contour lines and orange numbered pins: dark green and orange are stronypodhale.pl's colours, and pins belong to its scene. The menu belongs to the site itself, the language of the hero and the transition: paper and ink, poured in by a front of the hero's green liquid from the MENU button. He liked the page scale in the bar (a hairline with a tick per part) and wants it polished.

## Tried and ruled out
- Docks and the dark-theme toggle: removed (they covered the hero on phones and did not fit). The theme is forced light.
- Orange pins as menu numbers, contour lines in the menu: "we are not making an outdoor site"; contour lines are already close to too many.
- A small glossy green drop as the "you are here" marker: "looks like a 2000s button". You-are-here is a plain ink pointer on the scale and the current menu item set in the hero's green.

## Watch out
- Never lock page scroll with overflow: hidden on html/body: the scrollbar disappears, the width changes and the liquid hero rebuilds itself, flashing white. Stop wheel/touchmove on the menu and stop Lenis instead.
- Elements shown from display: none skip CSS transitions; the menu uses visibility: hidden, and reveal delays are measured before the phase switches to open.
- stronypodhale.pl in the menu is set exactly as its logo; that is the only orange there.

In the code: src/components/ui/site-nav/ (site-nav.tsx, site-nav.css, menu-water.ts, stops.ts + tests); forcedTheme="light" in src/app/[locale]/layout.tsx.
