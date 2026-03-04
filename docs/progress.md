# Progress Log

## Current Phase

- Phase: `Phase 2 - i18n, Routing, and Metadata Architecture Fixes`
- Status: `Completed`
- Active Branch: `codex/refactoring`

## Completed Items (Phase 2)

- [x] Centralized locale validation/ownership with `src/i18n/locale.ts` and applied it in locale layout + localized pages.
- [x] Updated `src/app/[locale]/layout.tsx` to validate locale, call `setRequestLocale(locale)`, and pass locale/messages through `NextIntlClientProvider`.
- [x] Removed all `locale as Locale` casts in Phase 2 scope and tightened locale typing in route/component usage.
- [x] Made static intent explicit for locale routes via `generateStaticParams`, `dynamicParams = false`, and `dynamic = 'force-static'`.
- [x] Replaced direct `next/link` usage with locale-aware wrappers for internal links in localized flows; replaced external `next/link` usage with native anchors.
- [x] Removed `next/head` from App Router root layout and kept JSON-LD in App Router-native script rendering.
- [x] Added root `<html lang>` strategy: default server lang + client sync (`HtmlLangSync`) from active locale.
- [x] Standardized site host/domain via `src/lib/site.ts` and reused it across root metadata + JSON-LD URLs.
- [x] Fixed title composition by removing per-page branding suffixes where root metadata template already applies.
- [x] Added metadata snapshot tests for home, CV, projects index, and project detail (`src/lib/page-metadata.test.ts`).

## Verification Snapshot

- `pnpm lint`: pass
- `pnpm typecheck`: pass
- `pnpm test`: pass (6 tests)
- `pnpm format:check`: pass
- `pnpm build`: pass
- Build route output now shows locale routes as SSG (`●`) with generated static paths:
  - `/[locale]` -> `/en`, `/pl`
  - `/[locale]/cv` -> `/en/cv`, `/pl/cv`
  - `/[locale]/projects` -> `/en/projects`, `/pl/projects`
  - `/[locale]/projects/[slug]` -> prerendered localized project detail paths

## Errors Encountered (Log)

- `2026-03-04`: `pnpm format:check` initially failed on `src/lib/page-metadata.ts`.
- `2026-03-04`: Resolved by formatting the file with Prettier and re-running checks.
