---
title: "The home page's visual test compares only the contact section; a full-page screenshot of the redesign times out"
author: Sebastian
date: 2026-11-24
branch: redesign/decyzje
cost: { minutes: 14, tokens: 52625 }
id: l-ebd94516
scope: repo
status: active
src: agent
touches:
  - e2e/visual-regression.spec.ts
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
  - "src/app/[locale]/page.tsx"
  - src/components/features/project/project-book/project-book.tsx
  - src/components/features/project/project-book/project-card-stack.tsx
  - src/components/sections/contact.css
  - src/components/sections/contact.tsx
---

## Decided
The home page visual regression test now screenshots only the static contact section. The redesigned home page is about 27 000 px of pinned canvas scenes, so a full-page screenshot shows no real state of the page.

## Tried and ruled out
- The old full-page home screenshot, with styles that force every element visible and hide canvases. In the Update Visual Snapshots workflow it hit the 30 s test timeout three times (2026-11-24).

## Watch out
- Snapshots must come from the Linux workflow (workflow_dispatch on the branch), never from macOS. The workflow commits them back to the branch, so pull before the next commit.
- The footer shows the current year, so the contact snapshot changes every January.

In the code: e2e/visual-regression.spec.ts ('home contact section matches baseline', home-contact-en.png); .github/workflows/update-snapshots.yml.
