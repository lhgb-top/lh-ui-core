---
title: "紅線與命名規範"
---

## 六條紅線

### 1. 只生骨架，不生實作

codegen 只產出**令牌綁定**、props 列舉與類型、預設值常數。**禁止生成任何 UI 實作**——不生成 Composable 主體、SwiftUI View 主體、ArkUI 元件主體、C 元件函式主體。UI 實作全部留在各原生倉手寫。

這條紅線寫在 `codegen/src/index.ts` 的檔案頭註解裡，是工具鏈的自我宣告。

### 2. 令牌唯一源是 `tokens/*.json`

任何平台、任何元件不得繞過本倉另定令牌值。各原生倉只能消費 `dist/` 產物或對應平台的已發包，**禁止手寫色值 / 間距 / 字級**。

### 3. 執行時零 JS

本倉的 TS 程式碼只存在於構建期工具鏈，**產物中不得出現任何 JavaScript**。

### 4. 不得依賴 `lh-ui-share`

兩血脈互相獨立，不得 import 對方任何內容。令牌的初始值是一次性人工搬運的種子，不建立任何自動依賴。

### 5. JSON 不得含平台特有語法

令牌值只允許中性表達：十六進位色值 / `rgba()` / `number` 類型下的純數值 / `dimension` / `duration` / `shadow` 的**帶單位字串**（`"12px"` / `"50%"` / `"200ms"`，由 `assertTypedValue` 強制，詳見 [令牌格式](../tokens/token-format)）。禁止 `var()`、`rem`、`sp`、`dp` 等任何平台專屬單位或引用。**平台單位換算由各 target 模板負責**（如 Android 的 dp/sp 判定、iOS 的秒換算）。

### 6. `dist/` 禁止手改

一切變更改 `tokens/` / `specs/` / `cases/` 或模板，再重跑 `pnpm codegen`。`dist/` 在 `.gitignore` 內，每次 codegen 先刪後建。

## 命名規範（總綱 D20）

### 平台套件名 / 識別碼

平台套件名一律反域名 `top.lhgb.ui`：

| 平台 | 套件名 / 識別碼 |
| --- | --- |
| Android | `package top.lhgb.ui.tokens`，產物目錄 `dist/android/top/lhgb/ui/tokens/` |
| iOS | `Sources/LhUITokens/`（SwiftPM 目錄約定） |
| 鴻蒙 | `tokens/`（ohpm 模組內） |
| C | `include/lh_ui/` |

### 自有常數 / 類別 / 列舉前綴

一律 **LH 前綴**，按各語言慣例定大小寫：

| 語言 | 約定 | 範例 |
| --- | --- | --- |
| Kotlin | `Lh*`（PascalCase） | `object LhTokens`、`object LhDarkTokens` |
| Swift | `Lh*`（PascalCase） | `public enum LhTokens`、`struct LhShadow` |
| ArkTS | `Lh*`（PascalCase） | `export class LhTokens`、`interface LhShadow` |
| C | `LH_*`（全大寫蛇形） | `LH_COLOR_PRIMARY_DEFAULT`、`LH_Z_INDEX_MODAL` |

npm / ohpm 的 `@lh-ui/*` scope 不受此約束（npm 不使用反域名）。

### C 巨集命名規則

`zIndex.modal` → `LH_Z_INDEX_MODAL`：先把 `.` 轉底線，再給每個大寫字母前補底線，最後全大寫。詳見 [C 產物](../artifacts/c)。

## JSON 命名約束

各層 schema 用正則強約束命名：

| 層 | 欄位 | 規則 |
| --- | --- | --- |
| spec | `name` | kebab-case：`^[a-z][a-z0-9-]*$` |
| spec | `component` | PascalCase 帶 Lh 前綴：`^Lh[A-Z][a-zA-Z0-9]*$` |
| spec | prop 名 | camelCase：`^[a-z][a-zA-Z0-9]*$` |
| spec | event 名 | `^on[A-Z][a-zA-Z0-9]*$` |
| case | `id` | kebab-case |
| case | `component` | 須與同名 spec 的 `name` 一致 |

## 註解與文件語言

註解、文件、提交訊息一律**中文**（家族總綱要求）。
