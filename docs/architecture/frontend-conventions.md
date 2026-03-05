# Frontend Conventions

This document is the single source of truth for frontend structure and naming conventions.

## Scope

These rules apply to all code in `src/` and are enforced in CI by:

- `pnpm check:conventions`
- `pnpm check:architecture`

## Naming Rules

- Directory names must be `lowercase-kebab`.
- Next.js special route segments are allowed: `[segment]`, `[[segment]]`, `(group)`, `@slot`.
- React component files in `src/components/**` must use `PascalCase.tsx`.
- Hook modules in `src/shared/hooks/**` and `src/features/*/hooks/**` that export `useX` hooks must use `useX.ts` or `useX.tsx`.
- Utility modules in `src/components/**` that use `.ts` must use `kebab-case.ts`.
- TypeScript module files in `src/data`, `src/i18n`, and `src/lib` must use `kebab-case.ts`.

## Directory Boundaries

- `src/app`: routing, layouts, and page entrypoints.
- `src/features`: feature-owned modules (for example `work`, `resume`, `navigation`), each with local `components`, `data`, `hooks`, and `lib`.
- `src/shared`: cross-feature modules (`ui`, `hooks`, `lib`, `config`) that are safe to reuse across routes/features.
- `src/components`, `src/data`, `src/lib`: legacy layers kept temporarily for incremental migration.
- `src/hooks` is retired; shared hooks must live in `src/shared/hooks` and feature-owned hooks must live in `src/features/*/hooks`.

## Runtime vs Config

- `src/shared/config` and feature/local constants modules must contain static data only.
- Hook-bearing or environment-dependent behavior belongs in hooks or runtime lib modules, not alongside config exports.
- `src/i18n`: locale routing and messages.

## Import Boundaries

The following import boundaries are hard rules:

- `components` cannot import from `app`.
- `features` cannot import from `app`.
- `shared` cannot import from `app`, `components`, or `features`.
- `hooks` cannot import from `app` or `components`.
- `data` cannot import from `app`, `components`, or `hooks`.
- `i18n` cannot import from `app`, `components`, or `hooks`.
- `lib` cannot import from `app`.
- Feature modules cannot import directly from another feature module (`features/<a>` cannot import `features/<b>`).

## Incremental Migration Rule

- During migration, feature/shared code may temporarily consume legacy `src/lib` and `src/data` modules where equivalents are not yet moved.
- New shared primitives should be authored in `src/shared/ui` instead of `src/components/ui`.
- Migration steps are tracked in `docs/architecture/feature-first-migration.md`.

## Code-Splitting Policy

- Default to static imports.
- Use `next/dynamic` or `React.lazy` only for route-level modules or genuinely heavy client-only modules.
- Keep dynamic boundaries close to consuming route/section code.
- Do not use dynamic imports for tiny utility/UI modules.

## Automation Contracts

- `scripts/check-conventions.mjs` enforces naming and placement conventions.
- `scripts/check-architecture.mjs` enforces import boundary constraints.
- Both commands are CI hard-fail gates and must pass before release.
