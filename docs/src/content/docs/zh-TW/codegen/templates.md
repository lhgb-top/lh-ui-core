---
title: "模板清單"
---

`codegen/templates/` 下共 **8 個 Handlebars 模板**，**沒有註冊任何自訂 helper**（只用內建的 `{{#each}}` 和三重花括號 `{{{ }}}`）。

## 模板 → 產物 → 資料欄位

| 模板 | 渲染產物 | 資料欄位 |
| --- | --- | --- |
| `android/LhTokens.kt.hbs` | `LhTokens.kt` **和** `LhDarkTokens.kt`（明暗共用） | `{ version, source, package, imports[], body }` |
| `ios/LhTokens.swift.hbs` | `LhTokens.swift` 和 `LhDarkTokens.swift` | `{ version, source, body }` |
| `ios/LhShadow.swift.hbs` | `LhShadow.swift`（靜態模板，無 body 插槽） | `{ version, source }` |
| `harmony/LhTokens.ets.hbs` | `LhTokens.ets` 和 `LhDarkTokens.ets` | `{ version, source, body }` |
| `harmony/LhShadow.ets.hbs` | `LhShadow.ets`（靜態模板） | `{ version, source }` |
| `windows/LhTokens.cs.hbs` | `LhTokens.cs` 和 `LhDarkTokens.cs` | `{ version, source, namespace, body }` |
| `windows/LhShadow.cs.hbs` | `LhShadow.cs`（靜態模板） | `{ version, source, namespace }` |
| `windows/LhEasing.cs.hbs` | `LhEasing.cs`（靜態模板） | `{ version, source, namespace }` |

## 統一頭部橫幅

所有模板頂部都有同款註解區塊：

```
// =====================================================================================
// 本檔案由 @lh-ui/core 自動生成（構建期 codegen），請勿手改。
// 源：{{{source}}} @ v{{{version}}}
// 修改請編輯 lh-ui-core 倉的 tokens/*.json 後重新執行 pnpm codegen。
// =====================================================================================
```

這是 `dist/` 禁止手改（紅線 6）的程式碼級宣告。

## 明暗共用模板

**android / ios / harmony / windows 的明色與暗色產物共用同一個模板**，區別只在餵進去的 `body`（根 object / enum / class 名不同）。

## 靜態模板（載體結構）

`ios/LhShadow.swift.hbs`、`harmony/LhShadow.ets.hbs`、`windows/LhShadow.cs.hbs`、`windows/LhEasing.cs.hbs` **沒有 body 插槽**，內容完全靜態：

```handlebars
{{!-- harmony/LhShadow.ets.hbs --}}
/// 投影令牌結構
export interface LhShadow {
  color: ResourceColor
  /** 模糊半徑 */
  radius: number
  offsetX: number
  offsetY: number
}
```

因為 SwiftUI / ArkUI / WinUI 都沒有「複合投影」或「貝茲」的直接對應類型，需要端側載體；而 Android 的投影是平台 API，不需要額外檔案。Windows 的兩個載體都是 `readonly record struct`：

```handlebars
{{!-- windows/LhShadow.cs.hbs --}}
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
```

## 模板範例

```handlebars
{{!-- android/LhTokens.kt.hbs --}}
// 頭部橫幅…

package {{{package}}}

{{#each imports}}
{{{this}}}
{{/each}}

{{{body}}}
```

```handlebars
{{!-- windows/LhTokens.cs.hbs --}}
// 頭部橫幅…

namespace {{{namespace}}};

{{{body}}}
```

## 設計原則

- **薄模板**：只負責檔案骨架（頭部註解、package / namespace、守衛開合），逐令牌的字面值格式化全在 target 的 TS 裡完成後以 `body` 餵給模板。詳見 [渲染層](./render)。
- **`noEscape: true`**：模板含 `<` `>` `#` 等字元（`#ifndef`、`#define`、泛型角括號），必須關閉 HTML 轉義。
- **編譯快取**：`render.ts` 的 `loadTemplate` 快取編譯結果，避免重複編譯。

## 如何新增一個模板

1. 在 `codegen/templates/<platform>/` 加 `.hbs` 檔案
2. 在對應 target 裡組裝資料並呼叫 `render('<platform>/<name>.hbs', data)`
3. 跑 `pnpm codegen` 看產物，跑 `pnpm test -- -u` 更新快照
