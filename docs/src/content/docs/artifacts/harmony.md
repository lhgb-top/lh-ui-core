---
title: "鸿蒙产物"
---

**路径**：`dist/harmony/tokens/LhTokens.ets` 与 `LhDarkTokens.ets`，存在投影令牌时额外生成 `LhShadow.ets`

**模块目录**：`tokens/`（ohpm 模块内）

## 结构

根 `export class`，嵌套类**不带 export**（ArkTS 类体内不允许 export 声明），成员为 `static readonly`：

```ts
export class LhTokens {
  class Button {
    static readonly borderRadius: Dimension | number = 2  // 按钮圆角跟随全局圆角
    static readonly borderWidth: Dimension | number = 1
    class FontSize {
      static readonly large: Dimension | number = 16
      static readonly medium: Dimension | number = 14
    }
    class Height {
      static readonly medium: Dimension | number = 40  // 中号按钮高度（默认）
    }
  }
  class Color {
    static readonly focus: ResourceColor = '#FF2B4C7C'
  }
}
```

## 命名映射

| 令牌路径 | ArkTS 成员 |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

## 唯一带类型注解的平台

ArkTS 是强类型，所以每个成员都带类型注解（`typeAnnotation()`）：

| 令牌类型 | 类型注解 |
| --- | --- |
| color | `ResourceColor` |
| dimension | `Dimension \| number` |
| duration / number | `number` |
| shadow | `LhShadow` |
| cubicBezier | `number[]` |
| string | `string` |

Kotlin / Swift / C 都靠字面量自推导，只有 ArkTS 显式标注。

## 单位与字面量

| 令牌类型 | ArkTS 字面量 |
| --- | --- |
| 颜色 | `'#FF2B4C7C'`（ArkUI 接受 `#AARRGGBB` 字符串，走 `toArgbHash`） |
| 尺寸 | 纯 `vp` 数值（`40`，不加单位） |
| 百分数 | `0.500  // 50%（分数，由容器尺寸换算）` |
| 时长 | `200  // 200ms（毫秒）` |
| 贝塞尔 | `[0.4, 0, 0.2, 1]  // 贝塞尔控制点，组件侧以 curves.cubicBezierCurve 消费` |
| 投影 | `{ color: '#FF000000', radius: 8, offsetX: 0, offsetY: 2 }` |
| 数值 / 字符串 | 原样 / `JSON.stringify` |

## LhShadow.ets

ArkUI 也没有复合投影类型，以**接口**承载（**静态模板，无令牌内容**）：

```ts
export interface LhShadow {
  color: ResourceColor
  /** 模糊半径 */
  radius: number
  offsetX: number
  offsetY: number
}
```

对比 iOS 的 `struct LhShadow`：ArkTS 用接口、SwiftUI 用结构体，各自贴合语言惯用法。

## 暗色

独立的 `export class LhDarkTokens`，结构同明色：

```ts
export class LhDarkTokens {
  class Color {
    static readonly focus: ResourceColor = '#FF7FA6D9'
    static readonly selected: ResourceColor = '#FFB1C1D8'
    // …其余被覆盖的键
  }
}
```

未覆盖的键在暗色下沿用 `LhTokens`。

## 消费方式

鸿蒙仓通过 ohpm 的 `file:` 依赖把 `dist/harmony/` 引入（本地联动），或消费已发包，`import { LhTokens } from '...'` 即可使用。
