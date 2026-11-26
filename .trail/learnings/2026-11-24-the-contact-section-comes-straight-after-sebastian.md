---
title: "The contact section comes straight after the price list; the old about, projects, services and calculator left the home page"
author: Sebastian
date: 2026-11-24
branch: redesign/decyzje
cost: { minutes: 24, tokens: 414410 }
id: l-5adf1519
scope: repo
status: active
src: agent
touches:
  - cook/kontakt/index.html
  - src/data/contact.ts
  - src/components/sections/contact.tsx
  - src/components/sections/contact.css
  - src/components/ui/site-nav/stops.ts
---

## Decided
On 2026-11-24 the owner approved a new contact section, the page's last part, right after the act 4 price list. The e-mail runs in Mattone Black across the full content width. Under it are copy and open-mail actions and the reply time. Then the phone (from the public CV, with the owner's yes), LinkedIn, GitHub and X sit large on four equal columns, and the footer is the bottom of the same screen. The same day he asked why old-design parts still sat between the prices and the contact, and approved removing about, projects, services and the print calculator from the home page and the menu stops. Their files stay in the repo until they come back in the new design.

## Tried and ruled out
- Three numbered step cards ("you write / I reply / call and price"): "over the top, clogging the interface with junk". Show the other channels instead.
- Gaps picked by eye ("random and unconsidered"). Every size and gap in the section now comes from system.css: the page margin, the 8 px scale, the label and lead text roles.

## Watch out
- Mattone Black is very wide: the address is about 12.9 em, the phone number about 11.4 em. Both are sized from the column width, otherwise they run into the next column at 1600.
- "Napisz do mnie" closes the price list and opens the contact; the repeat is for the Codex copy pass.

In the code: src/components/sections/contact.tsx/.css, src/data/contact.ts (CONTACT_EMAIL, contactLinks with phone), messages contact.*, src/components/ui/site-nav/stops.ts (stops end prices → contact), src/app/[locale]/page.tsx. Mock and stills: cook/kontakt/.
