---
title: "暗色合併"
---

## 增量覆蓋

暗色檔案（`"$dark": true`）**只宣告與明色不同的鍵**，未覆蓋的鍵沿用明色值：

```json
// color-dark.json
{
  "$namespace": "color",
  "$dark": true,
  "$description": "僅宣告與明色不同的鍵，未覆蓋鍵沿用 color.json",
  "primary": { "default": { "value": "#3D649E" } }
}
```

`color.primary.hover`、`.active` 等未列出的鍵在暗色下沿用明色值。裁剪原則是**逐鍵比對**：與明色值完全相同的鍵一律刪除（例如 `onPrimary` 兩主題都是 `#FFFFFF`，`disabled.*` 兩主題都是同一組 ref，因此都不出現在暗色檔案裡）。

## 命名空間必須對齊

暗色檔案必須宣告與明色檔案**相同的 `$namespace`**（`color-dark.json` 顯式寫 `"$namespace": "color"`），覆蓋鍵才能落到同一路徑。

## 暗色 ref 就近解析

暗色檔案裡的 `ref` 用 `resolveDarkRef` 解析，規則與明色不同：

1. 目標在**暗色命名空間內**且是 ref → 在暗色內沿鏈遞迴（暗色引用暗色才是同主題取值）
2. 目標在暗色命名空間內且是字面值 → 傳回暗色值
3. 目標**不在**暗色命名空間內 → **回落到明色命名空間**取值

```json
// 暗色引用暗色：取暗色的 primary.active
"selectedDark": { "ref": "color.primary.active" }
```

暗色 ref 還做了環檢測（`检测到暗色令牌引用环`），且目標必須在明色集 / 暗色集任一中存在，否則拋 `暗色令牌 X 引用不存在`。

## color-mix 預計算

web 血脈的暗色大量使用 `color-mix()`，**原生端沒有這個執行時能力**，所以在構建期**預計算為字面色值**，並把計算依據寫進 description：

```json
"selected": {
  "value": "#B1C1D8",
  "description": "預計算自 color-mix(primary 40%, #fff)，暗色面板對比度 5.2:1"
},
"primary": {
  "bg": {
    "value": "rgba(61, 100, 158, 0.25)",
    "description": "預計算自 color-mix(primary 25%, transparent)"
  }
}
```

## 產物形態

`resolveTokens` 產出 `TokenSet.dark`：扁平的 `Map<path, TokenValue>`，只含被覆蓋的鍵。各端 target 再各自決定如何發射：

| 平台 | 暗色機制 |
| --- | --- |
| Android | 獨立 `object LhDarkTokens` |
| iOS | 獨立 `public enum LhDarkTokens` |
| 鴻蒙 | 獨立 `export class LhDarkTokens` |
| **C** | **同名巨集重定義**——暗色標頭檔在明色之後 include，直接覆蓋同名 `#define` |

## 孤兒暗色路徑

兩類異常被記入 `orphanDarkPaths`（**不中斷 codegen**，由 `pnpm verify:tokens` 報告）：

- 暗色鍵**缺類型**（既無自身 type，明色集也沒有同名鍵可繼承）→ 跳過該鍵，不寫入覆蓋表
- 暗色鍵在明色集**不存在**（孤兒）→ 仍寫入覆蓋表，但報告出來

## 暗色覆蓋範圍

當前暗色只覆蓋 `color.*` 命名空間（精確鍵數隨版本變化，見 [令牌參考](./reference) 頁的暗色列）。非顏色命名空間（間距、圓角、字級等）在暗色下沿用明色值——這也是 `dist/docs/tokens.md` 裡非顏色行的暗色列是 `—` 的原因。

在 [令牌參考](./reference) 頁可以同時看到每個令牌的明色與暗色值。
