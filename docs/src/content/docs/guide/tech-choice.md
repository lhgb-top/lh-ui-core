---
title: "文档站技术选型"
---

本页记录 2026-10-12 对主流静态文档框架的一次调研结论，以及本仓文档站框架的最终决策。

## 决策记录

| 日期 | 决策 | 理由 |
| --- | --- | --- |
| 2026-10-12（调研日） | **采用 Astro Starlight，从 VitePress 迁移** | Starlight 默认零客户端 JS、框架无关，与本仓「运行时零 JS」哲学最贴近；三个数据驱动参考页改写为纯 Astro 组件后，彻底移除 vue / vitepress / vite 三个依赖；Node ≥22.12 门槛可接受 |
| 2026-10-12（调研日，前置判断） | 维持 VitePress | 当时迁移收益覆盖不了成本——家族七站均在 VitePress 上，且本仓文档站已完整落地。**此结论已被同日的迁移决策取代，保留在下文作为历史记录** |

迁移本身是一次性完成的（单次提交内建好 Astro 骨架并搬完全部页面，避免中间态不可构建）。家族其余各站仍用 VitePress，**本仓不要求家族统一**；若未来家族层面统一框架，本仓的 Starlight 实践就是现成参照。

## 调研结论（历史记录，基于 2026-10-12 数据）

- **如果今天从零开始、且没有家族一致性约束**，最强替代是 **Astro Starlight**——性能、框架无关、默认零客户端 JS，与本仓「运行时零 JS」的哲学最贴近。（此判断最终促成了上面的迁移决策。）
- **VuePress 已实质性停滞，不建议任何新项目采用**（仓库最近一次推送停留在 2024-08-07，v2 至今仍是 rc）。
- 迁移前唯一值得长期观察的是 **VitePress 2.0**（当时 `next` 标签为 2.0.0-alpha.20，alpha 阶段）。

## 活跃度数据

> 数据采集日：2026-10-12。GitHub 数据来自 api.github.com，npm 下载量为 2026-10-04 ~ 10-10 周统计，版本号来自 registry.npmjs.org dist-tags。star 数会随时间增长，引用时请注意新鲜度。

| 框架 | 技术栈 | GitHub Stars | 仓库最近推送 | npm 周下载 | 最新稳定版 |
| --- | --- | --- | --- | --- | --- |
| **VitePress** | Vue 3 + Vite | 18.4k | 2026-10-11 | 1,305,159 | 1.6.4（next: 2.0.0-alpha.20） |
| **Docusaurus** | React + MDX | 66.5k | 2026-10-10 | 1,504,459 | 3.10.2 |
| **Astro Starlight** | Astro（框架无关） | 9.4k | 2026-10-09 | 1,431,284（astro 本体 7.22M） | astro 7.3.8 / starlight 0.42.6 |
| **docsify** | 运行时 JS 渲染 | 31.5k | 2026-10-11 | 80,727 | 5.0.0 |
| **Nextra** | Next.js + React | 13.9k | 2026-07-31 | 238,757 | 4.6.1 |
| **Fumadocs** | Next.js + React | 13.3k | 2026-10-09 | — | — |
| **MkDocs Material** | Python | 27.6k | 2026-10-02 | PyPI，不适用 | — |
| **Sphinx** | Python / RST | 8.1k | 2026-10-05 | PyPI，不适用 | — |
| **VuePress** | Vue + Webpack | 22.7k | ⚠️ **2024-08-07** | 71,177 | 1.9.10（v2 卡在 2.0.0-rc.31） |
| **Dumi** | Umi + React | 3.8k | 2026-09-14 | 20,163 | 2.4.50 |
| **Rspress** | Rspack + React | 2.3k | 2026-10-10 | 19,631 | 1.47.2（2.0 beta.21） |

关键读数：VitePress 与 Docusaurus 是唯二月下载过百万的一线选手；Starlight 借 Astro 本体（722 万）顺势而起，是第三极；VuePress 虽有 2.3 万 star，但仓库已两年多无提交，**已被 VitePress 事实取代**。

## 分梯队优缺点

### 第一梯队：VitePress / Docusaurus / Astro Starlight

**VitePress**（本仓迁移前在用；家族其余各站仍在用）

- 优点：Vue 单文件组件可直接写进 markdown（本仓令牌参考 / 组件契约 / 黄金用例三个参考页正是靠这个）；**构建期数据加载器**（`*.data.ts`）天然适合读 JSON 真源，dev 时配 `watch` glob 还能热更新；Vite dev 极快；默认主题开箱即用、几乎零配置；中文社区与资料丰富。
- 缺点：MDX 支持弱（不是 MDX 生态）；版本化文档、i18n 等企业级能力需要自己搭或找插件；主题定制深度不如 Docusaurus；搜索为本地索引，大站点效果一般。

**Docusaurus**（Meta 出品，生态最大）

- 优点：**版本化文档插件**（多版本文档共存）与 **i18n** 是所有框架里最成熟的；MDX 生态、插件体系、主题注入（swizzle）完善；背靠 Meta，长期维护有保障。
- 缺点：React 全家桶依赖重、构建产物 JS 体积大；配置项多、心智负担高；它的数据管线（`loadContent` 生命周期）对接 JSON 真源比 VitePress 的 loader 更绕；家族无先例。

