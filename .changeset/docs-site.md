---
'@lh-ui/core': minor
---

新增开发者文档站（Astro Starlight，部署前缀 /lhui/core/、dev 端口 5185）：

- 内容区六个前缀：guide（介绍 / 目录结构 / 快速开始 / 红线与命名规范 / 新增组件流程 / 本地联动 / 命令清单 / 文档站技术选型）、tokens（令牌格式 / 命名空间 / 类型系统 / 引用机制 / 暗色合并）、specs（契约格式）、cases（用例格式）、codegen（管线总览 + load / resolve / format / tree / render / targets / templates / types 逐模块逐函数）、artifacts（android / ios / harmony / c / docs 五端产物约定）。
- 令牌参考、组件契约参考、黄金用例参考三个页面是 docs/src/pages/ 下的 Astro 页面，构建期直接调 codegen 的 loadTokenFiles / resolveTokens / loadSpecs / loadCases 读 JSON 真源渲染，与源同步且构建期即做 schema 校验。
- 顺带完成一轮文档↔源码一致性核对（30 处不一致全部修复）：修正令牌 / 暗色 / 契约 / 产物文档里的过时数字与示例值，prose 页一律去数字化；补齐 types.ts 全部导出类型的文档页与若干漏列的 target 内部函数；库代码侧删除零调用的 toNormalizedRgb 导出、SpecProp 类型补齐 array、specs schema 的 props 加 minItems、verify-specs 补 tokenRef 路径存在性检查。
- color-dark.json 裁成真正的增量差异键（只保留与明色不同的键），与「增量覆盖」的设计机制一致。
- package.json 加 docs:dev / docs:build / docs:preview 脚本与 astro / @astrojs/starlight / @astrojs/check 开发依赖（移除 vitepress / vite / vue），engines 上调到 Node ≥22.12（Astro 7 要求）；.gitignore 与 eslint 忽略 docs/dist 与 docs/.astro。
- 文档站属构建期工具链，不违反「运行时零 JS」红线（该红线约束的是 dist/ 产物）。
