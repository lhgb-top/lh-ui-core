---
title: "类型定义 types.ts"
---

> 全部 codegen 模块共享的类型定义。不依赖任何平台 API，构建期工具链内部使用，不进入任何运行时产物。

[管线总览](./pipeline) 里介绍了四个核心接口（`CodegenTarget` / `CodegenInput` / `GeneratedFile` / `TokenSet`），本页是完整参考。

## 令牌侧

### `TokenType`

```ts
type TokenType =
  | 'color'
  | 'dimension'
  | 'number'
  | 'string'
  | 'shadow'
  | 'duration'
  | 'cubicBezier'
```

与 `tokens/schema.json` 的 `$type` / `type` 枚举一一对应。各类型的中性值约束见 [令牌格式](../tokens/token-format)，解析见 [格式化层](./format)。

### `TokenValue`

```ts
type TokenValue = string | number | number[]
```

令牌的中性值：十六进制色值 / `rgba()` / 带单位字符串（`"12px"`、`"50%"`、`"0.3s"`）/ 纯数字（`number` 类型）/ 贝塞尔四元数组。禁止任何平台专属语法。

### `RawToken`

```ts
interface RawToken {
  value?: TokenValue       // 字面值（与 ref 二选一）
  ref?: string             // 引用另一令牌的点路径，构建期静态解析并烘焙
  type?: TokenType         // 未声明时继承文件 / 分组级 $type
  description?: string
  nativeOnly?: boolean     // 标记为原生血脉新增（非 web 血脉对齐项）
}
```

JSON 源文件中的叶子令牌，是 schema 中 `token` 节点的直接映射。`value` 与 `ref` 互斥（schema 的 `anyOf` 强制二选一）。

### `ResolvedToken`

```ts
interface ResolvedToken {
  path: string             // 点路径，如 color.primary.default
  type: TokenType
  value: TokenValue        // 烘焙后的字面值（ref 已展开）
  refChain?: string[]      // 若由 ref 解析而来，记录原始引用路径（含间接链）
  description?: string
  nativeOnly?: boolean
}
```

`resolveTokens` 的产物。`refChain` 只在令牌经由引用而来时存在，供文档与调试追溯原始引用链。

### `DarkOverrides`

```ts
type DarkOverrides = Map<string, TokenValue>
```

已解析的暗色覆盖：path -> 值。键是明色同名路径（`color-dark.json` 的 `$namespace` 与明色对齐，覆盖键才能落到同一路径）。

### `TokenSet`

```ts
interface TokenSet {
  tokens: ResolvedToken[]              // 明色令牌
  byPath: Map<string, ResolvedToken>   // 按路径快速查找
  dark: DarkOverrides                  // path -> 暗色覆盖值
}
```

`resolveTokens` 返回的 `ResolveResult.tokenSet`，是所有 target 的输入。`byPath` 供暗色覆盖回查明色令牌的类型与说明。

## 契约侧（specs）

### `ComponentSpec`

```ts
interface ComponentSpec {
  name: string             // 契约标识（kebab-case，如 'button'）
  component: string        // 展示名（如 'Button 按钮'）
  since?: string           // 引入版本
  description: string
  props: SpecProp[]
  events?: SpecEvent[]
  slots?: SpecSlot[]
  behaviors?: string[]
  tokenRefs?: string[]     // 本组件消费的令牌全路径
}
```

`specs/<name>.json` 的类型映射，由 `loadSpecs()` 装载并做 schema 校验。

### `SpecProp`

```ts
interface SpecProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'tokenRef' | 'node' | 'array'
  values?: string[]        // 仅 enum：枚举值集合
  default?: unknown        // 缺省值（缺省时省略）
  required?: boolean
  description: string
}
```

`type` 与 `specs/schema.json` 的 7 值枚举一致。其中 `tokenRef`（令牌点路径）与 `node`（节点引用）为预留值，当前 15 份契约均未使用。

### `SpecEvent`

```ts
interface SpecEvent {
  name: string
  payload?: { name: string; type: SpecProp['type']; description?: string }[]
  description: string
}
```

### `SpecSlot`

```ts
interface SpecSlot {
  name: string
  description: string
}
```

## 用例侧（cases）

### `ComponentCases`

```ts
interface ComponentCases {
  component: string        // 组件名，与 ComponentSpec.name 对应
  cases: GoldenCase[]      // 至少一条（schema 强制 minItems: 1）
}
```

### `GoldenCase`

```ts
interface GoldenCase {
  id: string               // 用例 id（kebab-case，全仓唯一）
  name: string             // 人类可读的一句话描述
  given: { props?: Record<string, unknown>; state?: Record<string, unknown> }
  when: {
    action: 'render' | 'click' | 'input' | 'focus' | 'blur' | 'custom'
    target?: string
    payload?: unknown
  }
  then: {
    events?: { name: string; assertion: 'emitted' | 'notEmitted'; times?: number; payload?: unknown }[]
    tokens?: { path: string; applied: boolean }[]
    visible?: boolean
    enabled?: boolean
    text?: string
    notes?: string
  }
}
```

given / when / then 三段式的类型映射。`when.action` 的 `blur` 为预留值，当前用例均未使用。字段语义见 [用例格式](../cases/case-format)。

## codegen 输入与产物

### `CodegenInput`

```ts
interface CodegenInput {
  tokens: TokenSet
  specs: ComponentSpec[]
  cases: ComponentCases[]
  version: string          // package.json 版本号，写进每个产物的头部注释
}
```

`main()` 组装后传给每个 target 的 `generate()`。目前各 target 只消费 `input.tokens`，`specs` / `cases` 预留给未来组件文档 / 类型骨架 / 测试生成。

### `CodegenTarget`

```ts
interface CodegenTarget {
  name: string             // 日志前缀，如 'android'
  outDir: string           // dist 下的子目录名
  generate(input: CodegenInput): GeneratedFile[]
}
```

每个平台 target 实现这个接口。新增一个平台 = 新增一个 target 并加进 `index.ts` 的 `targets` 数组。

### `GeneratedFile`

```ts
interface GeneratedFile {
  relativePath: string     // 相对 dist/<outDir>/ 的输出路径
  content: string
}
```

## 相关模块

| 模块 | 职责 |
| --- | --- |
| [管线总览](./pipeline) | `index.ts` 编排与核心接口速览 |
| [装载层 load.ts](./load) | 产出 `RawToken` / `ComponentSpec` / `ComponentCases` |
| [解析层 resolve.ts](./resolve) | 产出 `TokenSet`（`ResolvedToken` + `DarkOverrides`） |
| [五个 target](./targets) | 消费 `CodegenInput`，产出 `GeneratedFile` |
