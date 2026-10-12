// =====================================================================================
// lh-ui-core 开发者文档站（Astro Starlight）。
//
// 家族约定：部署前缀 /lhui/core/（与 android / ios / harmony / c 四站同体系），
// dev 端口 5185。base / sitemap / favicon 均由 Starlight 从 site + base 推导。
//
// 关键约定说明：
// - 站点根是 docs/：npm 脚本一律 `astro <cmd> --root docs`，本文件、src/、public/
//   都相对它解析。不传 --root 时 astro 会退回仓根，既找不到 src/pages，还会把产物
//   写进仓根 dist/——那是 codegen 令牌产物的目录（AGENTS.md 红线 6：dist/ 禁止手改），
//   而构建前的清空动作会直接删掉整个令牌包。
// - build.format: 'file' + starlight({ trailingSlash: 'never' })：产出 page.html 而非
//   page/index.html，与家族 nginx 的 `try_files $uri $uri.html $uri/` 契约同构
//   （VitePress 时代开 cleanUrls 的产出形态完全一致，部署侧零改动）。
// - outDir 显式指向 docs/dist（相对站点根）：Astro 默认输出 root/dist，与 codegen 的
//   仓根 dist/ 同名但站点根不同，实际落在 docs/dist，两者互不覆盖。
// - 侧边栏显式配置而非 autogenerate：后者按字母排序，无法保证「介绍」在分组最前。
// =====================================================================================

import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://www.lhgb.top',
  base: '/lhui/core/',
  output: 'static',
  build: { format: 'file' },
  // Starlight 0.33 起由 Astro 顶层配置接管，不再写在 starlight() 里
  trailingSlash: 'never',
  outDir: 'dist',
  integrations: [
    starlight({
      title: 'lh-ui-core',
      description:
        'lh-ui 原生血脉构建期中心 —— 设计令牌真源 + 组件契约 + 黄金用例 + 跨端 codegen',
      // 单语言非英文站必须把语言设为 root locale：Starlight 的 transform 在单语言分支里
      // 会忽略 defaultLocale，只接受 locales.root。写成 root 可让内置 zh-CN 翻译接管
      // 界面文案（搜索 / 上一页 / 编辑此页等），内容文件仍直接放 src/content/docs/ 根
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      logo: { src: './src/assets/logo.svg', alt: 'lh-ui-core' },
      favicon: '/favicon.svg',
      lastUpdated: true,
      // 站内搜索由 Pagefind 提供，默认开启；这里显式声明便于日后关闭或调参
      pagefind: true,
      customCss: ['./src/styles/custom.css'],
      // Starlight 0.33 起 social 改为链接数组，不再是按平台命名的对象
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/lhgb/lh-ui' }],
      sidebar: [
        {
          label: '指南',
          items: [
            { label: '介绍', slug: 'guide/introduction' },
            { label: '目录结构', slug: 'guide/structure' },
            { label: '快速开始', slug: 'guide/quickstart' },
            { label: '红线与命名规范', slug: 'guide/redlines' },
            { label: '新增组件流程', slug: 'guide/new-component' },
            { label: '本地联动', slug: 'guide/local-linking' },
            { label: '命令清单', slug: 'guide/commands' },
            { label: '文档站技术选型', slug: 'guide/tech-choice' },
          ],
        },
        {
          label: '令牌',
          items: [
            { label: '令牌格式', slug: 'tokens/token-format' },
            { label: '命名空间与点路径', slug: 'tokens/namespace' },
            { label: '类型系统', slug: 'tokens/type-system' },
            { label: '引用机制', slug: 'tokens/refs' },
            { label: '暗色合并', slug: 'tokens/dark-mode' },
            // 参考页是 src/pages 下的 .astro（数据驱动），用 link 而非 slug 挂入
            { label: '令牌参考', link: '/tokens/reference' },
          ],
        },
        {
          label: '契约',
          items: [
            { label: '契约格式', slug: 'specs/spec-format' },
            { label: '组件契约参考', link: '/specs/reference' },
          ],
        },
        {
          label: '用例',
          items: [
            { label: '用例格式', slug: 'cases/case-format' },
            { label: '黄金用例参考', link: '/cases/reference' },
          ],
        },
        {
          label: '工具链',
          items: [
            { label: '管线总览', slug: 'codegen/pipeline' },
            { label: '装载层 load.ts', slug: 'codegen/load' },
            { label: '解析层 resolve.ts', slug: 'codegen/resolve' },
            { label: '格式化层 format.ts', slug: 'codegen/format' },
            { label: '构树层 tree.ts', slug: 'codegen/tree' },
            { label: '渲染层 render.ts', slug: 'codegen/render' },
            { label: '五个 target', slug: 'codegen/targets' },
            { label: '模板清单', slug: 'codegen/templates' },
            { label: '类型定义 types.ts', slug: 'codegen/types' },
          ],
        },
        {
          label: '产物',
          items: [
            { label: 'Android 产物', slug: 'artifacts/android' },
            { label: 'iOS 产物', slug: 'artifacts/ios' },
            { label: '鸿蒙产物', slug: 'artifacts/harmony' },
            { label: 'C 产物', slug: 'artifacts/c' },
            { label: 'docs 产物', slug: 'artifacts/docs-output' },
          ],
        },
      ],
    }),
  ],
})
