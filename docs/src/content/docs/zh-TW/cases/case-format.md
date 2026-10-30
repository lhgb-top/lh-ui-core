---
title: "用例格式"
---

每個 `cases/<name>.json` 是一個元件的**黃金用例**集：可跨端翻譯的行為級斷言。格式由 `cases/schema.json` 強約束。

## 設計理念

> 邏輯不共享，行為共享。

各原生端**不共享任何測試程式碼**，而是照著同一份 cases 人工翻譯成本地測試（JUnit / XCTest / ohpm test / C 單測）。cases 只描述**行為**（給什麼條件、做什麼動作、期望什麼結果），不含任何端特有 API。

## 頂層結構

```json
{
  "$schema": "./schema.json",
  "component": "button",
  "cases": [ ... ]
}
```

- `component`：kebab-case，**須與同名 spec 的 `name` 一致**
- `cases`：至少一條

## 三段式結構

每條用例必填 `id` / `name` / `given` / `when` / `then`：

```json
{
  "id": "disabled-blocks-click",
  "name": "停用狀態不觸發 onClick",
  "given": { "props": { "disabled": true } },
  "when": { "action": "click" },
  "then": {
    "events": [{ "name": "onClick", "assertion": "notEmitted" }],
    "enabled": false
  }
}
```

### given（前置）

| 欄位 | 說明 |
| --- | --- |
| `props` | 初始 props，**鍵須存在於同名 spec 的 props** |
| `state` | 初始元件狀態，**自由鍵**，供端特有情境使用（如 `{ "text": "按鈕" }`） |

### when（動作）

| 欄位 | 說明 |
| --- | --- |
| `action` | **必填**，六值之一（見下） |
| `target` | 動作目標（如插槽名、子元件名） |
| `payload` | 動作承載（如 input 的文字） |

**六種動作**：`render`（渲染）/ `click`（點選）/ `input`（輸入）/ `focus`（獲得焦點）/ `blur`（失去焦點，**預留，當前無元件使用**）/ `custom`（自訂，**須由 `target` 說明**）。

### then（斷言）

| 欄位 | 說明 |
| --- | --- |
| `events` | 事件斷言陣列 |
| `tokens` | 令牌套用斷言陣列 |
| `visible` | 期望是否可見 |
| `enabled` | 期望是否可互動 |
| `text` | 期望渲染出的文字 |
| `notes` | 端無關的補充斷言說明（自然語言） |

**事件斷言**：

```json
{
  "name": "onValueChange",
  "assertion": "emitted",
  "times": 1,
  "payload": { "value": "青花瓷" }
}
```

- `name`：**須存在於同名 spec 的 events**
- `assertion`：`emitted`（觸發）或 `notEmitted`（不觸發）
- `times`：可選，期望觸發次數
- `payload`：可選，期望承載（**深層比較**）

**令牌斷言**：

```json
{ "path": "button.height.large", "applied": false }
```

`path` 是令牌全路徑，`applied` 斷言該令牌**是否**套用到渲染結果。`applied: false` 的**反向斷言**用於做尺寸互斥回歸（如選了 small 尺寸，`button.height.large` 就不該被消費）。

## 完整範例

```json
{
  "id": "small-size-uses-small-tokens",
  "name": "小號尺寸消費 small 尺寸令牌",
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
  "name": "清除按鈕觸發空值",
  "given": { "props": { "value": "已有", "clearable": true } },
  "when": { "action": "custom", "payload": { "call": "clear" } },
  "then": {
    "events": [{ "name": "onValueChange", "assertion": "emitted", "times": 1, "payload": { "value": "" } }]
  }
}
```

## 與 spec 的關係

`pnpm verify:specs` 會校驗：

- `given.props` 的鍵是否都在 spec 的 props 裡
- `then.events[].name` 是否都在 spec 的 events 裡

所以**改 spec 的 props / events 名時必須同步改 cases**。

## 當前元件清單

15 個元件，用例總數隨版本變化。全部用例見 [黃金用例參考](./reference)。
