/**
 * handlebars 模板渲染封装。
 *
 * 模板只负责文件骨架（头部注释、import、命名空间开合），逐令牌的字面量格式化
 * 全部在 target 的 TS 里完成后再喂给模板，保证模板足够薄、可读。
 */

import { readFileSync } from 'node:fs'
import { resolve as resolvePath } from 'node:path'
import Handlebars from 'handlebars'

const TEMPLATES_DIR = resolvePath(import.meta.dirname, '..', 'templates')

const cache = new Map<string, HandlebarsTemplateDelegate>()

function loadTemplate(name: string): HandlebarsTemplateDelegate {
  const cached = cache.get(name)
  if (cached) return cached
  const filePath = resolvePath(TEMPLATES_DIR, name)
  const source = readFileSync(filePath, 'utf-8')
  const compiled = Handlebars.compile(source, { noEscape: true })
  cache.set(name, compiled)
  return compiled
}

export function render<T>(templateName: string, data: T): string {
  return loadTemplate(templateName)(data)
}
