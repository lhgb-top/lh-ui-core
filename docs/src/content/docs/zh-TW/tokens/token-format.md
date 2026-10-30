---
title: "令牌格式"
---

每個 `tokens/*.json` 檔案都是平台無關的中性源，格式由 `tokens/schema.json` 強約束。

## 檔案級元屬性

以 `$` 開頭的鍵是元屬性，不產生令牌：

| 屬性 | 作用 |
| --- | --- |
| `$schema` | 指向 `./schema.json`（編輯器自動補全 + 校驗） |
| `$description` | 檔案說明，會出現在 docs target 與基線文件裡 |
| `$type` | **檔案級預設類型**，未宣告自身 `type` 的字面值葉子繼承它 |
| `$dark` | `true` 表示本檔案是暗色覆蓋檔案（只宣告需要覆蓋的鍵） |
| `$namespace` | 命名空間前綴，決定全域點路徑（詳見 [命名空間](./namespace)） |

```json
{
  "$schema": "./schema.json",
  "$namespace": "color",
  "$type": "color",
  "$description": "色板與語意色",
  "primary": { "default": { "value": "#2B4C7C" } }
}
```

## 葉子令牌的五個欄位

| 欄位 | 必填 | 作用 |
| --- | --- | --- |
| `value` | 與 `ref` **二選一** | 字面值 |
| `ref` | 與 `value` **二選一** | 引用另一令牌的全路徑（構建期靜態解析並烘焙） |
| `type` | 可選 | 令牌類型，未宣告時繼承檔案級 `$type` |
| `description` | 可選 | 說明，會渲染進各端產物的註解與文件表 |
| `nativeOnly` | 可選 | `true` = 原生血脈新增、web 血脈無對應項 |

schema 用 `anyOf: [{required: [value]}, {required: [ref]}]` + `additionalProperties: false` 保證每個葉子**有且僅有** `value` 或 `ref` 之一，且不允許多餘欄位。

## 七種類型

`type` / `$type` 只允許這七個值：

| 類型 | 值的形態 | 範例 |
| --- | --- | --- |
| `color` | `#RGB` / `#RRGGBB` / `#AARRGGBB` / `rgba(r,g,b,a)` | `"#2B4C7C"`、`"rgba(61, 100, 158, 0.25)"` |
| `dimension` | **僅帶單位字串** `"12px"` / `"50%"`（`assertTypedValue` 強制字串；裸數值只在 `number` 類型下合法） | `"40px"`、`"50%"` |
| `number` | 純數值 | `400`、`1000` |
| `string` | 字串 | `"PingFang SC"` |
| `shadow` | 空格分隔的投影串（`x y blur [spread] color`） | `"0px 2px 12px 0px rgba(26, 26, 26, 0.08)"` |
| `duration` | `"200ms"` / `"0.2s"`（統一歸一為毫秒） | `"200ms"` |
| `cubicBezier` | 四元陣列 | `[0.4, 0, 0.2, 1]` |

類型不匹配值（如 `type: color` 配 `40px`）會在 resolve 階段被 `assertTypedValue` 拒絕，詳見 [類型系統](./type-system)。

## 中性值約束（紅線 5）

令牌值**只允許中性表達**：

- ✅ 十六進位色值、`rgba()`、`"12px"` / `"50%"` 帶單位字串、`number` 類型下的純數值
- ❌ `var()`、`rem`、`sp`、`dp` 等任何平台專屬單位或引用

平台單位換算由各 target 模板負責：

| 平台 | 換算 |
| --- | --- |
| Android | `usesSp()` 判定字級用 `sp`、其餘用 `dp` |
| iOS | 尺寸 `CGFloat`，時長 **轉秒**（`(ms/1000)`，SwiftUI 動畫以秒為單位） |
| 鴻蒙 | 尺寸純 `vp` 數值 |
| C | 純數值，註解說明單位（色值 `0xAARRGGBB`、尺寸邏輯像素、時長毫秒） |

## 分組巢狀

任意層級可以巢狀分組，分組也可以宣告自己的 `$type` 覆蓋整組預設類型：

```json
"fontSize": {
  "$type": "dimension",
  "base": { "value": "14px" },
  "small": { "value": "13px" }
}
```

`typography.json` 沒有檔案級 `$type`，靠分組級 `$type` 或葉子自帶 `type` 各自宣告。

## `nativeOnly` 標記

標記為原生血脈新增、web 血脈無對應的令牌（多為行動端新增尺寸）。作用：

- `dist/docs/tokens.md` 的說明欄標註「原生新增」
- 家族基線文件據此過濾出「原生新增令牌」清單
- **各原生 target 不過濾**，原樣生成

## 檔案清單

| 檔案 | `$namespace` | `$type` | 說明 |
| --- | --- | --- | --- |
| `color.json` | `color`（檔名推導） | `color` | 色板與語意色 |
| `color-dark.json` | `color`（顯式，須與明色同空間） | `color` | 暗色增量覆蓋 |
| `components.json` | `""` | `dimension` | 元件級令牌 |
| `typography.json` | `typography` | 無（分組/葉子各自宣告） | 排版 |
| `spacing.json` | `spacing` | `dimension` | 間距尺度 |
| `radius.json` | `radius` | `dimension` | 圓角 |
| `shadow.json` | `shadow` | `shadow` | 投影 |
| `motion.json` | `motion` | 無（分組/葉子各自宣告） | 時長與緩動 |
| `z-index.json` | `zIndex`（顯式） | `number` | 層級 |
