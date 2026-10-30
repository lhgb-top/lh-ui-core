---
title: "部署說明"
---

本文件站按家族約定部署在 `www.lhgb.top` 的 `/lhui/core/` 前綴下（與 android / ios / harmony / windows 四站同體系）。

站點框架是 **Astro Starlight**（2026-10-12 由 VitePress 遷移而來，選型記錄見 [文件站技術選型](./guide/tech-choice)）。

## 構建

```bash
pnpm docs:build
```

產物在 `docs/dist/`（`astro.config.mjs` 裡顯式指定 `outDir: 'docs/dist'`，**刻意避開 codegen 的倉根 `dist/`**，見紅線 6；已加入 `.gitignore`，不入版本庫）。

部署相關的設定全部在 `docs/astro.config.mjs`：

| 設定項 | 值 | 說明 |
| --- | --- | --- |
| `site` | `https://www.lhgb.top` | sitemap 與 SEO 的站點源 |
| `base` | `/lhui/core/` | 部署前綴，首尾必須帶斜線 |
| `build.format` | `'file'` | 產出 `page.html` 而非 `page/index.html`，與家族 nginx 契約對齊 |
| `trailingSlash` | `'never'` | 由 Starlight 接管，配合 `format: 'file'` |

<Aside type="tip" title="改部署路徑只需改這一處">
`base` 首尾必須帶斜線。Astro 的 `base` 會同時作用於構建產物的資源路徑、sitemap 與 pagefind 搜尋索引，不需要像 VitePress 時代那樣額外維護 `.env` 檔案。
</Aside>

<Aside type="caution" title="base 管不到兩類連結">
`base` 只作用於 Astro / Starlight 自己生成的部分：頁面資源、側邊欄、分頁、locale 切換、sitemap、pagefind 索引。**以下兩類不會自動拼 base**：

1. **frontmatter 的 `hero.actions[].link`**（`template: splash` 首頁的 CTA 按鈕）——Starlight 0.42.6 把它原樣作為 `href`，必須在 `index.mdx` 裡寫完整前綴，例如 `/lhui/core/guide/quickstart`。
2. **markdown 正文裡以 `/` 開頭的絕對路徑連結**——Astro 7 的 markdown 渲染不做 base 拼接。

本倉由 `astro.config.mjs` 裡的 `basePrefixPlugin` 外掛在構建期給第 2 類自動補前綴，所以正文仍可寫 `/tokens/reference` 這樣的絕對路徑；第 1 類必須手寫完整前綴。改 `base` 時記得同步改首頁 hero 的 2 個按鈕。
</Aside>

## 上傳

把 `docs/dist/` 的內容上傳到伺服器目錄 `/home/webuser/nginx/lh-ui/core/`。

## nginx 設定

```nginx
location ^~ /lhui/core/ {
    alias /home/webuser/nginx/lh-ui/core/;
    index index.html;
    try_files $uri $uri.html $uri/ /lhui/core/index.html;
}
```

三條家族踩坑契約（遷移 Starlight 後逐條確認仍然適用）：

1. **`try_files` fallback 必須帶 base 前綴**（`/lhui/core/index.html`），否則深層連結重新整理 404
2. **`alias` 結尾斜線不可省**，與 `location ^~ /lhui/core/` 成對使用
3. **必須加 `$uri.html`**——本站 `build.format: 'file'` 產出的是 `page.html` 形態（URL 為 `/lhui/core/page`，無尾斜線），nginx 靠 `$uri.html` 兜底到真實檔案；去掉它深層連結會 404

## 部署後自我檢查

```bash
curl -I https://www.lhgb.top/lhui/core/guide/introduction
grep -c "lhui/core" docs/dist/index.html   # 期望 > 0
# 反向斷言：產物裡不得存在缺 base 的站內連結（命中數應為 0）
grep -rcE 'href="/(guide|tokens|specs|cases|codegen|artifacts)/' docs/dist/ | grep -v ':0$' || echo OK
```

## 本地預覽

```bash
pnpm docs:dev        # http://localhost:5185/lhui/core/
pnpm docs:preview    # 用生產構建預覽，同樣帶 base 前綴
```

Astro 的 `base` 在 dev server 下同樣生效（與 VitePress 靠 `.env.development` 區分 `DOCS_BASE=/` 的做法不同），所以本地路徑**也帶 `/lhui/core/` 前綴**——本地與線上的 URL 結構完全一致，反而省掉了過去「本地無前綴、線上有前綴」的心智負擔。

## 連接埠分配

| 倉庫 | dev 連接埠 | base |
| --- | --- | --- |
| lh-ui-vue2 | 5177 | `/lhui/vue2/` |
| lh-ui-plus | 5178 | `/lhui/vue3/` |
| lh-ui-react | 5179 | `/lhui/react/` |
| lh-ui-uniapp | 5187 | `/lhui/uniapp/` |
| lh-ui-android | 5181 | `/lhui/android/` |
| lh-ui-ios | 5182 | `/lhui/ios/` |
| lh-ui-harmony | 5183 | `/lhui/harmony/` |
| lh-ui-windows | 5186 | `/lhui/windows/` |
| **lh-ui-core（本站）** | **5185** | **`/lhui/core/`** |

家族部署的權威參考在 `lh-ui/docs` 倉的 `部署/nginx-lhui.conf.md`；本文件是本倉自存的一份操作手冊。部署生效後應同步更新家族總覽表（本次改動不含跨倉修改）。
