---
title: "类型系统"
---

## 七种类型

`type` 与文件级 `$type` 只允许：`color` / `dimension` / `number` / `string` / `shadow` / `duration` / `cubicBezier`（与 `tokens/schema.json` 的枚举一一对应，见 `codegen/src/types.ts` 的 `TokenType`）。

每种类型的值的合法形态见 [令牌格式](./token-format)。

## 三层类型优先级

一个叶子的类型按如下顺序求值：

```
1. 叶子自身声明的 type
2. ref 引用目标的类型（仅当叶子未声明自身 type）
3. 文件级 / 分组级 $type
4. 都没有 → resolve 阶段抛错
```

这个优先级由 **flatten 与 resolve 两个阶段协作**实现。

### 阶段一：flatten（分组级 `$type` 下沉）

`load.ts` 的 `flatten` 把分组（含文件根）声明的 `$type` 沿树向下传递，但**只烤进字面量叶子**：

```ts
// 字面量令牌继承分组类型；ref 令牌保留 undefined，交给 resolve 向引用目标取类型
if (node.type === undefined && node.ref === undefined && groupType !== undefined) {
  out.set(path, { ...node, type: groupType })
}
```

**ref 叶子刻意不烤**——避免被所在文件的默认类型误导。

### 阶段二：resolve（ref 目标类型覆盖文件级默认）

`resolve.ts` 组装明色映射时：

```ts
token: {
  type: raw.type ?? (file.defaultType as ResolvedToken['type']),  // 先吃文件级 $type 兜底
  ...
},
ownType: raw.type,  // 专用于区分「叶子自己声明的类型」与「文件级默认」
```

ref 解析回来后：

```ts
// 自身未声明类型时，沿用引用目标的类型（令牌类型随真源走）
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type
}
```

这一步把**第 2 层（ref 目标类型）覆盖到第 3 层（文件级 `$type`）之上**。最后若类型仍为 undefined，抛 `令牌 X 缺少类型`。

## 为什么需要三层

典型例子：`button.fontWeight` 引用 `typography.fontWeight.primary`：

```json
// components.json（文件级 $type: dimension）
"button": { "fontWeight": { "ref": "typography.fontWeight.primary" } }

// typography.json
"fontWeight": { "primary": { "value": 400, "type": "number" } }
```

如果 ref 叶子也吃文件级 `dimension`，`button.fontWeight` 的类型就错了。三层优先级保证它**随引用目标取 `number`**。

再如 `typography.json` 没有文件级 `$type`，靠分组级 `$type`（`fontSize` 组标 `dimension`）和叶子自带 `type`（`fontWeight.primary` 自带 `number`）各管各的。

## 语义校验

schema 只管结构。**类型与值是否匹配**由 `format.ts` 的 `assertTypedValue` 在 resolve 阶段逐一断言并实际解析值：

- `color` → 必须能被 `parseColor` 解析（十六进制或 rgba）
- `dimension` → 匹配 `/^\d+(\.\d+)?(px|%)$/`
- `duration` → 支持 `s` / `ms`
- `shadow` → 按空格切分，第 4 段若匹配 `-?\d+(\.\d+)?px` 则是 spread 否则是颜色
- `cubicBezier` → 四元数组

详见 [格式化层](../codegen/format)。

## 暗色侧的类型推断

暗色覆盖键的类型推断更简单：`raw.type ?? byPath.get(path)?.type`。类型缺失的暗色键不会让 codegen 失败，而是被记入 `orphanDarkPaths`，由 `pnpm verify:tokens` 报告。详见 [暗色合并](./dark-mode)。
