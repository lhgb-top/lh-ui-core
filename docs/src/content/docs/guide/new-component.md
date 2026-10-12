---
title: "新增组件流程"
---

原生血脉新增一个组件，按顺序走完五步。

## 1. 写组件契约 `specs/<name>.json`

声明 props / 枚举 / 默认值 / 事件 / 插槽 / 行为 / 消费的令牌。

```json
{
  "$schema": "./schema.json",
  "name": "stepper",
  "component": "LhStepper",
  "since": "0.1.0",
  "description": "步进器：在指定范围内按步长增减数值。",
  "props": [
    { "name": "value", "type": "number", "default": 0, "description": "当前值（受控）" },
    { "name": "step", "type": "number", "default": 1, "description": "步长" },
    { "name": "disabled", "type": "boolean", "default":  false, "description": "是否禁用" }
  ],
  "events": [
    { "name": "onChange", "payload": [{ "name": "value", "type": "number", "description": "变更后的值" }], "description": "值变化时触发" }
  ],
  "behaviors": [
    "disabled 为 true 时：增减按钮不响应，不触发 onChange"
  ],
  "tokenRefs": ["stepper.height", "stepper.buttonSize"]
}
```

字段约束详见 [契约格式](../specs/spec-format)。

## 2. 写黄金用例 `cases/<name>.json`

为每个需要跨端保证的行为写一条 given/when/then 断言：

```json
{
  "$schema": "./schema.json",
  "component": "stepper",
  "cases": [
    {
      "id": "disabled-blocks-change",
      "name": "禁用态不触发 onChange",
      "given": { "props": { "disabled": true } },
      "when": { "action": "click", "target": "增加按钮" },
      "then": {
        "events": [{ "name": "onChange", "assertion": "notEmitted" }],
        "enabled": false
      }
    }
  ]
}
```

格式详见 [用例格式](../cases/case-format)。

## 3. 跑校验

```bash
pnpm verify:specs
```

校验 case 与 spec 的一致性：case 的 `given.props` 键是否都在 spec 的 props 里、`then.events[].name` 是否都在 spec 的 events 里等。

## 4. 补组件级令牌（若需要）

若组件引入了新的**组件级令牌**（如 `stepper.height`），在 `tokens/components.json` 的对应组件命名空间下补键：

```json
"stepper": {
  "height": { "value": "32px", "description": "步进器高度", "nativeOnly": true },
  "buttonSize": { "value": "24px", "description": "增减按钮尺寸" }
}
```

然后：

```bash
pnpm codegen      # 重新生成 dist/
pnpm verify:tokens
pnpm test -- -u   # 更新快照
```

若新令牌属**品牌级**（色板、间距尺度等全局量而非组件尺寸），改到对应的 `tokens/<category>.json`，并在家族 `docs/设计语言基线.md` 的「变更登记」章节登记。

## 5. 发版

```bash
pnpm changeset    # 写一条 changeset
pnpm changeset:version
```

core 先发版，各原生端随后升令牌依赖版本，并照 `cases/stepper.json` 把用例人工翻译成本地测试（JUnit / XCTest / ohpm test / C 单测）。

## checklist

- [ ] `specs/<name>.json` 存在且 `pnpm verify:specs` 通过
- [ ] `cases/<name>.json` 存在且与 spec 一致
- [ ] 新令牌已加到 `tokens/` 且 `pnpm verify:tokens` 通过
- [ ] `pnpm codegen` 成功，`pnpm test` 快照已更新
- [ ] changeset 已写
- [ ] （品牌级令牌）家族基线文档已登记
