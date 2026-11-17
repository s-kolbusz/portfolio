---
title: "On the water sheet the cursor drop must stay glass like on the hero, and the sheet colour must come from the screenshot's edges the way the live scene computes…"
author: Sebastian
date: 2026-11-17
branch: redesign/decyzje
cost: { minutes: 7, tokens: 64209 }
id: l-3a1fa15a
scope: repo
status: active
src: agent
touches:
  - cook/ciecz-czastki/index.html
---

## Decided
- After reviewing on 2026-11-17, the owner set these rules for the stronypodhale scene built from the new liquid:
  - The drop on the sheet must look like liquid glass, as it does on the hero, not plasticine.
  - The hero must sink before the page surfaces. A frame where hero elements are still visible looked bad.
  - The screenshot rises from depth (zoom-in) and then moves into place under the heading, with the link below it.
  - The contour lines stay on the sheet, embossed in a lighter green.
  - The frame's edge must blend into the sheet the way it does in the live redesign.

## Tried and ruled out
- Tinting the drop green with no shape of its own. The flood makes the distance field cover the whole screen, so the drop lost the edge that gives it the rolled rim and refraction, and read as plasticine. It now takes its normals and rim from its own density channel.
- A median over raw edge pixels for the sheet colour. It came out slightly off, so the frame's right edge showed a seam. The live scene's method fixes it: scale the image to 64×36, then take the per-channel median of columns 1, 2, 61 and 62 plus row 34. The sheet also loses its glare as it clears, so the background is exactly that colour.

## Watch out
- Uniforms set inside transition() need gl.useProgram(main) first. It runs while other programs are bound.

In the code:
- cook/ciecz-czastki/index.html: the drop normals block uses rebelF (density channel G).
- The contour lines' colour shifts from INK to BG·3.2 as uDark grows.
- imgRect(zoom, act) and heading(t) are driven by P.
