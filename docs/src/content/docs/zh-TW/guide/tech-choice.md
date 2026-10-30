---
title: "文件站技術選型"
---

本頁記錄 2026-10-12 對主流靜態文件框架的一次調研結論，以及本倉文件站框架的最終決策。

## 決策記錄

| 日期 | 決策 | 理由 |
| --- | --- | --- |
| 2026-10-12（調研日） | **採用 Astro Starlight，從 VitePress 遷移** | Starlight 預設零用戶端 JS、框架無關，與本倉「執行時零 JS」哲學最貼近；三個資料驅動參考頁改寫為純 Astro 元件後，徹底移除 vue / vitepress / vite 三個依賴；Node ≥22.12 門檻可接受 |
| 2026-10-12（調研日，前置判斷） | 維持 VitePress | 當時遷移收益覆蓋不了成本——家族七站均在 VitePress 上，且本倉文件站已完整落地。**此結論已被同日的遷移決策取代，保留下文作為歷史記錄** |

遷移本身是一次性完成的（單次提交內建好 Astro 骨架並搬完全部頁面，避免中間態不可構建）。家族其餘各站仍用 VitePress，**本倉不要求家族統一**；若未來家族層面統一框架，本倉的 Starlight 實踐就是現成參照。

## 調研結論（歷史記錄，基於 2026-10-12 資料）

- **如果今天從零開始、且沒有家族一致性約束**，最強替代是 **Astro Starlight**——效能、框架無關、預設零用戶端 JS，與本倉「執行時零 JS」的哲學最貼近。（此判斷最終促成了上面的遷移決策。）
- **VuePress 已實質性停滯，不建議任何新專案採用**（倉庫最近一次推送停留在 2024-08-07，v2 至今仍是 rc）。
- 遷移前唯一值得長期觀察的是 **VitePress 2.0**（當時 `next` 標籤為 2.0.0-alpha.20，alpha 階段）。

## 活躍度資料

> 資料採集日：2026-10-12。GitHub 資料來自 api.github.com，npm 下載量為 2026-10-04 ~ 10-10 週統計，版本號來自 registry.npmjs.org dist-tags。star 數會隨時間增長，引用時請注意新鮮度。

| 框架 | 技術堆疊 | GitHub Stars | 倉庫最近推送 | npm 週下載 | 最新穩定版 |
| --- | --- | --- | --- | --- | --- |
| **VitePress** | Vue 3 + Vite | 18.4k | 2026-10-11 | 1,305,159 | 1.6.4（next: 2.0.0-alpha.20） |
| **Docusaurus** | React + MDX | 66.5k | 2026-10-10 | 1,504,459 | 3.10.2 |
| **Astro Starlight** | Astro（框架無關） | 9.4k | 2026-10-09 | 1,431,284（astro 本體 7.22M） | astro 7.3.8 / starlight 0.42.6 |
| **docsify** | 執行時 JS 渲染 | 31.5k | 2026-10-11 | 80,727 | 5.0.0 |
| **Nextra** | Next.js + React | 13.9k | 2026-07-31 | 238,757 | 4.6.1 |
| **Fumadocs** | Next.js + React | 13.3k | 2026-10-09 | — | — |
| **MkDocs Material** | Python | 27.6k | 2026-10-02 | PyPI，不適用 | — |
| **Sphinx** | Python / RST | 8.1k | 2026-10-05 | PyPI，不適用 | — |
| **VuePress** | Vue + Webpack | 22.7k | ⚠️ **2024-08-07** | 71,177 | 1.9.10（v2 卡在 2.0.0-rc.31） |
| **Dumi** | Umi + React | 3.8k | 2026-09-14 | 20,163 | 2.4.50 |
| **Rspress** | Rspack + React | 2.3k | 2026-10-10 | 19,631 | 1.47.2（2.0 beta.21） |

關鍵讀數：VitePress 與 Docusaurus 是唯二月下載量破百萬的一線選手；Starlight 藉 Astro 本體（722 萬）順勢而起，是第三極；VuePress 雖有 2.3 萬 star，但倉庫已兩年多無提交，**已被 VitePress 事實取代**。

## 分梯隊優缺點

### 第一梯隊：VitePress / Docusaurus / Astro Starlight

**VitePress**（本倉遷移前在用；家族其餘各站仍在用）

- 優點：Vue 單檔案元件可直接寫進 markdown（本倉令牌參考 / 元件契約 / 黃金用例三個參考頁正是靠這個）；**構建期資料載入器**（`*.data.ts`）天然適合讀 JSON 真源，dev 時配 `watch` glob 還能熱更新；Vite dev 極快；預設主題開箱即用、幾乎零設定；中文社群與資料豐富。
- 缺點：MDX 支援弱（不是 MDX 生態）；版本化文件、i18n 等企業級能力需要自己搭或找外掛；主題客製深度不如 Docusaurus；搜尋為本地索引，大站點效果一般。

**Docusaurus**（Meta 出品，生態最大）

- 優點：**版本化文件外掛**（多版本文件共存）與 **i18n** 是所有框架裡最成熟的；MDX 生態、外掛體系、主題注入（swizzle）完善；背靠 Meta，長期維護有保障。
- 缺點：React 全家桶依賴重、構建產物 JS 體積大；設定項多、心智負擔高；它的資料管線（`loadContent` 生命週期）對接 JSON 真源比 VitePress 的 loader 更繞；家族無先例。

