---
title: "Quick Start"
---

## Requirements

- Node.js `>= 22.12` (the documentation site uses Astro 7, a hard requirement)
- pnpm `10.x` (the repo is locked to `pnpm@10.34.5`)

## Install

```bash
pnpm install
```

This repository has **zero runtime dependencies** (`dependencies` is empty) — everything installed is build-time tooling (tsx, ajv, handlebars, vitest, astro, etc.).

## Run codegen once

```bash
pnpm codegen
```

This command executes `tsx codegen/src/index.ts`. The full flow:

1. Read the `package.json` version number
2. Load and validate `tokens/*.json` (Ajv structural validation)
3. Resolve refs and merge dark mode (semantic checks: type matching, reference integrity, cycle detection)
4. Load and validate `specs/*.json` and `cases/*.json`
5. **Delete the entire `dist/` and rebuild it**
6. Run the 5 targets in order (android → ios → harmony → c → docs)

Output in `dist/`:

```
  [android] android/top/lhgb/ui/tokens/LhTokens.kt
  [android] android/top/lhgb/ui/tokens/LhDarkTokens.kt
  ...
codegen complete: 5 targets, N files, version v0.0.1
```

The file count changes with the token content (when shadow tokens exist, ios / harmony each get one extra shadow carrier file) — treat the actual output as authoritative.

## Verify

```bash
pnpm verify          # = pnpm verify:tokens && pnpm verify:specs
```

- `verify:tokens`: token schema + reference integrity + **critical text/background contrast ratio >=4.5:1 (WCAG AA)** + **platform-specific syntax patrol (`var()` / `rem` / `sp` / `dp`)**, plus a report on **orphan dark paths** (keys declared in the dark file that do not exist in the light set) and dark keys missing a type.
- `verify:specs`: consistency between specs and cases (e.g. whether props / events referenced by a case exist in the spec).

## Test

```bash
pnpm test
```

The snapshot tests mirror everything in `dist/`. After changing tokens or templates the snapshots fail; once you confirm the diff is correct, update them with `pnpm test -- -u`.

## Documentation site

```bash
pnpm docs:dev        # local preview at http://localhost:5185/lhui/core/
pnpm docs:build      # production build (base is /lhui/core/)
pnpm docs:preview    # preview the production build
```

The three reference pages (tokens / contracts / cases) of the documentation site read the `tokens/`, `specs/`, and `cases/` sources of truth directly at build time — **no need to run codegen first**.

## Common combinations

| Scenario | Command |
| --- | --- |
| Changed tokens, want artifacts | `pnpm codegen` |
| Changed tokens, want artifacts + verification | `pnpm build` (= codegen + verify) |
| Changed templates, want artifacts + snapshots | `pnpm codegen && pnpm test -- -u` |
| Only want the token quick-reference table | after `pnpm codegen`, open `dist/docs/tokens.md` |

## Where the artifacts are consumed

Each native target consumes the artifacts for its platform under `dist/`:

- Android: the Kotlin files under `dist/android/`
- iOS: the Swift files under `dist/ios/`
- HarmonyOS: the ArkTS files under `dist/harmony/`
- Windows: the C# files under `dist/windows/`

For the local-linking mechanism (token changes take effect immediately, without a release), see [Local Linking](./local-linking).
