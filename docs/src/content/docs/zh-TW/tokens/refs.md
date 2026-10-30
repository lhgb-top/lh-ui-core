---
title: "引用機制"
---

## `ref` 是什麼

一個葉子可以不寫 `value` 而寫 `ref`，指向另一個令牌的**全路徑**：

```json
"selected": { "ref": "color.primary.active", "description": "選中態文字色，跟隨主色按壓變體" }
```

構建期 `ref` 被**靜態解析並烘焙為字面值**——各端產物裡看到的是已經解析好的值，**執行時零間接**。

## 解析演算法

`resolve.ts` 的內嵌函式 `resolveRef(path, chain)`：

1. 目標路徑不存在 → 拋 `引用的令牌不存在：<path>`
2. 目標本身也是 ref → **遞迴**沿鏈往下走（支援任意長度的間接鏈）
3. 鏈中已含當前路徑 → 拋 `检测到令牌引用环：a -> b -> a`
4. 走到字面值 → 傳回 `{ value, type }`

## 間接鏈

```json
"a": { "ref": "b" },
"b": { "ref": "c" },
"c": { "value": "#2B4C7C" }
```

`a` 會沿鏈解析到 `c` 的字面值。

## 環檢測

```json
"a": { "ref": "b" },
"b": { "ref": "a" }
```

resolve 時 `chain.includes(path)` 命中，拋 `检测到令牌引用环：a -> b -> a`，codegen 直接失敗。

## 烘焙結果

解析結果寫進 `token.value`，並記錄 `refChain`（`ResolvedToken.refChain`，如 `["color.primary.active"]`）。各端產物裡只有字面值，看不到 ref：

```kotlin
// button.borderRadius 引用了 radius.base（2px），烘焙後：
val borderRadius = 2.dp  // 按鈕圓角跟隨全域圓角
```

## 類型隨真源走

ref 葉子未宣告自身 `type` 時，**類型取引用目標的類型**（三層優先順序的第 2 層，詳見 [類型系統](./type-system)）。

## refMap

`resolveTokens` 傳回的 `refMap` 記錄所有解析出的引用關係（`path -> 原始 ref 字串`，暗色鍵帶 `dark:` 前綴），供文件與 `pnpm verify:tokens` 使用。

## 實際用法

`tokens/` 裡 ref 的典型情境：

| 情境 | 範例 |
| --- | --- |
| 元件跟隨全域量 | `button.borderRadius` → `radius.base` |
| 狀態跟隨語意色 | `color.selected` → `color.primary.active` |
| 元件字級跟隨排版 | `button.fontSize.small` → `typography.fontSize.small` |

**任何引用都必須寫全路徑**（命名空間 + 巢狀路徑），詳見 [命名空間](./namespace)。
