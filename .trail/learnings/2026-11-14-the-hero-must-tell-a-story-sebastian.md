---
title: "The hero must tell a story: matter tries on the shapes of things the owner makes; name and blob alone are not a story"
author: Sebastian
date: 2026-11-14
branch: redesign/decyzje
cost: { minutes: 11, tokens: 43026 }
id: l-563e8574
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-jak-pracuje-z-agentami-szkic.md
  - docs/design/README.md
  - docs/design/2026-11-14-historia-strony-koncept.md
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - src/components/sections/hero.tsx
  - src/hooks/use-hero-animation.ts
---

## Decided
On 2026-11-14 the owner said the hero is not sacred: the blob stays the site's character, but "blob + name" is two elements and zero storytelling. Leading story: the same matter solidifies in turn into things he makes and melts again; touch dissolves a shape; scroll stays with the first one and enters the stronypodhale scene. 4-5 shapes (three is too few). Phone layout: poster (blob large and off-screen, name huge bottom-left as a signature, role and sentence small in corners). On load a full green sheet drains into the blob with a wavy edge and reveals the name. The typewriter may go; the blob should react to touch.

## Tried and ruled out
Rearranging name and blob (layout and reveal only) was rejected as rehashing the same idea. No car among the shapes. No internal stronypodhale roles in captions ("site for a guesthouse"): a browser shape is simply stronypodhale; use a plugin or an IDE window rather than a second browser.

## Watch out
Distorting the letters is allowed. The September rejection of melting letters was about amateur execution, not the idea; the bar is Awwwards-level implementation. He also liked two other stories (blob as a window onto work under water; matter breaking into labelled parts and reassembling) and wants samples in real code before choosing. Do not start by asking about device or browser.

In the code: docs/design/2026-11-14-otwarcie-diagnoza-telefon.md section 5, src/components/sections/hero.tsx, src/hooks/use-hero-animation.ts.
