---
title: "Text wrapped around a drop was ruled out as act 4's finale; the narrow lines read one at a time are the floor"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 1, tokens: 5649 }
id: l-295a084c
scope: repo
status: active
replaces: l-8612cf59
src: agent
touches:
  - src/components/sections/how-i-work.tsx
---

## Decided
On 2026-11-18 the owner rejected the act 4 finale twice: first as all the act's text around a drifting drop, then as the four heavy lines around a drop that moves only when pushed. His words: "a complete dud and no idea, no entrance, no interaction". The earlier narrow lines on light paper "looked better and more professional", so act 4 is back to that version. The next act 4 idea gets shown as a few still frames (entrance, interaction, end) before any code.

## Tried and ruled out
Text flowing around a live drop. It is a known typographic trick: nothing happens on its own, pushing the drop means nothing, and at very wide screens the drop covered the text. Two rounds of fixes did not save the idea, so do not bring it back as act 4's finale.

## Watch out
Start from the scene's story (what the liquid does by itself and in answer to the visitor), not from a technique. The hero works because the liquid acts visibly on its own.

In the code: src/components/sections/how-i-work.tsx is mounted again in the home page; the finale files were deleted. The drops stage keeps an optional `shape` callback (particles in CSS px each frame), unused for now. Copy keys howIWork.more.* stay for scenes 1–3.
