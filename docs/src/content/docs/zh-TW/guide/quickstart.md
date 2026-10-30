---
title: "快速開始"
---

## 環境需求

- Node.js `>= 22.12`（文件站用 Astro 7，硬性要求）
- pnpm `10.x`（倉庫鎖定 `pnpm@10.34.5`）

## 安裝

```bash
pnpm install
```

本倉**執行時零依賴**（`dependencies` 為空），安裝的全是構建期工具鏈（tsx、ajv、handlebars、vitest、astro 等）。

## 跑一次 codegen

```bash
pnpm codegen
```

這條命令執行 `tsx codegen/src/index.ts`，完整流程是：

1. 讀取 `package.json` 版本號
2. 載入並校驗 `tokens/*.json`（Ajv 結構校驗）
3. 解析 ref、合併暗色（語意校驗：類型匹配、引用完整性、循環偵測）
4. 載入並校驗 `specs/*.json` 與 `cases/*.json`
5. **刪掉整個 `dist/` 並重建**
6. 依序執行 5 個 target（android → ios → harmony → c → docs）

輸出在 `dist/`：

```
  [android] android/top/lhgb/ui/tokens/LhTokens.kt
  [android] android/top/lhgb/ui/tokens/LhDarkTokens.kt
  ...
codegen 完成：5 個 target，N 個檔案，版本 v0.0.1
```

檔案數隨令牌內容變化（投影令牌存在時 ios / harmony 會各多一個投影載體檔案），以實際輸出為準。

## 校驗

```bash
pnpm verify          # = pnpm verify:tokens && pnpm verify:specs
```

- `verify:tokens`：令牌 schema + 引用完整性 + **關鍵文字/底色對比度 ≥4.5:1（WCAG AA）** + **平台專屬語法巡檢（`var()` / `rem` / `sp` / `dp`）**，並報告**孤兒暗色路徑**（暗色檔案宣告了、明色集裡不存在的鍵）與缺失類型的暗色鍵。
- `verify:specs`：spec 與 cases 的一致性（case 引用的 prop / event 是否在 spec 中存在等）。

## 測試

```bash
pnpm test
```

快照測試鏡像 `dist/` 的全部產物。改了令牌或模板後，快照會失敗，確認無誤後用 `pnpm test -- -u` 更新快照。

## 文件站

```bash
pnpm docs:dev        # 本地預覽 http://localhost:5185/lhui/core/
pnpm docs:build      # 生產構建（base 為 /lhui/core/）
pnpm docs:preview    # 預覽生產構建
```

文件站的三個參考頁（令牌 / 契約 / 用例）在構建期直接讀 `tokens/` `specs/` `cases/` 真源，**不需要先跑 codegen**。

## 常見組合

| 情境 | 命令 |
| --- | --- |
| 改了令牌，要產物 | `pnpm codegen` |
| 改了令牌，要產物 + 校驗 | `pnpm build`（= codegen + verify） |
| 改了模板，要產物 + 快照 | `pnpm codegen && pnpm test -- -u` |
| 只想看令牌速查表 | `pnpm codegen` 後看 `dist/docs/tokens.md` |

## 產物在哪消費

各原生端消費 `dist/` 下對應平台的產物：

- Android：`dist/android/` 下的 Kotlin 檔案
- iOS：`dist/ios/` 下的 Swift 檔案
- 鴻蒙：`dist/harmony/` 下的 ArkTS 檔案
- Windows：`dist/windows/` 下的 C# 檔案

本地連動（改令牌即時生效、不發版）的機制見 [本地連動](./local-linking)。
