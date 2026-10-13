---
title: "介绍"
---

> lh-ui-core 是 lh-ui 家族**原生血脉**的构建期中心。

## 本仓是什么

`@lh-ui/core` 是设计令牌的**唯一真源**、组件契约与黄金用例的所在地，外加一套把中性令牌生成到四个原生端的语言骨架的 codegen 工具。

它**不是运行时依赖**。它只在构建期工作：把平台无关的 JSON 令牌与组件契约，生成到 Android（Kotlin）/ iOS（Swift）/ 鸿蒙（ArkTS）/ C 四个原生端，再由各端 UI 库手写实现。**原生端运行时零 JavaScript。**

## 双血脉架构

家族有两条互相独立、不得关联的血脉：

```
lh-ui 家族
├── web 血脉：lh-ui-share（TS core + SCSS 唯一样式源）→ plus / vue2 / react / uniapp
└── 原生血脉：本仓（JSON 令牌 + 规范 + codegen）→ android / ios / harmony / windows
```

本仓与 `lh-ui-share` **没有任何代码依赖关系**，两仓各自独立闭环、各自发版。品牌与视觉的统一靠家族文档仓 `docs/设计语言基线.md` 的人工对齐机制，不靠自动同步。

## 三层契约

本仓的内容由三层互相独立又彼此引用的 JSON 契约构成：

| 层 | 位置 | 回答的问题 |
| --- | --- | --- |
| **令牌** | `tokens/*.json` | 「界面长什么样」——色值、间距、字号、圆角、投影、动效、层级、组件级尺寸 |
| **契约** | `specs/*.json` | 「组件有哪些能力」——props / 枚举 / 默认值 / 事件 / 插槽 / 行为 |
| **用例** | `cases/*.json` | 「组件该怎么测」——可跨端翻译的 given/when/then 行为级断言 |

codegen 只消费**令牌**生成四端骨架；**契约**与**用例**目前由各原生端人工消费（未来可能扩展为自动生成类型骨架与测试模板）。

## 令牌种子

本仓 `tokens/*.json` 的初始值是一次性从 `lh-ui-share/styles/theme/common/variables.scss` 与 `var-dark.scss` 人工抽取的对齐种子（2026-10-10，见家族 `docs/设计语言基线.md`）。此后两仓各自演化，**不再同步**。品牌级令牌（色板、间距尺度）变更必须在该基线文档登记。

## 谁应该读本文档

- **原生端开发者**（android / ios / harmony / windows）：了解 `dist/` 产物的命名约定、单位换算与暗色机制，知道令牌从哪来、值怎么算出来的。
- **本仓维护者**：了解 codegen 管线每个模块的职责与函数，能改模板、加令牌、加组件。

## 下一步

- [快速开始](./quickstart) —— 克隆、安装、跑一次 codegen
- [目录结构](./structure) —— 每个目录的职责
- [令牌格式](../tokens/token-format) —— 令牌 JSON 的字段约束
- [管线总览](../codegen/pipeline) —— codegen 的完整数据流
