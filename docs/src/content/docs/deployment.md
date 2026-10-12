---
title: "部署说明"
---

本文档站按家族约定部署在 `www.lhgb.top` 的 `/lhui/core/` 前缀下（与 android / ios / harmony / c 四站同体系）。

站点框架是 **Astro Starlight**（2026-10-12 由 VitePress 迁移而来，选型记录见 [文档站技术选型](./guide/tech-choice)）。

## 构建

```bash
pnpm docs:build
```

产物在 `docs/dist/`（`astro.config.mjs` 里显式指定 `outDir: 'docs/dist'`，**刻意避开 codegen 的仓根 `dist/`**，见红线 6；已加入 `.gitignore`，不入版本库）。

部署相关的配置全部在 `docs/astro.config.mjs`：

| 配置项 | 值 | 说明 |
| --- | --- | --- |
| `site` | `https://www.lhgb.top` | sitemap 与 SEO 的站点源 |
| `base` | `/lhui/core/` | 部署前缀，首尾必须带斜杠 |
| `build.format` | `'file'` | 产出 `page.html` 而非 `page/index.html`，与家族 nginx 契约对齐 |
| `trailingSlash` | `'never'` | 由 Starlight 接管，配合 `format: 'file'` |

<Aside type="tip" title="改部署路径只需改这一处">
`base` 首尾必须带斜杠。Astro 的 `base` 会同时作用于构建产物的资源路径、sitemap 与 pagefind 搜索索引，不需要像 VitePress 时代那样额外维护 `.env` 文件。
</Aside>

## 上传

把 `docs/dist/` 的内容上传到服务器目录 `/home/webuser/nginx/lh-ui/core/`。

## nginx 配置

```nginx
location ^~ /lhui/core/ {
    alias /home/webuser/nginx/lh-ui/core/;
    index index.html;
    try_files $uri $uri.html $uri/ /lhui/core/index.html;
}
```

三条家族踩坑契约（迁移 Starlight 后逐条确认仍然适用）：

1. **`try_files` fallback 必须带 base 前缀**（`/lhui/core/index.html`），否则深链路刷新 404
2. **`alias` 结尾斜杠不可省**，与 `location ^~ /lhui/core/` 成对使用
3. **必须加 `$uri.html`**——本站 `build.format: 'file'` 产出的是 `page.html` 形态（URL 为 `/lhui/core/page`，无尾斜杠），nginx 靠 `$uri.html` 兜底到真实文件；去掉它深链路会 404

## 部署后自检

```bash
curl -I https://www.lhgb.top/lhui/core/guide/introduction
grep -c "lhui/core" docs/dist/index.html   # 期望 > 0
```

## 本地预览

```bash
pnpm docs:dev        # http://localhost:5185/lhui/core/
pnpm docs:preview    # 用生产构建预览，同样带 base 前缀
```

Astro 的 `base` 在 dev server 下同样生效（与 VitePress 靠 `.env.development` 区分 `DOCS_BASE=/` 的做法不同），所以本地路径**也带 `/lhui/core/` 前缀**——本地与线上的 URL 结构完全一致，反而省掉了过去「本地无前缀、线上有前缀」的心智负担。

## 端口分配

| 仓库 | dev 端口 | base |
| --- | --- | --- |
| lh-ui-vue2 | 5177 | `/lhui/vue2/` |
| lh-ui-plus | 5178 | `/lhui/plus/` |
| lh-ui-react | 5179 | `/lhui/react/` |
| lh-ui-uniapp | 5179 | `/lhui/uniapp/` |
| lh-ui-android | 5181 | `/lhui/android/` |
| lh-ui-ios | 5182 | `/lhui/ios/` |
| lh-ui-harmony | 5183 | `/lhui/harmony/` |
| lh-ui-c | 5184 | `/lhui/c/` |
| **lh-ui-core（本站）** | **5185** | **`/lhui/core/`** |

家族部署的权威参考在 `lh-ui/docs` 仓的 `部署/nginx-lhui.conf.md`；本文档是本仓自存的一份操作手册。部署生效后应同步更新家族总览表（本次改动不含跨仓修改）。
