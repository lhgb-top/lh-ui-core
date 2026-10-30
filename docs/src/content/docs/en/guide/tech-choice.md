---
title: "Docs Site Tech Stack"
---

This page records the findings of a survey of mainstream static documentation frameworks conducted on 2026-10-12, and the final decision for this repository's documentation site.

## Decision log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-10-12 (survey day) | **Adopt Astro Starlight, migrate from VitePress** | Starlight ships zero client-side JS by default and is framework-agnostic, closest to this repository's "zero JS at runtime" philosophy; after rewriting the three data-driven reference pages as plain Astro components, the three dependencies vue / vitepress / vite could be removed entirely; the Node >=22.12 requirement is acceptable |
| 2026-10-12 (survey day, prior position) | Keep VitePress | At the time the migration payoff did not justify the cost — all seven family sites were on VitePress, and this repo's site was already fully built. **This conclusion was superseded by the migration decision taken the same day and is kept below as a historical record** |

The migration itself was done in one pass (building the Astro skeleton and moving every page in a single commit, to avoid an intermediate state that could not build). The other family sites still use VitePress; **this repository does not require family-wide uniformity**. If the family ever unifies on one framework, this repo's Starlight experience is a ready-made reference.

## Survey findings (historical record, based on 2026-10-12 data)

- **If starting from scratch today, with no family-consistency constraint**, the strongest alternative is **Astro Starlight** — performance, framework-agnostic, zero client-side JS by default, closest to this repository's "zero JS at runtime" philosophy. (This judgment ultimately led to the migration decision above.)
- **VuePress has effectively stalled; no new project should adopt it** (the last push to its repository was on 2024-08-07, and v2 remains an rc to this day).
- The only item worth long-term observation before the migration was **VitePress 2.0** (the `next` tag was at 2.0.0-alpha.20 at the time, an alpha).

## Activity data

> Data collected on 2026-10-12. GitHub data comes from api.github.com; npm download counts are the weekly statistics for 2026-10-04 to 10-10; version numbers come from the registry.npmjs.org dist-tags. Star counts grow over time, so check freshness when citing.

| Framework | Tech stack | GitHub stars | Last push to repo | npm weekly downloads | Latest stable |
| --- | --- | --- | --- | --- | --- |
| **VitePress** | Vue 3 + Vite | 18.4k | 2026-10-11 | 1,305,159 | 1.6.4 (next: 2.0.0-alpha.20) |
| **Docusaurus** | React + MDX | 66.5k | 2026-10-10 | 1,504,459 | 3.10.2 |
| **Astro Starlight** | Astro (framework-agnostic) | 9.4k | 2026-10-09 | 1,431,284 (astro itself 7.22M) | astro 7.3.8 / starlight 0.42.6 |
| **docsify** | Runtime JS rendering | 31.5k | 2026-10-11 | 80,727 | 5.0.0 |
| **Nextra** | Next.js + React | 13.9k | 2026-07-31 | 238,757 | 4.6.1 |
| **Fumadocs** | Next.js + React | 13.3k | 2026-10-09 | — | — |
| **MkDocs Material** | Python | 27.6k | 2026-10-02 | PyPI, not applicable | — |
| **Sphinx** | Python / RST | 8.1k | 2026-10-05 | PyPI, not applicable | — |
| **VuePress** | Vue + Webpack | 22.7k | ⚠️ **2024-08-07** | 71,177 | 1.9.10 (v2 stuck at 2.0.0-rc.31) |
| **Dumi** | Umi + React | 3.8k | 2026-09-14 | 20,163 | 2.4.50 |
| **Rspress** | Rspack + React | 2.3k | 2026-10-10 | 19,631 | 1.47.2 (2.0 beta.21) |

Key readings: VitePress and Docusaurus are the only two first-tier candidates with over a million weekly downloads; Starlight rides on Astro itself (7.22 million) and is the third pole; VuePress has 22.7k stars but no commits in over two years and **has been de facto replaced by VitePress**.

## Pros and cons by tier

### Tier 1: VitePress / Docusaurus / Astro Starlight

**VitePress** (in use here before the migration; still used by the rest of the family)

