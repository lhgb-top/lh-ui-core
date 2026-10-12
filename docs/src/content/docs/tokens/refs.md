---
title: "引用机制"
---

## `ref` 是什么

一个叶子可以不写 `value` 而写 `ref`，指向另一个令牌的**全路径**：

```json
"selected": { "ref": "color.primary.active", "description": "选中态文字色，跟随主色按压变体" }
```

构建期 `ref` 被**静态解析并烘焙为字面值**——各端产物里看到的是已经解析好的值，**运行时零间接**。

## 解析算法

`resolve.ts` 的内联函数 `resolveRef(path, chain)`：

1. 目标路径不存在 → 抛 `引用的令牌不存在：<path>`
2. 目标本身也是 ref → **递归**沿链往下走（支持任意长度的间接链）
3. 链中已含当前路径 → 抛 `检测到令牌引用环：a -> b -> a`
4. 走到字面值 → 返回 `{ value, type }`

## 间接链

```json
"a": { "ref": "b" },
"b": { "ref": "c" },
"c": { "value": "#2B4C7C" }
```

`a` 会沿链解析到 `c` 的字面值。

## 环检测

```json
"a": { "ref": "b" },
"b": { "ref": "a" }
```

resolve 时 `chain.includes(path)` 命中，抛 `检测到令牌引用环：a -> b -> a`，codegen 直接失败。

## 烘焙结果

解析结果写进 `token.value`，并记录 `refChain`（`ResolvedToken.refChain`，如 `["color.primary.active"]`）。各端产物里只有字面值，看不到 ref：

```kotlin
// button.borderRadius 引用了 radius.base（2px），烘焙后：
val borderRadius = 2.dp  // 按钮圆角跟随全局圆角
```

## 类型随真源走

ref 叶子未声明自身 `type` 时，**类型取引用目标的类型**（三层优先级的第 2 层，详见 [类型系统](./type-system)）。

## refMap

`resolveTokens` 返回的 `refMap` 记录所有解析出的引用关系（`path -> 原始 ref 字符串`，暗色键带 `dark:` 前缀），供文档与 `pnpm verify:tokens` 使用。

## 实际用法

`tokens/` 里 ref 的典型场景：

| 场景 | 示例 |
| --- | --- |
| 组件跟随全局量 | `button.borderRadius` → `radius.base` |
| 状态跟随语义色 | `color.selected` → `color.primary.active` |
| 组件字号跟随排版 | `button.fontSize.small` → `typography.fontSize.small` |

**任何引用都必须写全路径**（命名空间 + 嵌套路径），详见 [命名空间](./namespace)。
