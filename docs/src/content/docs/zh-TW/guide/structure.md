---
title: "目錄結構"
---

```
lh-ui-core/
├── tokens/       設計令牌唯一真源（JSON 中性源，含 schema）
├── specs/        元件契約（props / 列舉 / 預設值 / 事件 / 插槽 / 行為）
├── cases/        黃金用例（可跨端翻譯的行為級斷言）
├── codegen/      codegen 工具（TS/Node）：src/ + templates/
├── dist/         codegen 產物（構建生成，禁止手改）
├── scripts/      校驗與發包腳本
├── tests/        快照測試與令牌元測試
└── docs/         開發者文件站源碼（Astro Starlight，本站）
```

## 各目錄職責

### `tokens/` —— 令牌唯一真源

平台無關的 JSON 中性源，格式由 `tokens/schema.json` 強約束。共 9 個資料檔案：

| 檔案 | 命名空間 | 內容 |
| --- | --- | --- |
| `color.json` | `color` | 色板：語意色按 default/hover/active/bg/border 組織 |
| `color-dark.json` | `color`（與明色同名） | 暗色增量覆蓋（只宣告與明色不同的鍵） |
| `components.json` | `""`（空串） | 元件級令牌：`button.*`、`input.*` 等 |
| `typography.json` | `typography` | 字型族 / 字級 / 字重 / 行高 |
| `spacing.json` | `spacing` | 間距尺度 xs–xxl |
| `radius.json` | `radius` | 圓角 |
| `shadow.json` | `shadow` | 投影 |
| `motion.json` | `motion` | 時長 + 緩動（貝茲） |
| `z-index.json` | `zIndex` | 層級 |

各檔案的精確葉子數隨版本變化，以 [令牌參考](../tokens/reference) 頁為準——散文裡寫死數字必然過時。

詳見 [令牌格式](../tokens/token-format) 與 [命名空間與點路徑](../tokens/namespace)。

### `specs/` —— 元件契約

每元件一份 JSON：props 名 / 類型 / 列舉 / 預設值 / 事件 / 插槽 / 行為說明 / 消費的令牌清單。格式由 `specs/schema.json` 強約束。詳見 [契約格式](../specs/spec-format)。

### `cases/` —— 黃金用例

每元件一份 JSON：可跨端翻譯的行為級斷言（given/when/then），各端測試倉庫照此人工翻譯成本地測試。格式由 `cases/schema.json` 強約束。詳見 [用例格式](../cases/case-format)。

### `codegen/` —— 生成工具

```
codegen/
├── src/
│   ├── index.ts      CLI 編排入口（pnpm codegen 的真身）
│   ├── types.ts      全部類型定義（不進執行時產物）
│   ├── load.ts       JSON 載入 + Ajv schema 校驗 + 扁平化
│   ├── resolve.ts    ref 解析 + 暗色合併
│   ├── format.ts     中性值解析 / 各端格式化
│   ├── tree.ts       扁平 path → 巢狀樹
│   ├── render.ts     Handlebars 封裝
│   └── targets/      android / ios / harmony / windows / docs 五個 target
└── templates/        各端 handlebars 模板（7 個 .hbs）
```

詳見 [管線總覽](../codegen/pipeline)。

### `dist/` —— 生成產物

**禁止手改**（在 `.gitignore` 內）。布局：

```
dist/
├── android/top/lhgb/ui/tokens/   LhTokens.kt, LhDarkTokens.kt
├── ios/Sources/LhUITokens/       LhTokens.swift, LhDarkTokens.swift, LhShadow.swift
├── harmony/tokens/               LhTokens.ets, LhDarkTokens.ets, LhShadow.ets
├── c/include/lh_ui/              lh_tokens.h, lh_dark_tokens.h
└── docs/                         tokens.md, tokens.light.json, tokens.dark.json
```

詳見 [產物](../artifacts/android)。

### `scripts/` —— 校驗與發包腳本

`verify-tokens.mts`（令牌校驗：schema + 引用完整性 + 孤兒暗色路徑報告）、`verify-specs.mts`（spec 與 cases 一致性）、`resolve-local-tokens.mjs`（本地連動守衛）。發包走 changesets（見 [命令清單](./commands)）。

### `tests/` —— 快照測試

`codegen-snapshot.spec.ts` 鏡像 `dist/` 全部產物（快照檔案入版本庫），`tokens.spec.ts` 做令牌元測試。

### `docs/` —— 本站

Astro Starlight 站點源碼（設定在 `docs/astro.config.mjs`，內容在 `docs/src/content/docs/`）。三個參考頁（令牌 / 契約 / 用例）是 `docs/src/pages/` 下的 `.astro` 頁面，在構建期直接呼叫 codegen 的載入與解析函式從 JSON 真源渲染，不需要手動維護表格。部署說明見 [部署說明](../deployment)。
