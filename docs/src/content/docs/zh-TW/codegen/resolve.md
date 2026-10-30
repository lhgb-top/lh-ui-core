---
title: "解析層 resolve.ts"
---

> 引用解析與暗色合併。

`resolveTokens(files: LoadedTokenFile[]): ResolveResult` 是核心函式，三段式：

## 傳回值

```ts
interface ResolveResult {
  tokenSet: TokenSet                    // 明色令牌集 + 暗色覆蓋表
  orphanDarkPaths: string[]             // 孤兒暗色路徑（verify 報告用）
  refMap: Map<string, string>           // path -> 原始 ref 字串（暗色鍵帶 dark: 前綴）
}
```

## 第一段：明色折疊

把所有非暗色檔案的 `flat` 合併為單一 `rawMap`：

```ts
if (rawMap.has(path)) throw new Error(`令牌路径重复定义：${path}（文件 ${file.fileName}）`)
```

每條記錄帶三個值：

| 欄位 | 含義 |
| --- | --- |
| `token` | 正在組裝的 `ResolvedToken`（類型先取 `raw.type ?? file.defaultType` 兜底） |
| `raw` / `ref` | 原始值與引用字串 |
| `ownType` | **葉子自身宣告的 type**，專門用於區分「葉子自己宣告的」與「檔案級預設的」 |

`ownType` 是三層類型優先順序的關鍵：ref 解析回來後，**只有 `ownType === undefined` 時**才沿用引用目標的類型。

## 第二段：ref 解析

內嵌函式 `resolveRef(path, chain): { value, type? }`：

1. `rawMap.get(path)` 不存在 → 拋 `引用的令牌不存在：<path>`
2. 目標本身也是 ref → 遞迴 `resolveRef(entry.ref, [...chain, path])`
3. `chain.includes(path)` → 拋 `检测到令牌引用环：a -> b -> a`
4. 到達字面值 → 傳回 `{ value, type }`

主迴圈對每個有 ref 的條目：

```ts
refMap.set(path, entry.ref)                    // 記錄引用關係
const resolved = resolveRef(entry.ref, [path])
entry.token.value = resolved.value             // 烘焙為字面值
entry.token.refChain = [entry.ref]             // 記錄引用鏈
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type             // 類型隨真源走
}
```

最後：

```ts
if (entry.token.type === undefined) {
  throw new Error(`令牌 ${path} 缺少类型（既无自身 type 也无文件级 $type）`)
}
assertTypedValue(entry.token.type, value)      // 語意校驗
```

結果按 path 字典序排序，同時建 `byPath` 索引。

## 第三段：暗色覆蓋

暗色檔案只宣告**需要覆蓋的鍵**。

**暗色命名空間視圖**：先把所有暗色檔案的 `flat` 再折疊一次成 `darkRawMap`（`path -> { value, ref }`）。

**內嵌函式 `resolveDarkRef(path, chain): TokenValue`**——暗色 ref 的就近解析：

| 情形 | 行為 |
| --- | --- |
| 目標在 `darkRawMap` 中且是 ref | 在**暗色命名空間內**沿鏈遞迴（暗色引用暗色才是同主題取值），同樣做環檢測 |
| 目標在 `darkRawMap` 中且是字面值 | 傳回暗色值 |
| 目標**不在** `darkRawMap` 中 | **回落到明色命名空間** `resolveRef(path, chain).value` |

**遍歷暗色條目**：

```ts
if (raw.ref) {
  // 目標必須在 byPath / rawMap / darkRawMap 任一中存在
  if (!byPath.has(raw.ref) && !rawMap.has(raw.ref) && !darkRawMap.has(raw.ref)) {
    throw new Error(`暗色令牌 ${path} 引用不存在：${raw.ref}`)
  }
  value = resolveDarkRef(raw.ref, [path])
  refMap.set(`dark:${path}`, raw.ref)    // 暗色鍵帶前綴
}
const type = raw.type ?? byPath.get(path)?.type
if (!type) { orphanDarkPaths.push(path); continue }   // 缺類型 → 跳過該鍵
assertTypedValue(type, value)
if (!byPath.has(path)) orphanDarkPaths.push(path)     // 孤兒 → 仍寫入覆蓋表
dark.set(path, value)
```

## 孤兒暗色路徑

兩類異常**不中斷 codegen**，只記入 `orphanDarkPaths` 交給 `pnpm verify:tokens` 報告：

- 暗色鍵**缺類型**（既無自身 type，明色集也無同名鍵可繼承）→ **跳過該鍵，不寫入覆蓋表**
- 暗色鍵在明色集**不存在**（孤兒）→ **仍寫入覆蓋表**，但報告出來

詳見 [暗色合併](../tokens/dark-mode)。

## 各端如何消費 `dark`

`dark` 是扁平的 `Map<path, TokenValue>`，各端 target 再各自決定如何發射（Kotlin / Swift / ArkTS 是獨立的 `LhDarkTokens` 命名空間，C 是同名巨集重定義）。詳見 [五個目標平台](./targets)。
