---
title: "English site copy uses English idioms and plain role words, never word-for-word translations of Polish phrases"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 1, tokens: 1753 }
id: l-3067b307
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-15-how-i-work-with-agents-en.md
---

## Decided
On 2026-11-15 the owner read the English version of the "How I work with agents" copy and corrected the translation: Polish sayings are not translated literally when an English idiom exists. He supplied "a round of questions to pick holes in the idea" himself. The title is "How I work with agents" (statement order, not a question). He chose "security" for "bezpieczeństwo", because he means code without vulnerabilities and no secrets in the repository.

## Tried and ruled out
"Looks for the hole in the idea", a calque of the Polish phrase. "Executor" for the agent doing the work: he said it is not a good word, so it became "one agent". "Open questions about myself don't work on me": sounded odd to him.

## Watch out
Names used across the whole site (the English word for "droga", the spelling variant) are his to choose once for the site, not per page. The reasons for each choice are listed at the end of the English document.

In the code:
- `docs/design/2026-11-15-how-i-work-with-agents-en.md` (list "Translation choices to check" at the end)
