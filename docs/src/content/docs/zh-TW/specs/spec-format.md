---
title: "契約格式"
---

每個 `specs/<name>.json` 是一個元件的**跨端契約**。格式由 `specs/schema.json` 強約束。

## 頂層結構

```json
{
  "$schema": "./schema.json",
  "name": "button",
  "component": "LhButton",
  "since": "0.1.0",
  "description": "按鈕：觸發即時操作，支援類型、尺寸、載入、停用、圖示與花紋底。",
  "props": [ ... ],
  "events": [ ... ],
  "slots": [ ... ],
  "behaviors": [ ... ],
  "tokenRefs": [ ... ]
}
```

| 欄位 | 必填 | 約束 |
| --- | --- | --- |
| `name` | 是 | kebab-case：`^[a-z][a-z0-9-]*$`，與檔名一致 |
| `component` | 是 | PascalCase 帶 Lh 前綴：`^Lh[A-Z][a-zA-Z0-9]*$` |
| `description` | 是 | 中文描述 |
| `props` | 是 | 陣列，至少一項（schema 用 `minItems: 1` 強制） |
| `since` | 否 | 引入版本 |
| `events` / `slots` / `behaviors` / `tokenRefs` | 否 | 見下 |

`additionalProperties: false`——不允許多餘欄位。

## props

```json
{ "name": "size", "type": "enum", "values": ["small", "medium", "large"], "default": "medium", "description": "按鈕尺寸" }
```

| 欄位 | 必填 | 說明 |
| --- | --- | --- |
| `name` | 是 | camelCase：`^[a-z][a-zA-Z0-9]*$`，**五端統一** |
| `type` | 是 | 見下表 |
| `description` | 是 | 中文說明 |
| `values` | 否 | `type: enum` 時的列舉值（字串字面值陣列） |
| `items` | `type: array` 時**必填** | 陣列元素類型（`string` / `number` / `boolean`）+ 說明 |
| `default` | 否 | 預設值（任意 JSON 類型），省略表示無預設值 |
| `required` | 否 | 布林，預設 `false` |

**七種 prop 類型**：

| 類型 | 含義 | 各端映射 |
| --- | --- | --- |
| `string` | 字串 | `String` / `String` / `string` / `const char*` |
| `number` | 數值 | `Int` / `Double` / `number` / `int` |
| `boolean` | 布林 | `Boolean` / `Bool` / `boolean` / `bool` |
| `enum` | 列舉（須給 `values`） | 各端生成對應的列舉類型 |
| `tokenRef` | 令牌點路徑 | 令牌引用，verify 時檢查路徑存在性（**預留，當前無元件使用**） |
| `node` | 插槽 / 子節點內容 | Compose content、SwiftUI ViewBuilder、ArkUI Builder、C 子節點代號（**預留，當前無元件使用**） |
| `array` | 陣列（須給 `items`） | 選擇器候選項等 |

## events

```json
{
  "name": "onValueChange",
  "payload": [{ "name": "value", "type": "string", "description": "變更後的文字" }],
  "description": "文字變化時觸發；disabled 或 readonly 為 true 時不觸發"
}
```

- `name`：`^on[A-Z][a-zA-Z0-9]*$`，**五端統一**
- `payload`：欄位陣列（每項 `name` + `type` + 可選 `description`），**空陣列表示無承載**
- `description`：必填

## slots

```json
{ "name": "prefix", "description": "輸入框前綴內容（左側非輸入區）" }
```

`name` 同樣是 camelCase。slot 的**端側實作**由 `node` 類型的 prop 或各端插槽機制承載。

## behaviors

自然語言的行為描述陣列，供 cases 抽取與文件生成：

```json
"behaviors": [
  "disabled 為 true 時：不回應點選，呈現停用樣式（disabled.* 令牌），不觸發 onClick",
  "size 映射：small/medium/large 分別取 button.height.<size> 等尺寸令牌"
]
```

## tokenRefs

本元件消費的令牌**全路徑**清單，供 `pnpm verify:specs` 檢查引用完整性：

```json
"tokenRefs": ["button.height.medium", "color.primary.default", "color.onPrimary"]
```

## 命名為什麼這麼嚴格

所有命名正則都是**跨端對齊**用的：`name` 決定檔名與各端測試命名，`component` 是各端類別文名稱的基礎，prop 名與事件名在五端保持一致，cases 才能照著翻譯。

## 當前元件清單

15 個元件：button、cell、checkbox、dialog、icon、input、loading、navbar、picker、radio、switch、tag、text、textarea、toast。全部契約見 [元件契約參考](./reference)。
