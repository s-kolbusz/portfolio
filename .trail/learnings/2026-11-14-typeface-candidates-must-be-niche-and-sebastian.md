---
title: Typeface candidates must be niche and from open foundries; popular free fonts read as AI slop to the owner
author: Sebastian
date: 2026-11-14
branch: redesign/decyzje
cost: { minutes: 4, tokens: 36482 }
id: l-20dc3218
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - docs/design/2026-11-14-jak-pracuje-z-agentami-szkic.md
  - docs/design/README.md
---

## Decided
On 2026-11-15 the owner asked for display typeface candidates that are niche, free, from open foundries (attribution is fine), and actually fit the site. Shortlist with Polish letters confirmed on the foundry pages, all SIL OFL, all from Collletttivo: Sprat, Ortica, Ronzino, Absans. No choice made yet; he picks after seeing them live on his name.

## Tried and ruled out
Bricolage Grotesque and Instrument Serif: rejected at once as AI slop, "I see them everywhere". Apfel Grotezk: too soft for this site.

## Watch out
Do not propose whatever is trending on Google Fonts. Check Polish letters (ą ć ę ł ń ó ś ź ż) on the foundry's glyph table before proposing. The Velvetyne and uncut.wtf catalogues could not be read by the fetch tool; Bona Nova's licence and glyph set are unverified. Downloading font files needs his permission.

In the code: docs/design/2026-11-14-otwarcie-diagnoza-telefon.md section 5; fonts are loaded in src/app/[locale]/layout.tsx.
