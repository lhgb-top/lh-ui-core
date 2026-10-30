---
title: "Introduction"
---

> lh-ui-core is the build-time center of the lh-ui family's **native bloodline**.

## What this repository is

`@lh-ui/core` is the home of the **single source of truth** for design tokens, component contracts, and golden cases — plus a codegen tool that generates platform-neutral tokens into language skeletons for the four native targets.

It is **not a runtime dependency**. It works only at build time: platform-agnostic JSON tokens and component contracts are turned into artifacts for Android (Kotlin) / iOS (Swift) / HarmonyOS (ArkTS) / Windows (C#), and each native UI library implements the components by hand. **Zero JavaScript at native runtime.**

## The two bloodlines

The family has two mutually independent bloodlines that must never be coupled:

```
lh-ui family
├── web bloodline: lh-ui-share (TS core + the single SCSS style source) → plus / vue2 / react / uniapp
└── native bloodline: this repo (JSON tokens + specs + codegen) → android / ios / harmony / windows
```

This repository and `lh-ui-share` **have no code dependency on each other**; each closes its own loop and releases independently. Brand and visual consistency is kept through a manual alignment process in the family docs repo (`docs/设计语言基线.md`), not through automatic syncing.

## The three contract layers

The content of this repository consists of three JSON contract layers that are independent of each other yet cross-reference one another:

| Layer | Location | Question it answers |
| --- | --- | --- |
| **Tokens** | `tokens/*.json` | "What does the interface look like" — colors, spacing, font sizes, radii, shadows, motion, elevation, component-level dimensions |
| **Contracts** | `specs/*.json` | "What capabilities does a component have" — props / enums / defaults / events / slots / behaviors |
| **Cases** | `cases/*.json` | "How should the component be tested" — cross-platform translatable given/when/then behavior-level assertions |

codegen consumes only **tokens** to generate the native skeletons; **contracts** and **cases** are currently consumed manually by each native target (in the future they may drive generated type skeletons and test templates).

## Token seeds

The initial values of `tokens/*.json` in this repository were a one-time manually extracted seed aligned with `lh-ui-share/styles/theme/common/variables.scss` and `var-dark.scss` (2026-10-10; see the family `docs/设计语言基线.md`). After that, the two repositories evolved independently and **are no longer kept in sync**. Brand-level token changes (color palettes, spacing scales) must be registered in that baseline document.

## Who should read this documentation

- **Native-target developers** (android / ios / harmony / windows): to learn the naming conventions, unit conversions, and dark-mode mechanism of the `dist/` artifacts — where tokens come from and how their values are computed.
- **Maintainers of this repository**: to learn the responsibilities and functions of every module in the codegen pipeline, so you can edit templates, add tokens, and add components.

## Next steps

- [Quick Start](./quickstart) — clone, install, run codegen once
- [Directory Structure](./structure) — the responsibility of each directory
- [Token Format](../tokens/token-format) — the field constraints of token JSON
- [Pipeline Overview](../codegen/pipeline) — the complete codegen data flow
