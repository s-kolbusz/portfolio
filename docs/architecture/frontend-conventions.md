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
- Hook modules in `src/hooks/**` that export `useX` hooks must use `useX.ts` or `useX.tsx`.
- Utility modules in `src/components/**` that use `.ts` must use `kebab-case.ts`.
- TypeScript module files in `src/data`, `src/i18n`, and `src/lib` must use `kebab-case.ts`.

## Directory Boundaries

- `src/app`: routing, layouts, and page entrypoints.
- `src/components`: UI components and feature presentation.
- `src/hooks`: reusable hooks.
- `src/data`: static content and domain data helpers.
- `src/i18n`: locale routing and messages.
- `src/lib`: shared framework-agnostic helpers.

## Import Boundaries

The following import boundaries are hard rules:

- `components` cannot import from `app`.
- `hooks` cannot import from `app` or `components`.
- `data` cannot import from `app`, `components`, or `hooks`.
- `i18n` cannot import from `app`, `components`, or `hooks`.
- `lib` cannot import from `app`.

## Code-Splitting Policy

- Default to static imports.
- Use `next/dynamic` or `React.lazy` only for route-level modules or genuinely heavy client-only modules.
- Keep dynamic boundaries close to consuming route/section code.
- Do not use dynamic imports for tiny utility/UI modules.

## Automation Contracts

- `scripts/check-conventions.mjs` enforces naming and placement conventions.
- `scripts/check-architecture.mjs` enforces import boundary constraints.
- Both commands are CI hard-fail gates and must pass before release.
