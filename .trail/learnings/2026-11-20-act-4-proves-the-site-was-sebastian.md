---
title: "Act 4 proves the site was hand-made by pointing at things the visitor can check, not by counting lines of code"
author: Sebastian
date: 2026-11-20
branch: redesign/decyzje
cost: { minutes: 1, tokens: 1927 }
id: l-54440c4b
scope: repo
status: active
src: agent
touches:
  - src/components/sections/how-i-work.tsx
---

## Decided
The owner approved act 4 "Don't take my word for it": each of the four lines gets proof the visitor can check right on this site. The owner ruled out lines of code as proof: "it's no information, nobody needs it for anything". In the ledger of what is mine and what is borrowed, each own piece now says where to check it (liquid: you moved it at the very top; cursor: it's in your hand now; menu: open it). The proof for "I add my own vision" is piczura.com: the client came with photos, and he got a scene per role and session instead of an album.

## Tried and ruled out
Line counts per part (liquid 4,324, menu 1,669…) and their total. Also, in the first frames: a step bar 01–04, grey captions above every block, green bars under the numbers, a big "0" as a stat, and "verified:" tags. The owner called the first frames AI slop. The site's name repeated in every credits row looked bad, so it now appears once, after a bracket that gathers every role.

## Watch out
The frames are stills; the copy still goes through Codex. Measured numbers (84 ms) are examples until they are measured live.

In the code: the act lives in src/components/sections/how-i-work.tsx (still the old version). The frames are on the lab page src/app/[locale]/design/akt4 (page.tsx, frames.css), screenshots via cook/akt4/proof.mjs, piczura.com shots in public/images/lab-akt4 (uncommitted).
