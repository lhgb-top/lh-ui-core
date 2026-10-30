---
title: "介紹"
---

> lh-ui-core 是 lh-ui 家族**原生血脈**的構建期中心。

## 本倉是什麼

`@lh-ui/core` 是設計令牌的**唯一真源**、元件契約與黃金用例的所在地，外加一套把中性令牌生成到四個原生端的語言骨架的 codegen 工具。

它**不是執行時依賴**。它只在構建期工作：把平台無關的 JSON 令牌與元件契約，生成到 Android（Kotlin）/ iOS（Swift）/ 鴻蒙（ArkTS）/ C 四個原生端，再由各端 UI 庫手寫實作。**原生端執行時零 JavaScript。**

## 雙血脈架構

家族有兩條互相獨立、不得關聯的血脈：

```
lh-ui 家族
├── web 血脈：lh-ui-share（TS core + SCSS 唯一樣式源）→ plus / vue2 / react / uniapp
└── 原生血脈：本倉（JSON 令牌 + 規範 + codegen）→ android / ios / harmony / windows
```

本倉與 `lh-ui-share` **沒有任何程式碼依賴關係**，兩倉各自獨立閉環、各自發版。品牌與視覺的統一靠家族文件倉 `docs/設計語言基線.md` 的人工對齊機制，不靠自動同步。

## 三層契約

本倉的內容由三層互相獨立又彼此引用的 JSON 契約構成：

| 層 | 位置 | 回答的問題 |
| --- | --- | --- |
| **令牌** | `tokens/*.json` | 「介面長什麼樣」——色值、間距、字級、圓角、投影、動效、層級、元件級尺寸 |
| **契約** | `specs/*.json` | 「元件有哪些能力」——props / 列舉 / 預設值 / 事件 / 插槽 / 行為 |
| **用例** | `cases/*.json` | 「元件該怎麼測」——可跨端翻譯的 given/when/then 行為級斷言 |

codegen 只消費**令牌**生成四端骨架；**契約**與**用例**目前由各原生端人工消費（未來可能擴展為自動生成類型骨架與測試模板）。

## 令牌種子

本倉 `tokens/*.json` 的初始值是一次性從 `lh-ui-share/styles/theme/common/variables.scss` 與 `var-dark.scss` 人工抽取的對齊種子（2026-10-10，見家族 `docs/設計語言基線.md`）。此後兩倉各自演化，**不再同步**。品牌級令牌（色板、間距尺度）變更必須在該基線文件登記。

## 誰應該閱讀本文件

- **原生端開發者**（android / ios / harmony / windows）：了解 `dist/` 產物的命名約定、單位換算與暗色機制，知道令牌從哪來、值怎麼算出來的。
- **本倉維護者**：了解 codegen 管線每個模組的職責與函式，能改模板、加令牌、加元件。

## 下一步

- [快速開始](./quickstart) —— 複製、安裝、跑一次 codegen
- [目錄結構](./structure) —— 每個目錄的職責
- [令牌格式](../tokens/token-format) —— 令牌 JSON 的欄位約束
- [管線總覽](../codegen/pipeline) —— codegen 的完整資料流
