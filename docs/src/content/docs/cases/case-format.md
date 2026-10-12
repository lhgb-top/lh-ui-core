---
title: "用例格式"
---

每个 `cases/<name>.json` 是一个组件的**黄金用例**集：可跨端翻译的行为级断言。格式由 `cases/schema.json` 强约束。

## 设计理念

> 逻辑不共享，行为共享。

各原生端**不共享任何测试代码**，而是照着同一份 cases 人工翻译成本地测试（JUnit / XCTest / ohpm test / C 单测）。cases 只描述**行为**（给什么条件、做什么动作、期望什么结果），不含任何端特有 API。

## 顶层结构

```json
{
  "$schema": "./schema.json",
  "component": "button",
  "cases": [ ... ]
}
```

- `component`：kebab-case，**须与同名 spec 的 `name` 一致**
- `cases`：至少一条

## 三段式结构

每条用例必填 `id` / `name` / `given` / `when` / `then`：

```json
{
  "id": "disabled-blocks-click",
  "name": "禁用态不触发 onClick",
  "given": { "props": { "disabled": true } },
  "when": { "action": "click" },
  "then": {
    "events": [{ "name": "onClick", "assertion": "notEmitted" }],
    "enabled": false
  }
}
```

### given（前置）

| 字段 | 说明 |
| --- | --- |
| `props` | 初始 props，**键须存在于同名 spec 的 props** |
| `state` | 初始组件状态，**自由键**，供端特有场景使用（如 `{ "text": "按钮" }`） |

### when（动作）

| 字段 | 说明 |
| --- | --- |
| `action` | **必填**，六值之一（见下） |
| `target` | 动作目标（如插槽名、子组件名） |
| `payload` | 动作载荷（如 input 的文本） |

**六种动作**：`render`（渲染）/ `click`（点击）/ `input`（输入）/ `focus`（获得焦点）/ `blur`（失去焦点，**预留，当前无组件使用**）/ `custom`（自定义，**须由 `target` 说明**）。

### then（断言）

| 字段 | 说明 |
| --- | --- |
| `events` | 事件断言数组 |
| `tokens` | 令牌应用断言数组 |
| `visible` | 期望是否可见 |
| `enabled` | 期望是否可交互 |
| `text` | 期望渲染出的文本 |
| `notes` | 端无关的补充断言说明（自然语言） |

**事件断言**：

```json
{
  "name": "onValueChange",
  "assertion": "emitted",
  "times": 1,
  "payload": { "value": "青花瓷" }
}
```

- `name`：**须存在于同名 spec 的 events**
- `assertion`：`emitted`（触发）或 `notEmitted`（不触发）
- `times`：可选，期望触发次数
- `payload`：可选，期望载荷（**深比较**）

**令牌断言**：

```json
{ "path": "button.height.large", "applied": false }
```

`path` 是令牌全路径，`applied` 断言该令牌**是否**应用到渲染结果。`applied: false` 的**反向断言**用于做尺寸互斥回归（如选了 small 尺寸，`button.height.large` 就不该被消费）。

## 完整示例

```json
{
  "id": "small-size-uses-small-tokens",
  "name": "小号尺寸消费 small 尺寸令牌",
  "given": { "props": { "size": "small" } },
  "when": { "action": "render" },
  "then": {
    "tokens": [
      { "path": "button.height.small",   "applied": true },
      { "path": "button.fontSize.small", "applied": true },
      { "path": "button.height.large",   "applied": false }
    ]
  }
}
```

```json
{
  "id": "clearable-emits-empty-value",
  "name": "清除按钮触发空值",
  "given": { "props": { "value": "已有", "clearable": true } },
  "when": { "action": "custom", "payload": { "call": "clear" } },
  "then": {
    "events": [{ "name": "onValueChange", "assertion": "emitted", "times": 1, "payload": { "value": "" } }]
  }
}
```

## 与 spec 的关系

`pnpm verify:specs` 会校验：

- `given.props` 的键是否都在 spec 的 props 里
- `then.events[].name` 是否都在 spec 的 events 里

所以**改 spec 的 props / events 名时必须同步改 cases**。

## 当前组件清单

15 个组件，用例总数随版本变化。全部用例见 [黄金用例参考](./reference)。
