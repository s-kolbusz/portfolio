---
title: "The constant-width ring at the liquid's edge came from building height out of fixed-radius splats; height from a distance field removes it"
author: Sebastian
date: 2026-11-16
branch: redesign/decyzje
cost: { minutes: 36, tokens: 163216 }
id: l-925bd633
scope: repo
status: active
src: agent
---

## Decided
On 2026-11-16 the owner kept seeing a ring along the liquid's edge: the same width everywhere, refracting light the same way on every stretch, and sometimes two rings. The cause was the method. Height was built from particles splatted with fixed-radius kernels, so every edge had the same falloff width. Fix: compute a distance-to-edge field every frame with jump flooding (at quarter resolution), blur it lightly, and set height = sqrt(distance) plus irregular noise waves. sqrt has no built-in width, so a thin arm gets a narrow edge and the big body a wide one.

## Tried and ruled out
- Tuning the splat-based height (pow profiles, mixing mid and wide domes, fading one inside the body): it only moved the ring, and mixing two kernels made two rings.
- Widening the coverage (alpha) band to soften edges: that band has a fixed width too, and it read as an outer translucent ring.
- Three plane-sine waves: they read as uniform and followed the drop's outline. Domain-warped value noise with varying amplitude reads as natural.

## Watch out
- At half resolution the jump flood cost a lot of frame rate (about 48 fps in the headless test); at quarter resolution it ran at about 96.
- Without a light blur of the distance field, the medial-axis ridge makes a crease of light along the middle of the drop.
- The owner wants a liquid-glass look. Diffuse (Lambert) shading made it read as plasticine and was removed.

In the code: cook/ciecz-czastki/index.html — distanceField() (jfaInit, jfaStep, jfaDist, blur), hgt(), waveField().
