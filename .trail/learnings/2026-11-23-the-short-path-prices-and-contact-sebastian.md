---
title: "The short path: Prices and Contact always sit in the top bar beside MENU, and jump through the liquid flood"
author: Sebastian
date: 2026-11-23
branch: redesign/decyzje
cost: { minutes: 6, tokens: 309114 }
id: l-3ea565f9
scope: repo
status: active
src: agent
touches:
  - src/components/sections/how-i-work-case.tsx
  - src/components/ui/site-nav/nav-sign.tsx
  - src/components/ui/site-nav/site-nav.tsx
  - src/components/ui/site-nav/stops.test.ts
  - src/components/ui/site-nav/stops.ts
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
---

## Decided
On 2026-11-22 the owner said the page lacks plain navigation: reaching one piece of information means wading through a long showcase of pinned scenes. On 2026-11-23 he approved one frame: PRICES and CONTACT always in the top bar, beside MENU, in MENU's type. Who he is stays covered by the hero and the SK corner (it scrolls back to the top). A click floods the screen from the word, the page moves while covered and the flood drains on the target, the same as a jump from the menu, so no pinned scene is scrolled through. Prices lands on the covered sheet.

## Watch out
- On phones (≤700 px) the two words and the current part's name do not fit together, so the words take its place. The menu still shows where you are.
- The words hide while the menu is open (the menu has its own list).
- CONTACT still leads to the old contact section until that part is redesigned.

In the code: website/src/components/ui/site-nav/site-nav.tsx (SHORT, jump), site-nav.css (.site-bar__short, .site-bar__go, phone block hides .site-bar__where), messages nav.short.
