---
title: "契约格式"
---

每个 `specs/<name>.json` 是一个组件的**跨端契约**。格式由 `specs/schema.json` 强约束。

## 顶层结构

```json
{
  "$schema": "./schema.json",
  "name": "button",
  "component": "LhButton",
  "since": "0.1.0",
  "description": "按钮：触发即时操作，支持类型、尺寸、加载、禁用、图标与花纹底。",
  "props": [ ... ],
  "events": [ ... ],
  "slots": [ ... ],
  "behaviors": [ ... ],
  "tokenRefs": [ ... ]
}
```

| 字段 | 必填 | 约束 |
| --- | --- | --- |
| `name` | 是 | kebab-case：`^[a-z][a-z0-9-]*$`，与文件名一致 |
| `component` | 是 | PascalCase 带 Lh 前缀：`^Lh[A-Z][a-zA-Z0-9]*$` |
| `description` | 是 | 中文描述 |
| `props` | 是 | 数组，至少一项（schema 用 `minItems: 1` 强制） |
| `since` | 否 | 引入版本 |
| `events` / `slots` / `behaviors` / `tokenRefs` | 否 | 见下 |

`additionalProperties: false`——不允许多余字段。

## props

```json
{ "name": "size", "type": "enum", "values": ["small", "medium", "large"], "default": "medium", "description": "按钮尺寸" }
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | camelCase：`^[a-z][a-zA-Z0-9]*$`，**五端统一** |
| `type` | 是 | 见下表 |
| `description` | 是 | 中文说明 |
| `values` | 否 | `type: enum` 时的枚举值（字符串字面量数组） |
| `items` | `type: array` 时**必填** | 数组元素类型（`string` / `number` / `boolean`）+ 说明 |
| `default` | 否 | 默认值（任意 JSON 类型），省略表示无默认值 |
| `required` | 否 | 布尔，默认 `false` |

**七种 prop 类型**：

| 类型 | 含义 | 各端映射 |
| --- | --- | --- |
| `string` | 字符串 | `String` / `String` / `string` / `const char*` |
| `number` | 数值 | `Int` / `Double` / `number` / `int` |
| `boolean` | 布尔 | `Boolean` / `Bool` / `boolean` / `bool` |
| `enum` | 枚举（须给 `values`） | 各端生成对应的枚举类型 |
| `tokenRef` | 令牌点路径 | 令牌引用，verify 时检查路径存在性（**预留，当前无组件使用**） |
| `node` | 插槽 / 子节点内容 | Compose content、SwiftUI ViewBuilder、ArkUI Builder、C 子节点句柄（**预留，当前无组件使用**） |
| `array` | 数组（须给 `items`） | 选择器候选项等 |

## events

```json
{
  "name": "onValueChange",
  "payload": [{ "name": "value", "type": "string", "description": "变更后的文本" }],
  "description": "文本变化时触发；disabled 或 readonly 为 true 时不触发"
}
```

- `name`：`^on[A-Z][a-zA-Z0-9]*$`，**五端统一**
- `payload`：字段数组（每项 `name` + `type` + 可选 `description`），**空数组表示无载荷**
- `description`：必填

## slots

```json
{ "name": "prefix", "description": "输入框前缀内容（左侧非输入区）" }
```

`name` 同样是 camelCase。slot 的**端侧实现**由 `node` 类型的 prop 或各端插槽机制承载。

## behaviors

自然语言的行为描述数组，供 cases 抽取与文档生成：

```json
"behaviors": [
  "disabled 为 true 时：不响应点击，呈现禁用样式（disabled.* 令牌），不触发 onClick",
  "size 映射：small/medium/large 分别取 button.height.<size> 等尺寸令牌"
]
```

## tokenRefs

本组件消费的令牌**全路径**列表，供 `pnpm verify:specs` 检查引用完整性：

```json
"tokenRefs": ["button.height.medium", "color.primary.default", "color.onPrimary"]
```

## 命名为什么这么严格

所有命名正则都是**跨端对齐**用的：`name` 决定文件名与各端测试命名，`component` 是各端类名的基础，prop 名与事件名在五端保持一致，cases 才能照着翻译。

## 当前组件清单

15 个组件：button、cell、checkbox、dialog、icon、input、loading、navbar、picker、radio、switch、tag、text、textarea、toast。全部契约见 [组件契约参考](./reference)。
