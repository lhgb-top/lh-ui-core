---
title: "Commands"
---

## Build

| Command | Purpose |
| --- | --- |
| `pnpm codegen` | Run a generation pass; writes `dist/` (delete-then-build) |
| `pnpm build` | `pnpm codegen && pnpm verify` |

## Verification

| Command | Purpose |
| --- | --- |
| `pnpm verify:tokens` | Token verification: schema + reference integrity + **critical text/background contrast ratio >=4.5:1 (WCAG AA; only declared pairs are checked, disabled states exempt)** + **platform-specific syntax patrol (blocks `var()` / `rem` / `sp` / `dp`, etc.)** + orphan-dark report |
| `pnpm verify:specs` | Spec and cases consistency verification |
| `pnpm verify` | The two above combined |

## Tests and static checks

| Command | Purpose |
| --- | --- |
| `pnpm test` | Snapshot tests (vitest run) |
| `pnpm test:watch` | Snapshot tests in watch mode |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | eslint |
| `pnpm lint:fix` | eslint --fix |
| `pnpm format` | prettier formatting for json/md/yml |

## Documentation site

| Command | Purpose |
| --- | --- |
| `pnpm docs:dev` | Local preview at `http://localhost:5185/lhui/core/` (base matches production) |
| `pnpm docs:build` | Production build (base `/lhui/core/`) |
| `pnpm docs:preview` | Preview the production build |

## Release

| Command | Purpose |
| --- | --- |
| `pnpm changeset` | Write a changeset |
| `pnpm changeset:status` | Inspect changeset status |
| `pnpm changeset:version` | Bump version numbers per the changesets |

## Snapshot updates

After changing tokens or templates the snapshots will fail; once you confirm the diff is correct:

```bash
pnpm test -- -u
```

## Script inventory

Scripts under `scripts/` (not wired into npm scripts):

| Script | Purpose |
| --- | --- |
| `scripts/verify-tokens.mts` | The real body of token verification |
| `scripts/verify-specs.mts` | The real body of spec verification |
| `scripts/resolve-local-tokens.mjs` | Local-linking guard |

Releases go through changesets (see "Release" above); there is no separate publishing script.
