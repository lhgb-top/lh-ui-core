---
title: "新增元件流程"
---

原生血脈新增一個元件，按順序走完五步。

## 1. 寫元件契約 `specs/<name>.json`

宣告 props / 列舉 / 預設值 / 事件 / 插槽 / 行為 / 消費的令牌。

```json
{
  "$schema": "./schema.json",
  "name": "stepper",
  "component": "LhStepper",
  "since": "0.1.0",
  "description": "步進器：在指定範圍內按步長增減數值。",
  "props": [
    { "name": "value", "type": "number", "default": 0, "description": "當前值（受控）" },
    { "name": "step", "type": "number", "default": 1, "description": "步長" },
    { "name": "disabled", "type": "boolean", "default":  false, "description": "是否停用" }
  ],
  "events": [
    { "name": "onChange", "payload": [{ "name": "value", "type": "number", "description": "變更後的值" }], "description": "值變化時觸發" }
  ],
  "behaviors": [
    "disabled 為 true 時：增減按鈕不回應，不觸發 onChange"
  ],
  "tokenRefs": ["stepper.height", "stepper.buttonSize"]
}
```

欄位約束詳見 [契約格式](../specs/spec-format)。

## 2. 寫黃金用例 `cases/<name>.json`

為每個需要跨端保證的行為寫一條 given/when/then 斷言：

```json
{
  "$schema": "./schema.json",
  "component": "stepper",
  "cases": [
    {
      "id": "disabled-blocks-change",
      "name": "停用狀態不觸發 onChange",
      "given": { "props": { "disabled": true } },
      "when": { "action": "click", "target": "增加按鈕" },
      "then": {
        "events": [{ "name": "onChange", "assertion": "notEmitted" }],
        "enabled": false
      }
    }
  ]
}
```

格式詳見 [用例格式](../cases/case-format)。

## 3. 跑校驗

```bash
pnpm verify:specs
```

校驗 case 與 spec 的一致性：case 的 `given.props` 鍵是否都在 spec 的 props 裡、`then.events[].name` 是否都在 spec 的 events 裡等。

## 4. 補元件級令牌（若需要）

若元件引入了新的**元件級令牌**（如 `stepper.height`），在 `tokens/components.json` 的對應元件命名空間下補鍵：

```json
"stepper": {
  "height": { "value": "32px", "description": "步進器高度", "nativeOnly": true },
  "buttonSize": { "value": "24px", "description": "增減按鈕尺寸" }
}
```

然後：

```bash
pnpm codegen      # 重新生成 dist/
pnpm verify:tokens
pnpm test -- -u   # 更新快照
```

若新令牌屬**品牌級**（色板、間距尺度等全域量而非元件尺寸），改到對應的 `tokens/<category>.json`，並在家族 `docs/設計語言基線.md` 的「變更登記」章節登記。

## 5. 發版

```bash
pnpm changeset    # 寫一條 changeset
pnpm changeset:version
```

core 先發版，各原生端隨後升令牌依賴版本，並照 `cases/stepper.json` 把用例人工翻譯成本地測試（JUnit / XCTest / ohpm test / C 單測）。

## checklist

- [ ] `specs/<name>.json` 存在且 `pnpm verify:specs` 通過
- [ ] `cases/<name>.json` 存在且與 spec 一致
- [ ] 新令牌已加到 `tokens/` 且 `pnpm verify:tokens` 通過
- [ ] `pnpm codegen` 成功，`pnpm test` 快照已更新
- [ ] changeset 已寫
- [ ] （品牌級令牌）家族基線文件已登記
