---
title: "Local Linking"
---

## The problem

When developing a native target, changing a token used to mean waiting for core to release and then bumping the dependency — a feedback loop far too long.

## The mechanism

Under the family layout (all repositories under one parent directory), native repositories read this repository's `dist/` artifacts directly during local development through **existence-guarded local resolution**: after changing a token, re-run `pnpm codegen` in this repository and the change takes effect immediately — **no publishing required**. When this repository is absent (e.g. a CI single-repo clone), each platform automatically falls back to its published package.

The guard mechanism mirrors the web bloodline's `createLocalShareAliases`: it checks `existsSync(<coreRoot>/dist/android)` (the android artifacts must exist for this repository to be considered codegen-ready), and if not, the local path is never injected.

## Per-target injection

Each native repository implements this in its own way; this repository does not mandate anything:

| Platform | Injection method |
| --- | --- |
| Android | Gradle local maven repository directory |
| iOS | SPM local path dependency |
| HarmonyOS | ohpm `file:` dependency |
| C | CMake `add_subdirectory` or an include path |

## Typical workflow

```
1. Edit tokens/*.json in this repository
2. pnpm codegen          → dist/ updates immediately
3. Build/run in the native repository → the new tokens are in effect
```

`scripts/resolve-local-tokens.mjs` is the implementation script of this guard mechanism.

## Caveats

- Local linking only works under the **family layout** (all repositories under one parent directory).
- Linking reads `dist/`, so after changing tokens you **must run codegen first**.
- After a release, native targets should switch back to the published dependency version instead of relying on local paths long-term.