- Pros: Vue single-file components can be written directly in markdown (exactly how this repo's three reference pages — tokens / contracts / golden cases — were built); **build-time data loaders** (`*.data.ts`) are a natural fit for reading the JSON source of truth, with hot reload in dev via a `watch` glob; Vite dev is extremely fast; the default theme works out of the box with almost zero configuration; rich Chinese community resources.
- Cons: weak MDX support (not part of the MDX ecosystem); enterprise features like versioned docs and i18n need to be built by hand or found as plugins; theme customization is less deep than Docusaurus; search uses a local index, which scales poorly on large sites.

**Docusaurus** (by Meta, the largest ecosystem)

- Pros: the **versioned-docs plugin** (multiple doc versions coexisting) and **i18n** are the most mature of any framework; the MDX ecosystem, plugin system, and theme injection (swizzle) are complete; backed by Meta, long-term maintenance is assured.
- Cons: heavy React dependency and large JS bundles; many configuration options and high mental overhead; its data pipeline (the `loadContent` lifecycle) is more convoluted than VitePress's loaders for consuming the JSON source of truth; no family precedent.

**Astro Starlight** (framework-agnostic, the performance benchmark; **in use here**)

- Pros: **zero client-side JS by default**, the closest match to this repo's "zero JS at runtime" philosophy; Content Collections provide a type-safe data layer; components can be mixed from Vue / React / Svelte; the smallest build output; the Starlight theme's documentation experience is excellent (sidebar, anchor navigation, built-in i18n).
- Cons: Starlight is still 0.x (0.42.6) and its API may break; Content Collections target **file-based content** (md / mdx), so reading external JSON like `tokens/*.json` means bypassing the collections and importing directly in `.astro` pages (this repo solved it by calling the codegen modules from frontmatter); no family precedent, so deployment / nginx / sidebar conventions had to be figured out from scratch (**done in this repo — see [Deployment](../deployment)**).

### Tier 2: Nextra / Rspress / Fumadocs / Dumi

- **Nextra**: Next.js ecosystem, strong MDX, attractive docs; but tightly bound to Next.js + React, its deployment model (SSG / SSR / Edge) differs from the family's nginx static hosting, and v4's content-directory conventions differ a lot from VitePress. No migration motive.
- **Rspress** (by ByteDance web-infra-dev): **the fastest builds** (Rspack), clearly better than VitePress for large documentation sites with thousands of pages; a friendly Chinese maintainer community. But the ecosystem / plugin pool is the smallest (20k weekly downloads), and there is no standard pattern for data loaders — this repo has only 30-odd pages, so the learning cost paid for speed is wasted.
- **Fumadocs**: the fastest-growing newcomer of the last two years (13.3k stars, only 2 open issues), Next.js with a modern design system, good search / view-switching experience. Also tightly bound to Next.js, and few Chinese-language resources. Worth bookmarking, not worth adopting now.
- **Dumi**: built for **component library showcases** (live demos, auto-generated prop tables). This repository is a build-time token repository with **no runtime UI to demonstrate at all**, so its core selling points are useless, and it is tightly bound to Umi / React. Explicitly excluded.

### Tier 3 and special cases

- **MkDocs Material / Sphinx** (Python): extremely high documentation quality, but requiring a Python toolchain puts them in a **different ecosystem** from this repo's Node >=20 + pnpm + TS stack — the codegen TS types and loading functions could not be reused. Excluded.
- **docsify** (runtime rendering): no build step, pull from CDN and go, suitable for small docs that need a "single page, live in minutes" start. But it **does not generate HTML at build time** (weak SEO, slow first paint) and cannot run build-time data loaders for schema validation (exactly the capability this repo's reference pages depend on). Excluded.

## Point-by-point against this repo's constraints

| This repo's constraint / need | VitePress | Docusaurus | Starlight | Others |
| --- | --- | --- | --- | --- |
| Same scheme as the family's seven sites (nginx prefix / sidebar / deployment) | ✅ used by the rest of the family | ❌ would need re-plumbing | ✅ done in this repo (the three nginx contracts still apply; see [Deployment](../deployment)) | ❌ |
| Read the JSON source of truth at build time to render reference pages | ✅ native loaders, implemented | ⚠️ needs a custom plugin | ✅ implemented (`.astro` pages call codegen's load / resolve in frontmatter) | ⚠️ more hassle |
| Single language, no i18n needed | ✅ | the advantage is wasted | ✅ | — |
| Prose + tables + code, no interactive demos | ✅ | ✅ | ✅ | ✅ |
| "Zero JS at runtime" spirit | ⚠️ has runtime JS (site only, outside the red lines) | ❌ JS-heavy | ✅ zero by default | — |
| Reuse of codegen TS modules (types / validation) | ✅ verified (vite ^5.4.21+ supports `import.meta.dirname` in SSR) | ✅ | ✅ verified (astro 7 ships vite 8, SSR supports `import.meta.dirname`) | ✅ |

Two additional decision points:

- The "zero JS at runtime" red line governs **codegen's `dist/` artifacts**, not the documentation site. The site running a framework's runtime violates no red line — it is completely isolated from `dist/`, and the build output is in `.gitignore`. That said, after the Starlight migration the site itself became zero-client-JS by default (only search / theme switching and a few other interactions load on demand), which is even more consistent with the spirit of the red lines.
- Docusaurus's versioned-docs and i18n advantages **go unused** in this repository: a single language, a single version, content tracking codegen — there is no "old-version token docs coexisting" scenario.

## Items to keep watching

1. **Starlight 1.0**: this repository currently pins `^0.42.6`. The 0.x phase may still bring breaking changes; once 1.0 is released, evaluate the upgrade path (Starlight's migration guide lists what changes).
2. **VitePress 2.0**: evaluate once it reaches beta. The rest of the family is still on VitePress; the main points of interest are build performance and the move to Vite 7.
3. **Signals that would trigger a re-evaluation**: Starlight going unmaintained for a long time, or a family-level decision to unify documentation frameworks (at which point this repo's Starlight experience is the ready-made reference).
