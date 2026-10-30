---
title: "類型定義 types.ts"
---

> 全部 codegen 模組共享的類型定義。不依賴任何平台 API，構建期工具鏈內部使用，不進入任何執行時產物。

[管線總覽](./pipeline) 裡介紹了四個核心介面（`CodegenTarget` / `CodegenInput` / `GeneratedFile` / `TokenSet`），本頁是完整參考。

## 令牌側

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

與 `tokens/schema.json` 的 `$type` / `type` 列舉一一對應。各類型的中性值約束見 [令牌格式](../tokens/token-format)，解析見 [格式化層](./format)。

### `TokenValue`

```ts
type TokenValue = string | number | number[]
```

令牌的中性值：十六進位色值 / `rgba()` / 帶單位字串（`"12px"`、`"50%"`、`"0.3s"`）/ 純數字（`number` 類型）/ 貝茲四元陣列。禁止任何平台專屬語法。

### `RawToken`

```ts
interface RawToken {
  value?: TokenValue       // 字面值（與 ref 二選一）
  ref?: string             // 引用另一令牌的點路徑，構建期靜態解析並烘焙
  type?: TokenType         // 未宣告時繼承檔案 / 分組級 $type
  description?: string
  nativeOnly?: boolean     // 標記為原生血脈新增（非 web 血脈對齊項）
}
```

JSON 源檔案中的葉子令牌，是 schema 中 `token` 節點的直接映射。`value` 與 `ref` 互斥（schema 的 `anyOf` 強制二選一）。

### `ResolvedToken`

```ts
interface ResolvedToken {
  path: string             // 點路徑，如 color.primary.default
  type: TokenType
  value: TokenValue        // 烘焙後的字面值（ref 已展開）
  refChain?: string[]      // 若由 ref 解析而來，記錄原始引用路徑（含間接鏈）
  description?: string
  nativeOnly?: boolean
}
```

`resolveTokens` 的產物。`refChain` 只在令牌經由引用而來時存在，供文件與除錯追溯原始引用鏈。

### `DarkOverrides`

```ts
type DarkOverrides = Map<string, TokenValue>
```

已解析的暗色覆蓋：path -> 值。鍵是明色同名路徑（`color-dark.json` 的 `$namespace` 與明色對齊，覆蓋鍵才能落到同一路徑）。

### `TokenSet`

```ts
interface TokenSet {
  tokens: ResolvedToken[]              // 明色令牌
  byPath: Map<string, ResolvedToken>   // 按路徑快速查找
  dark: DarkOverrides                  // path -> 暗色覆蓋值
}
```

`resolveTokens` 傳回的 `ResolveResult.tokenSet`，是所有 target 的輸入。`byPath` 供暗色覆蓋回查明色令牌的類型與說明。

## 契約側（specs）

### `ComponentSpec`

```ts
interface ComponentSpec {
  name: string             // 契約識別碼（kebab-case，如 'button'）
  component: string        // 展示名（如 'Button 按钮'）
  since?: string           // 引入版本
  description: string
  props: SpecProp[]
  events?: SpecEvent[]
  slots?: SpecSlot[]
  behaviors?: string[]
  tokenRefs?: string[]     // 本元件消費的令牌全路徑
}
```

`specs/<name>.json` 的類型映射，由 `loadSpecs()` 載入並做 schema 校驗。

### `SpecProp`

```ts
interface SpecProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'tokenRef' | 'node' | 'array'
  values?: string[]        // 僅 enum：列舉值集合
  default?: unknown        // 缺省值（缺省時省略）
  required?: boolean
  description: string
}
```

`type` 與 `specs/schema.json` 的 7 值列舉一致。其中 `tokenRef`（令牌點路徑）與 `node`（節點引用）為預留值，當前 15 份契約均未使用。

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

## 用例側（cases）

### `ComponentCases`

```ts
interface ComponentCases {
  component: string        // 元件名，與 ComponentSpec.name 對應
  cases: GoldenCase[]      // 至少一條（schema 強制 minItems: 1）
}
```

### `GoldenCase`

```ts
interface GoldenCase {
  id: string               // 用例 id（kebab-case，全倉唯一）
  name: string             // 人類可讀的一句話描述
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

given / when / then 三段式的類型映射。`when.action` 的 `blur` 為預留值，當前用例均未使用。欄位語意見 [用例格式](../cases/case-format)。

## codegen 輸入與產物

### `CodegenInput`

```ts
interface CodegenInput {
  tokens: TokenSet
  specs: ComponentSpec[]
  cases: ComponentCases[]
  version: string          // package.json 版本號，寫進每個產物的頭部註解
}
```

`main()` 組裝後傳給每個 target 的 `generate()`。目前各 target 只消費 `input.tokens`，`specs` / `cases` 預留給未來元件文件 / 類型骨架 / 測試生成。

### `CodegenTarget`

```ts
interface CodegenTarget {
  name: string             // 日誌前綴，如 'android'
  outDir: string           // dist 下的子目錄名
  generate(input: CodegenInput): GeneratedFile[]
}
```

每個平台 target 實作這個介面。新增一個平台 = 新增一個 target 並加進 `index.ts` 的 `targets` 陣列。

### `GeneratedFile`

```ts
interface GeneratedFile {
  relativePath: string     // 相對 dist/<outDir>/ 的輸出路徑
  content: string
}
```

## 相關模組

| 模組 | 職責 |
| --- | --- |
| [管線總覽](./pipeline) | `index.ts` 編排與核心介面速覽 |
| [裝載層 load.ts](./load) | 產出 `RawToken` / `ComponentSpec` / `ComponentCases` |
| [解析層 resolve.ts](./resolve) | 產出 `TokenSet`（`ResolvedToken` + `DarkOverrides`） |
| [五個目標平台](./targets) | 消費 `CodegenInput`，產出 `GeneratedFile` |
