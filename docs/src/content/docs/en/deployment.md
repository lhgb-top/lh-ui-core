---
title: "Deployment"
---

This documentation site is deployed under the `/lhui/core/` prefix of `www.lhgb.top` per the family convention (same scheme as the android / ios / harmony / windows sites).

The site framework is **Astro Starlight** (migrated from VitePress on 2026-10-12; for the rationale see [Docs Site Tech Stack](./guide/tech-choice)).

## Build

```bash
pnpm docs:build
```

The output lands in `docs/dist/` (`astro.config.mjs` sets `outDir: 'docs/dist'` explicitly — this **deliberately avoids the repository-root `dist/` used by codegen**, see red line 6; it is listed in `.gitignore` and never committed).

All deployment-related configuration lives in `docs/astro.config.mjs`:

| Option | Value | Purpose |
| --- | --- | --- |
| `site` | `https://www.lhgb.top` | Site origin for sitemap and SEO |
| `base` | `/lhui/core/` | Deployment prefix; must start and end with a slash |
| `build.format` | `'file'` | Emits `page.html` instead of `page/index.html`, aligning with the family nginx contract |
| `trailingSlash` | `'never'` | Managed by Starlight, in combination with `format: 'file'` |

<Aside type="tip" title="Change the deployment path in one place">
`base` must start and end with a slash. Astro's `base` applies to build-output asset paths, the sitemap, and the pagefind search index at once — unlike the VitePress era, no extra `.env` file is needed.
</Aside>

<Aside type="caution" title="base does not cover two kinds of links">
`base` only applies to what Astro / Starlight generates itself: page assets, the sidebar, pagination, the locale switcher, the sitemap, and the pagefind index. **The following two are not automatically prefixed**:

1. **frontmatter `hero.actions[].link`** (the CTA buttons on a `template: splash` home page) — Starlight 0.42.6 emits it verbatim as `href`, so `index.mdx` must contain the full prefix, e.g. `/lhui/core/guide/quickstart`.
2. **absolute-path links starting with `/` in markdown content** — Astro 7's markdown rendering does not apply the base.

For case 2 this repo ships the `remarkBasePrefix` plugin in `astro.config.mjs`, which prepends the prefix at build time, so the prose can still use absolute paths like `/tokens/reference`; case 1 must always be written out in full. When changing `base`, remember to update the two home-page hero buttons as well.
</Aside>

## Uploading

Upload the contents of `docs/dist/` to the server directory `/home/webuser/nginx/lh-ui/core/`.

## nginx configuration

```nginx
location ^~ /lhui/core/ {
    alias /home/webuser/nginx/lh-ui/core/;
    index index.html;
    try_files $uri $uri.html $uri/ /lhui/core/index.html;
}
```

Three family hard-won rules (each re-confirmed after the Starlight migration):

1. **The `try_files` fallback must include the base prefix** (`/lhui/core/index.html`), otherwise deep-link refreshes return 404.
2. **The trailing slash of `alias` is mandatory**, and it pairs with `location ^~ /lhui/core/`.
3. **`$uri.html` is required** — this site's `build.format: 'file'` produces `page.html` files (URLs like `/lhui/core/page`, no trailing slash), and nginx relies on `$uri.html` to fall back to the real file; dropping it breaks deep links with 404.

## Post-deployment self-check

```bash
curl -I https://www.lhgb.top/lhui/core/guide/introduction
grep -c "lhui/core" docs/dist/index.html   # expect > 0
# reverse assertion: the output must not contain site-internal links missing the base (hit count should be 0)
grep -rcE 'href="/(guide|tokens|specs|cases|codegen|artifacts)/' docs/dist/ | grep -v ':0$' || echo OK
```

## Local preview

```bash
pnpm docs:dev        # http://localhost:5185/lhui/core/
pnpm docs:preview    # preview the production build, also with the base prefix
```

Astro's `base` applies to the dev server too (unlike VitePress, which relied on `.env.development` to set `DOCS_BASE=/`), so local URLs **also carry the `/lhui/core/` prefix** — local and production URL structures are identical, removing the old "no prefix locally, prefix in production" mental overhead.

## Port allocation

| Repository | dev port | base |
| --- | --- | --- |
| lh-ui-vue2 | 5177 | `/lhui/vue2/` |
| lh-ui-plus | 5178 | `/lhui/vue3/` |
| lh-ui-react | 5179 | `/lhui/react/` |
| lh-ui-uniapp | 5187 | `/lhui/uniapp/` |
| lh-ui-android | 5181 | `/lhui/android/` |
| lh-ui-ios | 5182 | `/lhui/ios/` |
| lh-ui-harmony | 5183 | `/lhui/harmony/` |
| lh-ui-windows | 5186 | `/lhui/windows/` |
| **lh-ui-core (this site)** | **5185** | **`/lhui/core/`** |

The authoritative reference for family deployment is `部署/nginx-lhui.conf.md` in the `lh-ui/docs` repository; this page is this repo's own copy of the operations manual. After a deployment goes live, the family overview table should be updated accordingly (this change involves no cross-repository edits).
