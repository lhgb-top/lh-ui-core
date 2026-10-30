---
title: "鴻蒙產物"
---

**路徑**：`dist/harmony/tokens/LhTokens.ets` 與 `LhDarkTokens.ets`，存在投影令牌時額外生成 `LhShadow.ets`

**模組目錄**：`tokens/`（ohpm 模組內）

## 結構

根 `export class`，巢狀類別**不帶 export**（ArkTS 類別體內不允許 export 宣告），成員為 `static readonly`：

```ts
export class LhTokens {
  class Button {
    static readonly borderRadius: Dimension | number = 2  // 按鈕圓角跟隨全域圓角
    static readonly borderWidth: Dimension | number = 1
    class FontSize {
      static readonly large: Dimension | number = 16
      static readonly medium: Dimension | number = 14
    }
    class Height {
      static readonly medium: Dimension | number = 40  // 中號按鈕高度（預設）
    }
  }
  class Color {
    static readonly focus: ResourceColor = '#FF2B4C7C'
  }
}
```

## 命名映射

| 令牌路徑 | ArkTS 成員 |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

## 唯一帶類型註解的平台

ArkTS 是強類型，所以每個成員都帶類型註解（`typeAnnotation()`）：

| 令牌類型 | 類型註解 |
| --- | --- |
| color | `ResourceColor` |
| dimension | `Dimension \| number` |
| duration / number | `number` |
| shadow | `LhShadow` |
| cubicBezier | `number[]` |
| string | `string` |

Kotlin / Swift / C 都靠字面值自推導，只有 ArkTS 顯式標註。

## 單位與字面值

| 令牌類型 | ArkTS 字面值 |
| --- | --- |
| 顏色 | `'#FF2B4C7C'`（ArkUI 接受 `#AARRGGBB` 字串，走 `toArgbHash`） |
| 尺寸 | 純 `vp` 數值（`40`，不加單位） |
| 百分數 | `0.500  // 50%（分數，由容器尺寸換算）` |
| 時長 | `200  // 200ms（毫秒）` |
| 貝茲 | `[0.4, 0, 0.2, 1]  // 貝茲控制點，元件側以 curves.cubicBezierCurve 消費` |
| 投影 | `{ color: '#FF000000', radius: 8, offsetX: 0, offsetY: 2 }` |
| 數值 / 字串 | 原樣 / `JSON.stringify` |

## LhShadow.ets

ArkUI 也沒有複合投影類型，以**介面**承載（**靜態模板，無令牌內容**）：

```ts
export interface LhShadow {
  color: ResourceColor
  /** 模糊半徑 */
  radius: number
  offsetX: number
  offsetY: number
}
```

對比 iOS 的 `struct LhShadow`：ArkTS 用介面、SwiftUI 用結構體，各自貼合語言慣用法。

## 暗色

獨立的 `export class LhDarkTokens`，結構同明色：

```ts
export class LhDarkTokens {
  class Color {
    static readonly focus: ResourceColor = '#FF7FA6D9'
    static readonly selected: ResourceColor = '#FFB1C1D8'
    // …其餘被覆蓋的鍵
  }
}
```

未覆蓋的鍵在暗色下沿用 `LhTokens`。

## 消費方式

鴻蒙倉透過 ohpm 的 `file:` 依賴把 `dist/harmony/` 引入（本地連動），或消費已發包，`import { LhTokens } from '...'` 即可使用。
