---
title: "令牌格式"
---

每个 `tokens/*.json` 文件都是平台无关的中性源，格式由 `tokens/schema.json` 强约束。

## 文件级元属性

以 `$` 开头的键是元属性，不产生令牌：

| 属性 | 作用 |
| --- | --- |
| `$schema` | 指向 `./schema.json`（编辑器自动补全 + 校验） |
| `$description` | 文件说明，会出现在 docs target 与基线文档里 |
| `$type` | **文件级默认类型**，未声明自身 `type` 的字面量叶子继承它 |
| `$dark` | `true` 表示本文件是暗色覆盖文件（只声明需要覆盖的键） |
| `$namespace` | 命名空间前缀，决定全局点路径（详见 [命名空间](./namespace)） |

```json
{
  "$schema": "./schema.json",
  "$namespace": "color",
  "$type": "color",
  "$description": "色板与语义色",
  "primary": { "default": { "value": "#2B4C7C" } }
}
```

## 叶子令牌的五个字段

| 字段 | 必填 | 作用 |
| --- | --- | --- |
| `value` | 与 `ref` **二选一** | 字面值 |
| `ref` | 与 `value` **二选一** | 引用另一令牌的全路径（构建期静态解析并烘焙） |
| `type` | 可选 | 令牌类型，未声明时继承文件级 `$type` |
| `description` | 可选 | 说明，会渲染进各端产物的注释与文档表 |
| `nativeOnly` | 可选 | `true` = 原生血脉新增、web 血脉无对应项 |

schema 用 `anyOf: [{required: [value]}, {required: [ref]}]` + `additionalProperties: false` 保证每个叶子**有且仅有** `value` 或 `ref` 之一，且不允许多余字段。

## 七种类型

`type` / `$type` 只允许这七个值：

| 类型 | 值的形态 | 示例 |
| --- | --- | --- |
| `color` | `#RGB` / `#RRGGBB` / `#AARRGGBB` / `rgba(r,g,b,a)` | `"#2B4C7C"`、`"rgba(61, 100, 158, 0.25)"` |
| `dimension` | **仅带单位字符串** `"12px"` / `"50%"`（`assertTypedValue` 强制字符串；裸数值只在 `number` 类型下合法） | `"40px"`、`"50%"` |
| `number` | 纯数值 | `400`、`1000` |
| `string` | 字符串 | `"PingFang SC"` |
| `shadow` | 空格分隔的投影串（`x y blur [spread] color`） | `"0px 2px 12px 0px rgba(26, 26, 26, 0.08)"` |
| `duration` | `"200ms"` / `"0.2s"`（统一归一为毫秒） | `"200ms"` |
| `cubicBezier` | 四元数组 | `[0.4, 0, 0.2, 1]` |

类型不匹配值（如 `type: color` 配 `40px`）会在 resolve 阶段被 `assertTypedValue` 拒绝，详见 [类型系统](./type-system)。

## 中性值约束（红线 5）

令牌值**只允许中性表达**：

- ✅ 十六进制色值、`rgba()`、`"12px"` / `"50%"` 带单位字符串、`number` 类型下的纯数值
- ❌ `var()`、`rem`、`sp`、`dp` 等任何平台专属单位或引用

平台单位换算由各 target 模板负责：

| 平台 | 换算 |
| --- | --- |
| Android | `usesSp()` 判定字号用 `sp`、其余用 `dp` |
| iOS | 尺寸 `CGFloat`，时长 **转秒**（`(ms/1000)`，SwiftUI 动画以秒为单位） |
| 鸿蒙 | 尺寸纯 `vp` 数值 |
| C | 纯数值，注释说明单位（色值 `0xAARRGGBB`、尺寸逻辑像素、时长毫秒） |

## 分组嵌套

任意层级可以嵌套分组，分组也可以声明自己的 `$type` 覆盖整组默认类型：

```json
"fontSize": {
  "$type": "dimension",
  "base": { "value": "14px" },
  "small": { "value": "13px" }
}
```

`typography.json` 没有文件级 `$type`，靠分组级 `$type` 或叶子自带 `type` 各自声明。

## `nativeOnly` 标记

标记为原生血脉新增、web 血脉无对应的令牌（多为移动端新增尺寸）。作用：

- `dist/docs/tokens.md` 的说明列标注「原生新增」
- 家族基线文档据此过滤出「原生新增令牌」清单
- **各原生 target 不过滤**，原样生成

## 文件清单

| 文件 | `$namespace` | `$type` | 说明 |
| --- | --- | --- | --- |
| `color.json` | `color`（文件名推导） | `color` | 色板与语义色 |
| `color-dark.json` | `color`（显式，须与明色同空间） | `color` | 暗色增量覆盖 |
| `components.json` | `""` | `dimension` | 组件级令牌 |
| `typography.json` | `typography` | 无（分组/叶子各自声明） | 排版 |
| `spacing.json` | `spacing` | `dimension` | 间距尺度 |
| `radius.json` | `radius` | `dimension` | 圆角 |
| `shadow.json` | `shadow` | `shadow` | 投影 |
| `motion.json` | `motion` | 无（分组/叶子各自声明） | 时长与缓动 |
| `z-index.json` | `zIndex`（显式） | `number` | 层级 |
