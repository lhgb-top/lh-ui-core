---
title: "docs 产物"
---

**路径**：`dist/docs/`

这是 codegen 的第五个 target（`docsTarget`），也是**唯一不用 handlebars 模板**的 target——直接用代码拼字符串。

## 三个产物

### `tokens.md` —— 令牌速查表

按**顶级命名空间**分 `##` 小节（button / cell / checkbox / color / dialog / icon / input / loading / motion / navbar / picker / radio / radius / shadow / spacing / switch / tag / textarea / toast / typography / zIndex），每节一张五列表格：

```markdown
## button

| 令牌 | 类型 | 明色 | 暗色 | 说明 |
| --- | --- | --- | --- | --- |
| `button.borderRadius` | dimension | 2px | — | 按钮圆角跟随全局圆角 |
| `button.height.medium` | dimension | 40px | — | 原生新增；中号按钮高度（默认） |
| `color.primary.default` | color | #2B4C7C → #2b4c7c | #3D649E → #3d649e | 主色（靛蓝 — 青花瓷之蓝） |
```

特点：

- 令牌列是**全点路径**
- 颜色列显示「原始值 → 规范化小写」两份
- `nativeOnly` 项在说明列标注「原生新增」
- 暗色列无覆盖时填 `—`（当前暗色只覆盖 `color.*`）

### `tokens.light.json` —— 明色平铺快照

```json
{
  "button.borderRadius": "2px",
  "button.fontWeight": 400,
  "button.height.medium": "40px",
  "color.primary.default": "#2B4C7C"
}
```

`{ path -> 烘焙后的值 }` 的扁平映射，供机器消费。

### `tokens.dark.json` —— 暗色覆盖表

```json
{
  "color.focus": "#7FA6D9",
  "color.selected": "#B1C1D8",
  …
}
```

只含**被覆盖的键**（全部是 `color.*`，精确条数随版本变化），按 path 排序。

## 消费方

| 消费方 | 用什么 |
| --- | --- |
| **本文档站** | 不直接消费 `dist/docs/`——[令牌参考](../tokens/reference) 页由 `.astro` 页面走**同一套** `loadTokenFiles` + `resolveTokens` 管线实时渲染，与源同步 |
| 家族文档站 | 嵌入 `tokens.md` 作为令牌速查 |
| 各端对齐 | `tokens.light.json` / `tokens.dark.json` 做构建期比对 |
| 基线文档过滤 | `nativeOnly` 标注用于「原生新增令牌」清单 |

## 头部守卫

`tokens.md` 开头：

```html
<!-- 本文件由 @lh-ui/core 自动生成，请勿手改。源：@lh-ui/core tokens -->
```

与各端产物的「请勿手改」横幅同理（红线 6）。

## 与文档站参考页的区别

| | `dist/docs/tokens.md` | 文档站令牌参考页 |
| --- | --- | --- |
| 生成时机 | `pnpm codegen` | `pnpm docs:build` / `docs:dev` |
| 数据源 | codegen 内存中的 `tokenSet` | `.astro` 页面 frontmatter 重跑 `loadTokenFiles` + `resolveTokens` |
| 形态 | 静态 markdown 表格 | 可交互 Astro 表格（过滤、色块预览） |
| 位置 | `dist/`（gitignore，不入库） | 站点页面（构建产物在 `docs/dist/`） |

两者**走同一套解析管线**，所以值永远一致；区别只在呈现形态与构建入口。