**Astro Starlight**（框架无关，性能标杆；**本仓现用**）

- 优点：**默认零客户端 JS**，与本仓「运行时零 JS」的哲学最契合；内容集合（Content Collections）给到类型安全的数据层；可在 Vue / React / Svelte 里混用组件；构建产物最轻；Starlight 主题的文档体验极佳（侧边栏、锚点导航、i18n 内置）。
- 缺点：Starlight 仍是 0.x（0.42.6），API 可能有 breaking change；内容集合面向**文件型内容**（md / mdx），读 `tokens/*.json` 这类外部 JSON 需要绕过集合、在 `.astro` 页面里直接引入（本仓已用 frontmatter 直调 codegen 模块解决）；家族无先例，部署 / nginx / 侧边栏约定要单独趟一遍（**本仓已趟完，见 [部署说明](../deployment)**）。

### 第二梯队：Nextra / Rspress / Fumadocs / Dumi

- **Nextra**：Next.js 生态、MDX 强、文档美观；但强绑 Next.js + React，部署模型（SSG / SSR / Edge）与家族 nginx 静态托管不同，v4 的内容目录约定与 VitePress 差异大。无迁移动机。
- **Rspress**（字节 web-infra-dev 出品）：**构建速度最快**（Rspack），数千页的大文档站明显优于 VitePress；中文维护者社区友好。但生态 / 插件最少（周下载 2 万），数据加载器无标准范式——本仓只有 30 多页，为速度付出的学习成本用不上。
- **Fumadocs**：近两年增速最猛的新秀（13.3k star、仅 2 个 issue 开着），Next.js + 现代设计系统，搜索 / 视图切换体验好。同样强绑 Next.js，且国内文档资料少。值得收藏，不建议现在引入。
- **Dumi**：为**组件库演示**（live demo、属性表自动生成）而生。本仓是构建期令牌仓，**没有任何运行时 UI 可演示**，核心卖点完全用不上，且强绑 Umi / React。明确排除。

### 第三梯队与特殊项

- **MkDocs Material / Sphinx**（Python 系）：文档质量极高，但要求 Python 工具链，与本仓 Node ≥20 + pnpm + TS 工具链**不在一个生态**，无法复用 codegen 的 TS 类型与加载函数。排除。
- **docsify**（运行时渲染）：无构建期、CDN 拉取即用，适合「单页极速上线」的小文档。但它**不在构建期生成 HTML**（SEO 弱、首屏慢），也无法跑构建期数据加载器做 schema 校验（本仓参考页正是依赖这一能力）。排除。

## 逐条对照本仓约束

| 本仓约束 / 需求 | VitePress | Docusaurus | Starlight | 其它 |
| --- | --- | --- | --- | --- |
| 家族七站同体系（nginx 前缀 / 侧边栏 / 部署） | ✅ 家族其余站在用 | ❌ 需重趟 | ✅ 本仓已趟通（nginx 三条契约继续适用，见 [部署说明](../deployment)） | ❌ |
| 构建期读 JSON 真源渲染参考页 | ✅ 原生 loader，已实现 | ⚠️ 需自定义插件 | ✅ 已实现（`.astro` 页面 frontmatter 直调 codegen 的 load / resolve） | ⚠️ 更折腾 |
| 单中文、无 i18n 需求 | ✅ | 优势用不上 | ✅ | — |
| 无交互演示的 prose + 表格 + 代码 | ✅ | ✅ | ✅ | ✅ |
| 「运行时零 JS」气质 | ⚠️ 有运行时 JS（仅限站点，非红线范围） | ❌ JS 重 | ✅ 默认零 JS | — |
| 复用 codegen TS 模块（类型 / 校验） | ✅ 已验证（vite ^5.4.21 起 SSR 支持 `import.meta.dirname`） | ✅ | ✅ 已验证（astro 7 内置 vite 8，SSR 支持 `import.meta.dirname`） | ✅ |

补充两点判断依据：

- 「运行时零 JS」红线管的是 **codegen 的 `dist/` 产物**，不是文档站。文档站本身跑框架运行时不违反任何红线——它与 `dist/` 完全隔离，且构建产物入 `.gitignore`。不过迁移到 Starlight 后，站点本身也变成了默认零客户端 JS（仅搜索 / 主题切换等少量交互按需加载），与红线的精神更一致。
- Docusaurus 的版本化文档与 i18n 优势在本仓**用不上**：本仓单中文、单版本、内容跟着 codegen 走，不存在「旧版令牌文档共存」的场景。

## 后续观察项

1. **Starlight 1.0**：本仓当前锁定 `^0.42.6`。0.x 阶段仍可能有 breaking change，1.0 正式版发布后评估升级路径（Starlight 的迁移指南会列明变更点）。
2. **VitePress 2.0**：进入 beta 后评估。家族其余各站仍在 VitePress 上，主要看点是构建性能与对 Vite 7 的跟进。
3. **触发重选的信号**：Starlight 长期无维护、或家族层面决定统一文档框架（届时本仓的 Starlight 实践就是现成参照）。
