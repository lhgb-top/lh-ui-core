---
title: "類型系統"
---

## 七種類型

`type` 與檔案級 `$type` 只允許：`color` / `dimension` / `number` / `string` / `shadow` / `duration` / `cubicBezier`（與 `tokens/schema.json` 的列舉一一對應，見 `codegen/src/types.ts` 的 `TokenType`）。

每種類型的值的合法形態見 [令牌格式](./token-format)。

## 三層類型優先順序

一個葉子的類型按如下順序求值：

```
1. 葉子自身宣告的 type
2. ref 引用目標的類型（僅當葉子未宣告自身 type）
3. 檔案級 / 分組級 $type
4. 都沒有 → resolve 階段拋錯
```

這個優先順序由 **flatten 與 resolve 兩個階段協作**實作。

### 階段一：flatten（分組級 `$type` 下沉）

`load.ts` 的 `flatten` 把分組（含檔案根）宣告的 `$type` 沿樹向下傳遞，但**只烤進字面值葉子**：

```ts
// 字面值令牌繼承分組類型；ref 令牌保留 undefined，交給 resolve 向引用目標取類型
if (node.type === undefined && node.ref === undefined && groupType !== undefined) {
  out.set(path, { ...node, type: groupType })
}
```

**ref 葉子刻意不烤**——避免被所在檔案的預設類型誤導。

### 階段二：resolve（ref 目標類型覆蓋檔案級預設）

`resolve.ts` 組裝明色映射時：

```ts
token: {
  type: raw.type ?? (file.defaultType as ResolvedToken['type']),  // 先吃檔案級 $type 兜底
  ...
},
ownType: raw.type,  // 專用於區分「葉子自己宣告的類型」與「檔案級預設」
```

ref 解析回來後：

```ts
// 自身未宣告類型時，沿用引用目標的類型（令牌類型隨真源走）
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type
}
```

這一步把**第 2 層（ref 目標類型）覆蓋到第 3 層（檔案級 `$type`）之上**。最後若類型仍為 undefined，拋 `令牌 X 缺少類型`。

## 為什麼需要三層

典型例子：`button.fontWeight` 引用 `typography.fontWeight.primary`：

```json
// components.json（檔案級 $type: dimension）
"button": { "fontWeight": { "ref": "typography.fontWeight.primary" } }

// typography.json
"fontWeight": { "primary": { "value": 400, "type": "number" } }
```

如果 ref 葉子也吃檔案級 `dimension`，`button.fontWeight` 的類型就錯了。三層優先順序保證它**隨引用目標取 `number`**。

又如 `typography.json` 沒有檔案級 `$type`，靠分組級 `$type`（`fontSize` 組標 `dimension`）和葉子自帶 `type`（`fontWeight.primary` 自帶 `number`）各管各的。

## 語意校驗

schema 只管結構。**類型與值是否匹配**由 `format.ts` 的 `assertTypedValue` 在 resolve 階段逐一斷言並實際解析值：

- `color` → 必須能被 `parseColor` 解析（十六進位或 rgba）
- `dimension` → 匹配 `/^\d+(\.\d+)?(px|%)$/`
- `duration` → 支援 `s` / `ms`
- `shadow` → 按空格切分，第 4 段若匹配 `-?\d+(\.\d+)?px` 則是 spread 否則是顏色
- `cubicBezier` → 四元陣列

詳見 [格式化層](../codegen/format)。

## 暗色側的類型推斷

暗色覆蓋鍵的類型推斷更簡單：`raw.type ?? byPath.get(path)?.type`。類型缺失的暗色鍵不會讓 codegen 失敗，而是被記入 `orphanDarkPaths`，由 `pnpm verify:tokens` 報告。詳見 [暗色合併](./dark-mode)。
