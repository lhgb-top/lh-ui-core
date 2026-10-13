---
title: "模板清单"
---

`codegen/templates/` 下共 **8 个 Handlebars 模板**，**没有注册任何自定义 helper**（只用内置的 `{{#each}}` 和三重花括号 `{{{ }}}`）。

## 模板 → 产物 → 数据字段

| 模板 | 渲染产物 | 数据字段 |
| --- | --- | --- |
| `android/LhTokens.kt.hbs` | `LhTokens.kt` **和** `LhDarkTokens.kt`（明暗共用） | `{ version, source, package, imports[], body }` |
| `ios/LhTokens.swift.hbs` | `LhTokens.swift` 和 `LhDarkTokens.swift` | `{ version, source, body }` |
| `ios/LhShadow.swift.hbs` | `LhShadow.swift`（静态模板，无 body 插槽） | `{ version, source }` |
| `harmony/LhTokens.ets.hbs` | `LhTokens.ets` 和 `LhDarkTokens.ets` | `{ version, source, body }` |
| `harmony/LhShadow.ets.hbs` | `LhShadow.ets`（静态模板） | `{ version, source }` |
| `windows/LhTokens.cs.hbs` | `LhTokens.cs` 和 `LhDarkTokens.cs` | `{ version, source, namespace, body }` |
| `windows/LhShadow.cs.hbs` | `LhShadow.cs`（静态模板） | `{ version, source, namespace }` |
| `windows/LhEasing.cs.hbs` | `LhEasing.cs`（静态模板） | `{ version, source, namespace }` |

## 统一头部横幅

所有模板顶部都有同款注释块：

```
// =====================================================================================
// 本文件由 @lh-ui/core 自动生成（构建期 codegen），请勿手改。
// 源：{{{source}}} @ v{{{version}}}
// 修改请编辑 lh-ui-core 仓的 tokens/*.json 后重新执行 pnpm codegen。
// =====================================================================================
```

这是 `dist/` 禁止手改（红线 6）的代码级声明。

## 明暗共用模板

**android / ios / harmony / windows 的明色与暗色产物共用同一个模板**，区别只在喂进去的 `body`（根 object / enum / class 名不同）。

## 静态模板（载体结构）

`ios/LhShadow.swift.hbs`、`harmony/LhShadow.ets.hbs`、`windows/LhShadow.cs.hbs`、`windows/LhEasing.cs.hbs` **没有 body 插槽**，内容完全静态：

```handlebars
{{!-- harmony/LhShadow.ets.hbs --}}
/// 投影令牌结构
export interface LhShadow {
  color: ResourceColor
  /** 模糊半径 */
  radius: number
  offsetX: number
  offsetY: number
}
```

因为 SwiftUI / ArkUI / WinUI 都没有「复合投影」或「贝塞尔」的直接对应类型，需要端侧载体；而 Android 的投影是平台 API，不需要额外文件。Windows 的两个载体都是 `readonly record struct`：

```handlebars
{{!-- windows/LhShadow.cs.hbs --}}
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
```

## 模板示例

```handlebars
{{!-- android/LhTokens.kt.hbs --}}
// 头部横幅…

package {{{package}}}

{{#each imports}}
{{{this}}}
{{/each}}

{{{body}}}
```

```handlebars
{{!-- windows/LhTokens.cs.hbs --}}
// 头部横幅…

namespace {{{namespace}}};

{{{body}}}
```

## 设计原则

- **薄模板**：只负责文件骨架（头部注释、package / namespace、守卫开合），逐令牌的字面量格式化全在 target 的 TS 里完成后以 `body` 喂给模板。详见 [渲染层](./render)。
- **`noEscape: true`**：模板含 `<` `>` `#` 等字符（`#ifndef`、`#define`、泛型尖括号），必须关闭 HTML 转义。
- **编译缓存**：`render.ts` 的 `loadTemplate` 缓存编译结果，避免重复编译。

## 如何新增一个模板

1. 在 `codegen/templates/<platform>/` 加 `.hbs` 文件
2. 在对应 target 里组装数据并调 `render('<platform>/<name>.hbs', data)`
3. 跑 `pnpm codegen` 看产物，跑 `pnpm test -- -u` 更新快照
