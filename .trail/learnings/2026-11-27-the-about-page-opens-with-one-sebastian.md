---
title: The About page opens with one paragraph of plain facts and no drop; its paths keep long pill headings and plain human copy from Codex
author: Sebastian
date: 2026-11-27
branch: redesign/decyzje
cost: { minutes: 61, tokens: 681282 }
id: l-02e3dda0
scope: repo
status: active
src: agent
---

## Decided
- First screen (owner 2026-11-27, direction "B, one paragraph"; A was tempting, C is out): the title "I don't take things on trust." runs straight on into one big paragraph of facts (Zakopane, frontend developer, home, printer, cars, plugin, Airchos) with small pills and mono notes inside it, and a short line plus label at the bottom edge. No drop anywhere on About: a drop pasted only on the first screen looked fake, and a full-width title alone was rejected.
- The paragraph's left edge is the content's left edge at every width, the same as every heading below; the owner asked explicitly that alignment be right on every screen.
- The first screen fills the screen on phones too, with the line on the bottom edge. With min-height 0 the next part, still hidden until it scrolls in, left a lopsided empty band at the bottom of the phone.
- Copy must read as human, not AI-made: every part has its own shape, no question-headline + punchline template. Polish written from scratch by Codex, English separately. "Home Assistant" is never declined in Polish.
- The paths (Home, Printer, Cars, Projects) keep long first-person headings with photo pills inside the sentence; the owner liked them and asked to restore them after they were dropped. The Home Assistant dashboard tiles stay too.
- ready2order is off this page (it is not open source or a plugin). VCDS is shown by the drawn readout, not a photo. aspect-preview is set in mono and links to npm.

## Tried and ruled out
- A liquid drop on the first screen, then text or contour-line ground under it as a lens: questions under the lens were called dumb and ugly; the engine change was reverted.

## Watch out
- The paragraph size follows the width but is held under the screen height (svh) so the longer English fits one screen at 1280x800 and 1600x900; on screens wider than 2:1 it may take more height. Re-measure 390, 820, 1280, 1600, 2560 and 3440 in both languages after any copy change.
- Scroll-driven animations must use longhands (animation-name, -timeline, -range, -duration: auto): the minifier drops an `animation:` shorthand written next to `animation-timeline`, and the animation silently does nothing.

In the code: src/components/about/about-page.tsx (AboutOpen), src/components/about/about.css (.ab-open, .ab-para), src/i18n/messages/{pl,en}.json (aboutPage.*).
