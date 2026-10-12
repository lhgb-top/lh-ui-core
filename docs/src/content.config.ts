// =====================================================================================
// Starlight 内容集合定义。
//
// Starlight 0.33 起不再自动注入集合：本文件把 docs/src/content/docs 下的 .md / .mdx
// 注册为 docs 集合，schema 用 Starlight 的 docsSchema()（含 title、hero、sidebar 等
// Starlight 专属 frontmatter 字段）。侧边栏里的 slug 就是文件相对该目录的无后缀路径。
//
// 界面文案走 Starlight 内置的 zh-CN 翻译（astro.config.mjs 里用 root locale 声明），
// i18n 集合因此保持为空（目录里只有一个 README 占位）；要覆盖内置翻译时把翻译 JSON
// 放进 src/content/i18n/ 即可。
//
// 路径相对站点根（docs/）解析。
// =====================================================================================

import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
    schema: docsSchema(),
  }),
  i18n: defineCollection({
    loader: glob({ pattern: '**/index.json', base: './src/content/i18n' }),
    schema: i18nSchema(),
  }),
}
