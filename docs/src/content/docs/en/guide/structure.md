---
title: "Directory Structure"
---

```
lh-ui-core/
├── tokens/       single source of truth for design tokens (platform-neutral JSON, with schema)
├── specs/        component contracts (props / enums / defaults / events / slots / behaviors)
├── cases/        golden cases (cross-platform translatable behavior-level assertions)
├── codegen/      codegen tooling (TS/Node): src/ + templates/
├── dist/         codegen output (generated, hand-editing forbidden)
├── scripts/      verification and release scripts
├── tests/        snapshot tests and token meta tests
└── docs/         developer documentation site source (Astro Starlight, this site)
```

## Directory responsibilities

### `tokens/` — the single token source of truth

Platform-neutral JSON sources, strictly constrained by `tokens/schema.json`. 9 data files in total:

| File | Namespace | Content |
| --- | --- | --- |
| `color.json` | `color` | Color palette: semantic colors organized by default/hover/active/bg/border |
| `color-dark.json` | `color` (same as light) | Dark-mode incremental overrides (only declares keys that differ from light) |
| `components.json` | `""` (empty string) | Component-level tokens: `button.*`, `input.*`, etc. |
| `typography.json` | `typography` | Font families / sizes / weights / line heights |
| `spacing.json` | `spacing` | Spacing scale xs–xxl |
| `radius.json` | `radius` | Corner radii |
| `shadow.json` | `shadow` | Shadows |
| `motion.json` | `motion` | Durations + easing (cubic Bézier) |
| `z-index.json` | `zIndex` | Elevation |

The exact number of leaf tokens per file changes between versions; the [Token Reference](../tokens/reference) page is authoritative — hard-coding numbers in prose inevitably goes stale.

See [Token Format](../tokens/token-format) and [Namespaces & Dot Paths](../tokens/namespace).

### `specs/` — component contracts

One JSON file per component: prop names / types / enums / defaults / events / slots / behavior notes / the list of consumed tokens. Strictly constrained by `specs/schema.json`. See [Contract Format](../specs/spec-format).

### `cases/` — golden cases

One JSON file per component: cross-platform translatable behavior-level assertions (given/when/then), which each native target's test suite translates by hand into local tests. Strictly constrained by `cases/schema.json`. See [Case Format](../cases/case-format).

### `codegen/` — the generation tool

```
codegen/
├── src/
│   ├── index.ts      CLI orchestration entry (the real body of `pnpm codegen`)
│   ├── types.ts      all type definitions (never enters runtime output)
│   ├── load.ts       JSON loading + Ajv schema validation + flattening
│   ├── resolve.ts    ref resolution + dark-mode merging
│   ├── format.ts     neutral-value parsing / per-target formatting
│   ├── tree.ts       flat path → nested tree
│   ├── render.ts     Handlebars wrapper
│   └── targets/      android / ios / harmony / c / docs, five targets
└── templates/        per-target handlebars templates (7 .hbs)
```

See [Pipeline Overview](../codegen/pipeline).

### `dist/` — generated artifacts

**Hand-editing is forbidden** (listed in `.gitignore`). Layout:

```
dist/
├── android/top/lhgb/ui/tokens/   LhTokens.kt, LhDarkTokens.kt
├── ios/Sources/LhUITokens/       LhTokens.swift, LhDarkTokens.swift, LhShadow.swift
├── harmony/tokens/               LhTokens.ets, LhDarkTokens.ets, LhShadow.ets
├── c/include/lh_ui/              lh_tokens.h, lh_dark_tokens.h
└── docs/                         tokens.md, tokens.light.json, tokens.dark.json
```

See [Android Artifacts](../artifacts/android).

### `scripts/` — verification and release scripts

`verify-tokens.mts` (token verification: schema + reference integrity + orphan-dark report), `verify-specs.mts` (spec and cases consistency), `resolve-local-tokens.mjs` (local linking guard). Releases go through changesets (see [Commands](./commands)).

### `tests/` — snapshot tests

`codegen-snapshot.spec.ts` mirrors all of `dist/` (snapshot files are committed to version control); `tokens.spec.ts` runs token meta tests.

### `docs/` — this site

The Astro Starlight site source (configuration in `docs/astro.config.mjs`, content in `docs/src/content/docs/`). The three reference pages (tokens / contracts / cases) are `.astro` pages under `docs/src/pages/` that call codegen's loading and resolution functions directly at build time to render from the JSON source of truth — no manual table maintenance. For deployment see [Deployment](../deployment).
