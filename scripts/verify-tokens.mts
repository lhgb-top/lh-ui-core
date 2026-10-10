/**
 * 令牌校验：结构校验（load）+ 引用解析（resolve）之外的额外完整性检查。
 *
 * - 暗色覆盖路径必须存在于明色集
 * - 关键文字/底色对比度 >= 4.5:1（WCAG AA，仅检查声明的配对）
 * - 令牌值不得出现平台专属语法（var/rem/sp/dp 等）
 */

import { parseColor } from '../codegen/src/format'
import { loadTokenFiles, readVersion } from '../codegen/src/load'
import { resolveTokens } from '../codegen/src/resolve'

/** 前景/背景对比度配对（WCAG AA 要求 >= 4.5）。禁用态不参与检查（WCAG 豁免） */
const CONTRAST_PAIRS: Array<[string, string, number]> = [
  ['color.text.primary', 'color.background.default', 4.5],
  ['color.text.regular', 'color.background.default', 4.5],
  ['color.onPrimary', 'color.primary.default', 4.5],
]

function relativeLuminance(hex: { r: number; g: number; b: number }): number {
  const channel = (c: number): number => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(hex.r) + 0.7152 * channel(hex.g) + 0.0722 * channel(hex.b)
}

function contrastRatio(fg: string, bg: string): number {
  const a = relativeLuminance(parseColor(fg))
  const b = relativeLuminance(parseColor(bg))
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

function main(): void {
  const errors: string[] = []
  const warnings: string[] = []

  const files = loadTokenFiles()
  const { tokenSet, orphanDarkPaths, refMap } = resolveTokens(files)
  console.log(`令牌：${tokenSet.tokens.length} 个，ref 引用 ${refMap.size} 处，暗色覆盖 ${tokenSet.dark.size} 处`)

  for (const path of orphanDarkPaths) {
    errors.push(`暗色覆盖路径在明色集中不存在：${path}`)
  }

  // 平台专属语法巡检（结构由 schema 约束，此处兜底拦截 var/rem/sp/dp 等）
  const forbidden = /(var\s*\(|\brem\b|\bsp\b|\bdp\b)/
  for (const token of tokenSet.tokens) {
    if (typeof token.value === 'string' && forbidden.test(token.value)) {
      errors.push(`令牌 ${token.path} 含平台专属语法：${token.value}`)
    }
  }

  // 对比度检查
  const darkBgOverrides = new Set(['color.background.default', 'color.primary.default'])
  for (const [fg, bg, required] of CONTRAST_PAIRS) {
    const fgToken = tokenSet.byPath.get(fg)
    const bgToken = tokenSet.byPath.get(bg)
    if (!fgToken || !bgToken) {
      warnings.push(`对比度检查跳过：缺少令牌 ${fg} 或 ${bg}`)
      continue
    }
    const lightRatio = contrastRatio(String(fgToken.value), String(bgToken.value))
    reportContrast(errors, `${fg} / ${bg}`, '明色', lightRatio, required)
    if (darkBgOverrides.has(bg) || darkBgOverrides.has(fg)) {
      const darkFg = tokenSet.dark.get(fg) ?? fgToken.value
      const darkBg = tokenSet.dark.get(bg) ?? bgToken.value
      const darkRatio = contrastRatio(String(darkFg), String(darkBg))
      reportContrast(errors, `${fg} / ${bg}`, '暗色', darkRatio, required)
    }
  }

  // 报告
  for (const w of warnings) console.log(`⚠️  ${w}`)
  if (errors.length > 0) {
    for (const e of errors) console.error(`❌ ${e}`)
    console.error(`\n令牌校验失败：${errors.length} 个错误（@lh-ui/core v${readVersion()}）`)
    process.exitCode = 1
    return
  }
  console.log(`✅ 令牌校验通过（@lh-ui/core v${readVersion()}）`)
}

function reportContrast(errors: string[], pair: string, mode: string, ratio: number, required: number): void {
  const pass = ratio >= required
  const line = `${mode}对比度 ${pair}：${ratio.toFixed(2)}:1（要求 >= ${required}）`
  if (pass) console.log(`   ✓ ${line}`)
  else errors.push(`${line} — 不达标`)
}

main()
