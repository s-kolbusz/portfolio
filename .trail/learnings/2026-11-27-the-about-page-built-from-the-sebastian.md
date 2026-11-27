---
title: The About page built from the approved board was rejected as flat and storyless; the drop must not be used as a full stop anywhere
author: Sebastian
date: 2026-11-27
branch: redesign/decyzje
cost: { minutes: 24, tokens: 206965 }
id: l-da063baf
scope: repo
status: active
src: agent
touches:
  - src/components/about/about-liquid.tsx
---

## Decided
On 2026-11-27 the owner rejected the built "Kim jestem" page as a whole: animations stutter even on a Mac, the page is boring and flat, it has good ideas but no single guiding thought or story, it is full of inconsistencies, spaces without meaning and cut-off text. He has rejected the drop as a full stop many times (also in act 4 of the home page) and does not want it used that way anywhere, even though the approved board drew it so. "works" after a project name reads as part of the name, not as its state.

## Tried and ruled out
Building the approved board literally and then patching the motion: one reveal for everything, then per-path reveals, then a page-wide liquid canvas chasing the scroll, then small pinned canvases, then a liquid living on the page (drops-stage `world` option). Each round fixed the last complaint and the page still had no story.

## Watch out
Before any more code, the page needs one guiding thought that every path serves; agree it with the owner first. Flag any part of an approved board that contradicts an earlier rejection before building it.

In the code: src/components/about/about-page.tsx, src/components/about/about-liquid.tsx, src/components/about/about.css; drops-stage.ts gained an optional `world` option (liquid lives on the page, canvas is a window). Nothing committed.
