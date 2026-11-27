---
title: "The first build of the About page was judged too static: a photo of the drop and one reveal repeated down the page do not reach the home page's level"
author: Sebastian
date: 2026-11-27
branch: redesign/decyzje
cost: { minutes: 1, tokens: 2056 }
id: l-4c47d07c
scope: repo
status: active
src: agent
---

## Decided
On 2026-11-27 the owner looked at the first build of "Kim jestem" under /v2 (shared subpage frame + approved middle B with C's posters). Verdict: the drop is a static image, the transitions are too alike and repeat down the whole page, and the page needs a lot of polish before it stands next to the home page.

## Tried and ruled out
Building the approved frame literally: the drops as JPG photos of the hero liquid (mix-blend multiply, radial mask) and one shared entry motion for every block (words rise from a mask, blocks fade up, the drop swells in as the full stop). It matches the boards, but on the live page it reads as a template in motion.

## Watch out
Before the next round, give each path its own motion from its own material and decide how the real liquid appears (static drop images were only stand-ins on the boards). Agree the motion story with the owner before coding (approved boards are content boards, not the build).

In the code: src/components/about/about-page.tsx, src/components/about/about.css, src/components/about/print-sentence.tsx; shared frame in src/components/subpage/subpage-frame.tsx, src/components/subpage/door.tsx, src/components/subpage/reveal.tsx, src/components/subpage/subpage.css; route src/app/v2/[locale]/about/page.tsx. Nothing committed yet.
