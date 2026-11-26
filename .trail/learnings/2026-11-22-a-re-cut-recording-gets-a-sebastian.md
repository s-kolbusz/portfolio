---
title: "A re-cut recording gets a new file name, because the owner's browser kept the old clip and the hand-off looked broken"
author: Sebastian
date: 2026-11-22
branch: redesign/decyzje
cost: { minutes: 3, tokens: 40859 }
id: l-14143a50
scope: repo
status: active
src: agent
touches:
  - public/video/act4/piczura-wybiegi-60.jpg
  - public/video/act4/piczura-wybiegi-60.mp4
  - src/components/sections/how-i-work-case.tsx
---

## Decided
A re-cut recording gets a new file name, never the old one, because on 22.11 the owner's browser kept serving the old Runways clip from its cache after the file was replaced. Its first frame sits earlier on the page, so the photo strip and the recording looked completely out of sync, while headless checks with a fresh cache showed them matching.

## Watch out
When the owner reports something that a fresh test browser doesn't show, suspect his cache before the code. Media files in public/ are the usual suspect.
While the scenes turn, the scroll handler skips the scene's style writes (p is unchanged), because rewriting them on every scroll frame cost the playing video frames. A resize resets that guard.

In the code: website/src/components/sections/how-i-work-case.tsx (CLIPS names, `placed` guard in draw), public/video/act4/piczura-wybiegi-60.mp4.
