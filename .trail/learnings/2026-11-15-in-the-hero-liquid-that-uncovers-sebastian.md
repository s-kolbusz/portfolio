---
title: "In the hero, liquid that uncovers a photo or screenshot is unacceptable; it stays only in the hero-to-section transition"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 1, tokens: 11527 }
id: l-b62f5ea0
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-09-25-przejscie-sygnaturowe-scenariusz.md
  - src/components/sections/hero-assembly.tsx
  - src/components/sections/hero-sample.tsx
---

## Decided
On 2026-11-15 the owner said the "under the surface" idea (liquid or the blob uncovering a screenshot or photo) is unacceptable in the hero: the hero has to impress, surprise and floor the viewer, "not be a blob of goo covering a photo". The same idea works where it already is, in the transition from the hero into a section, and he would not change that beyond the scope already agreed. This reverses his note of 2026-11-14 that he liked "the blob as a window onto work under water" as one of the hero stories.

## Tried and ruled out
- Proposing the blob as a wavy frame for real screenshots in the hero, as a way out after the pictograms were rejected: he had seen that direction already and dislikes it there.

## Watch out
- Before proposing a hero idea, check it against what was already shown and rejected: pictograms built from liquid, liquid uncovering photos, rearranging name and blob.
- He is open to tools outside the browser (he named the ArtCraft family: AniCraft, EffectCraft) and expects a tool to be read through properly before it is judged.

In the code: the transition that keeps the idea is the signature scene described in `docs/design/2026-09-25-przejscie-sygnaturowe-scenariusz.md`; the hero samples live in `src/components/sections/hero-assembly.tsx` and `src/components/sections/hero-sample.tsx`.
