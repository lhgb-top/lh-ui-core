---
title: "解析层 resolve.ts"
---

> 引用解析与暗色合并。

`resolveTokens(files: LoadedTokenFile[]): ResolveResult` 是核心函数，三段式：

## 返回值

```ts
interface ResolveResult {
  tokenSet: TokenSet                    // 明色令牌集 + 暗色覆盖表
  orphanDarkPaths: string[]             // 孤儿暗色路径（verify 报告用）
  refMap: Map<string, string>           // path -> 原始 ref 串（暗色键带 dark: 前缀）
}
```

## 第一段：明色折叠

把所有非暗色文件的 `flat` 合并为单一 `rawMap`：

```ts
if (rawMap.has(path)) throw new Error(`令牌路径重复定义：${path}（文件 ${file.fileName}）`)
```

每条记录带三个值：

| 字段 | 含义 |
| --- | --- |
| `token` | 正在组装的 `ResolvedToken`（类型先取 `raw.type ?? file.defaultType` 兜底） |
| `raw` / `ref` | 原始值与引用串 |
| `ownType` | **叶子自身声明的 type**，专门用于区分「叶子自己声明的」与「文件级默认的」 |

`ownType` 是三层类型优先级的关键：ref 解析回来后，**只有 `ownType === undefined` 时**才沿用引用目标的类型。

## 第二段：ref 解析

内联函数 `resolveRef(path, chain): { value, type? }`：

1. `rawMap.get(path)` 不存在 → 抛 `引用的令牌不存在：<path>`
2. 目标本身也是 ref → 递归 `resolveRef(entry.ref, [...chain, path])`
3. `chain.includes(path)` → 抛 `检测到令牌引用环：a -> b -> a`
4. 到达字面值 → 返回 `{ value, type }`

主循环对每个有 ref 的条目：

```ts
refMap.set(path, entry.ref)                    // 记录引用关系
const resolved = resolveRef(entry.ref, [path])
entry.token.value = resolved.value             // 烘焙为字面值
entry.token.refChain = [entry.ref]             // 记录引用链
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type             // 类型随真源走
}
```

最后：

```ts
if (entry.token.type === undefined) {
  throw new Error(`令牌 ${path} 缺少类型（既无自身 type 也无文件级 $type）`)
}
assertTypedValue(entry.token.type, value)      // 语义校验
```

结果按 path 字典序排序，同时建 `byPath` 索引。

## 第三段：暗色覆盖

暗色文件只声明**需要覆盖的键**。

**暗色命名空间视图**：先把所有暗色文件的 `flat` 再折叠一次成 `darkRawMap`（`path -> { value, ref }`）。

**内联函数 `resolveDarkRef(path, chain): TokenValue`**——暗色 ref 的就近解析：

| 情形 | 行为 |
| --- | --- |
| 目标在 `darkRawMap` 中且是 ref | 在**暗色命名空间内**沿链递归（暗色引用暗色才是同主题取值），同样做环检测 |
| 目标在 `darkRawMap` 中且是字面值 | 返回暗色值 |
| 目标**不在** `darkRawMap` 中 | **回落到明色命名空间** `resolveRef(path, chain).value` |

**遍历暗色条目**：

```ts
if (raw.ref) {
  // 目标必须在 byPath / rawMap / darkRawMap 任一中存在
  if (!byPath.has(raw.ref) && !rawMap.has(raw.ref) && !darkRawMap.has(raw.ref)) {
    throw new Error(`暗色令牌 ${path} 引用不存在：${raw.ref}`)
  }
  value = resolveDarkRef(raw.ref, [path])
  refMap.set(`dark:${path}`, raw.ref)    // 暗色键带前缀
}
const type = raw.type ?? byPath.get(path)?.type
if (!type) { orphanDarkPaths.push(path); continue }   // 缺类型 → 跳过该键
assertTypedValue(type, value)
if (!byPath.has(path)) orphanDarkPaths.push(path)     // 孤儿 → 仍写入覆盖表
dark.set(path, value)
```

## 孤儿暗色路径

两类异常**不中断 codegen**，只记入 `orphanDarkPaths` 交给 `pnpm verify:tokens` 报告：

- 暗色键**缺类型**（既无自身 type，明色集也无同名键可继承）→ **跳过该键，不写入覆盖表**
- 暗色键在明色集**不存在**（孤儿）→ **仍写入覆盖表**，但报告出来

详见 [暗色合并](../tokens/dark-mode)。

## 各端如何消费 `dark`

`dark` 是扁平的 `Map<path, TokenValue>`，各端 target 再各自决定如何发射（Kotlin / Swift / ArkTS 是独立的 `LhDarkTokens` 命名空间，C 是同名宏重定义）。详见 [五个 target](./targets)。
