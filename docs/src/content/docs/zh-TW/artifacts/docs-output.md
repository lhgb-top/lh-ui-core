---
title: "docs 產物"
---

**路徑**：`dist/docs/`

這是 codegen 的第五個 target（`docsTarget`），也是**唯一不用 handlebars 模板**的 target——直接用程式碼拼字串。

## 三個產物

### `tokens.md` —— 令牌速查表

按**頂級命名空間**分 `##` 小節（button / cell / checkbox / color / dialog / icon / input / loading / motion / navbar / picker / radio / radius / shadow / spacing / switch / tag / textarea / toast / typography / zIndex），每節一張五列表格：

```markdown
## button

| 令牌 | 類型 | 明色 | 暗色 | 說明 |
| --- | --- | --- | --- | --- |
| `button.borderRadius` | dimension | 2px | — | 按鈕圓角跟隨全域圓角 |
| `button.height.medium` | dimension | 40px | — | 原生新增；中號按鈕高度（預設） |
| `color.primary.default` | color | #2B4C7C → #2b4c7c | #3D649E → #3d649e | 主色（靛藍 — 青花瓷之藍） |
```

特點：

- 令牌列是**全點路徑**
- 顏色列顯示「原始值 → 規範化小寫」兩份
- `nativeOnly` 項在說明欄標註「原生新增」
- 暗色列無覆蓋時填 `—`（當前暗色只覆蓋 `color.*`）

### `tokens.light.json` —— 明色平鋪快照

```json
{
  "button.borderRadius": "2px",
  "button.fontWeight": 400,
  "button.height.medium": "40px",
  "color.primary.default": "#2B4C7C"
}
```

`{ path -> 烘焙後的值 }` 的扁平映射，供機器消費。

### `tokens.dark.json` —— 暗色覆蓋表

```json
{
  "color.focus": "#7FA6D9",
  "color.selected": "#B1C1D8",
  …
}
```

只含**被覆蓋的鍵**（全部是 `color.*`，精確條數隨版本變化），按 path 排序。

## 消費方

| 消費方 | 用什麼 |
| --- | --- |
| **本文件站** | 不直接消費 `dist/docs/`——[令牌參考](../tokens/reference) 頁由 `.astro` 頁面走**同一套** `loadTokenFiles` + `resolveTokens` 管線即時渲染，與源同步 |
| 家族文件站 | 嵌入 `tokens.md` 作為令牌速查 |
| 各端對齊 | `tokens.light.json` / `tokens.dark.json` 做構建期比對 |
| 基線文件過濾 | `nativeOnly` 標註用於「原生新增令牌」清單 |

## 頭部守衛

`tokens.md` 開頭：

```html
<!-- 本檔案由 @lh-ui/core 自動生成，請勿手改。源：@lh-ui/core tokens -->
```

與各端產物的「請勿手改」橫幅同理（紅線 6）。

## 與文件站參考頁的差異

| | `dist/docs/tokens.md` | 文件站令牌參考頁 |
| --- | --- | --- |
| 生成時機 | `pnpm codegen` | `pnpm docs:build` / `docs:dev` |
| 資料源 | codegen 記憶體中的 `tokenSet` | `.astro` 頁面 frontmatter 重跑 `loadTokenFiles` + `resolveTokens` |
| 形態 | 靜態 markdown 表格 | 可互動 Astro 表格（過濾、色塊預覽） |
| 位置 | `dist/`（gitignore，不入庫） | 站點頁面（構建產物在 `docs/dist/`） |

兩者**走同一套解析管線**，所以值永遠一致；差異只在呈現形態與構建入口。