**Astro Starlight**（框架無關，效能標竿；**本倉現用**）

- 優點：**預設零用戶端 JS**，與本倉「執行時零 JS」的哲學最契合；內容集合（Content Collections）給到類型安全的資料層；可在 Vue / React / Svelte 裡混用元件；構建產物最輕；Starlight 主題的文件體驗極佳（側邊欄、錨點導覽、i18n 內建）。
- 缺點：Starlight 仍是 0.x（0.42.6），API 可能有 breaking change；內容集合面向**檔案型內容**（md / mdx），讀 `tokens/*.json` 這類外部 JSON 需要繞過集合、在 `.astro` 頁面裡直接引入（本倉已用 frontmatter 直調 codegen 模組解決）；家族無先例，部署 / nginx / 側邊欄約定要單獨趟一遍（**本倉已趟完，見 [部署說明](../deployment)**）。

### 第二梯隊：Nextra / Rspress / Fumadocs / Dumi

- **Nextra**：Next.js 生態、MDX 強、文件美觀；但強綁 Next.js + React，部署模型（SSG / SSR / Edge）與家族 nginx 靜態託管不同，v4 的內容目錄約定與 VitePress 差異大。無遷移動機。
- **Rspress**（字節 web-infra-dev 出品）：**構建速度最快**（Rspack），數千頁的大文件站明顯優於 VitePress；中文維護者社群友善。但生態 / 外掛最少（週下載 2 萬），資料載入器無標準範式——本倉只有 30 多頁，為速度付出的學習成本用不上。
- **Fumadocs**：近兩年增速最猛的新秀（13.3k star、僅 2 個 issue 開著），Next.js + 現代設計系統，搜尋 / 視圖切換體驗好。同樣強綁 Next.js，且國內文件資料少。值得收藏，不建議現在引入。
- **Dumi**：為**元件庫演示**（live demo、屬性表自動生成）而生。本倉是構建期令牌倉，**沒有任何執行時 UI 可演示**，核心賣點完全用不上，且強綁 Umi / React。明確排除。

### 第三梯隊與特殊項

- **MkDocs Material / Sphinx**（Python 系）：文件品質極高，但要求 Python 工具鏈，與本倉 Node ≥20 + pnpm + TS 工具鏈**不在一個生態**，無法複用 codegen 的 TS 類型與載入函式。排除。
- **docsify**（執行時渲染）：無構建期、CDN 拉取即用，適合「單頁極速上線」的小文件。但它**不在構建期生成 HTML**（SEO 弱、首屏慢），也無法跑構建期資料載入器做 schema 校驗（本倉參考頁正是依賴這一能力）。排除。

## 逐條對照本倉約束

| 本倉約束 / 需求 | VitePress | Docusaurus | Starlight | 其它 |
| --- | --- | --- | --- | --- |
| 家族七站同體系（nginx 前綴 / 側邊欄 / 部署） | ✅ 家族其餘站在用 | ❌ 需重趟 | ✅ 本倉已趟通（nginx 三條契約繼續適用，見 [部署說明](../deployment)） | ❌ |
| 構建期讀 JSON 真源渲染參考頁 | ✅ 原生 loader，已實作 | ⚠️ 需自訂外掛 | ✅ 已實作（`.astro` 頁面 frontmatter 直調 codegen 的 load / resolve） | ⚠️ 更折騰 |
| 單中文、無 i18n 需求 | ✅ | 優勢用不上 | ✅ | — |
| 無互動演示的 prose + 表格 + 程式碼 | ✅ | ✅ | ✅ | ✅ |
| 「執行時零 JS」氣質 | ⚠️ 有執行時 JS（僅限站點，非紅線範圍） | ❌ JS 重 | ✅ 預設零 JS | — |
| 複用 codegen TS 模組（類型 / 校驗） | ✅ 已驗證（vite ^5.4.21 起 SSR 支援 `import.meta.dirname`） | ✅ | ✅ 已驗證（astro 7 內建 vite 8，SSR 支援 `import.meta.dirname`） | ✅ |

補充兩點判斷依據：

- 「執行時零 JS」紅線管的是 **codegen 的 `dist/` 產物**，不是文件站。文件站本身跑框架執行時不違反任何紅線——它與 `dist/` 完全隔離，且構建產物入 `.gitignore`。不過遷移到 Starlight 後，站點本身也變成了預設零用戶端 JS（僅搜尋 / 切換主題等少量互動按需載入），與紅線的精神更一致。
- Docusaurus 的版本化文件與 i18n 優勢在本倉**用不上**：本倉單中文、單版本、內容跟著 codegen 走，不存在「舊版令牌文件共存」的情境。

## 後續觀察項

1. **Starlight 1.0**：本倉目前鎖定 `^0.42.6`。0.x 階段仍可能有 breaking change，1.0 正式版發布後評估升級路徑（Starlight 的遷移指南會列明變更點）。
2. **VitePress 2.0**：進入 beta 後評估。家族其餘各站仍在 VitePress 上，主要看點是構建效能與對 Vite 7 的跟進。
3. **觸發重選的訊號**：Starlight 長期無維護、或家族層面決定統一文件框架（屆時本倉的 Starlight 實踐就是現成參照）。
