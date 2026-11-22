---
title: "Act 4 is three parts in the menu, and a part laid over the one before starts when it covers the screen"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 5, tokens: 104356 }
id: l-95f9231c
scope: repo
status: active
src: agent
---

## Decided
On 2026-11-22 the owner said "How I work" was really three sections behind one menu entry, a very long stretch of pinned scroll. Act 4 now has three parts: "How I work" (the line and the page off the shelf), "piczura.com" (screen 3, a brand label, never translated) and "Prices" (the close).

## Watch out
- The close is laid 150svh over piczura's last frame (negative margin), so its element top passes the reading line long before anything of it shows. Counting it from the reading line lit "Prices" while piczura was still on screen. A stop can now say where it starts (`at`, screens after its top reached the top of the screen) and where a menu jump lands (`land`). Prices: at 0.25 (paper over half the screen), land 0.5 (fully covered).
- These two numbers follow the close's S.cover in how-i-work-end.tsx. If the close changes how its paper rises, change them too.
- Only stronypodhale.pl (id `work`) is drawn as the wordmark in the list; other brand stops show their label as text.

In the code: website/src/components/ui/site-nav/stops.ts (piczura stop, at/land), site-nav.tsx (scrollTo offset, wordmark only for work), nav-sign.tsx (piczura's four scenes), how-i-work-case.tsx (id="piczura"), messages navSigns.piczura and navFacts.piczura.
