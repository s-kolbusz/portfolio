---
title: "A recording the visitor leaves rewinds to its first frame, so every pass through the hand-off is clean, not just the first"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 1, tokens: 1451 }
id: l-8ff1bd87
scope: repo
status: active
src: agent
touches:
  - src/components/sections/how-i-work-case.tsx
  - src/components/sections/how-i-work-case.css
---

## Decided
A recording the visitor leaves goes back to its first frame, because on 22.11 the owner found that every pass after the first broke the hand-off. Scrolling back left the Runways clip paused where it stopped, so the next crossfade showed that frame over the assembled photos, then the clip jumped to its start: two or three visible jumps per pass. Now, when the scroll goes back over the hand-off, the clip dissolves into the photos underneath (0.2 s, the same frame), rewinds unseen and comes back. A scene the scroll leaves fades out and then rewinds. Entering never needs a seek, so nothing flickers. The hand-off also has 24 px of slack, so a scroll resting on it doesn't toggle playback.

## Watch out
Always test the hand-off on repeated passes (in, play, back, in again), not just the first entry. The first pass looked right and hid this bug.

In the code: src/components/sections/how-i-work-case.tsx (playback effect: data-rewind, rewind timers; `on` with slack), src/components/sections/how-i-work-case.css (.cs-rec > [data-on][data-rewind]).
