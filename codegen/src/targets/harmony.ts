/**
 * 鸿蒙（ArkTS + ArkUI）令牌生成。
 *
 * 产出 tokens/LhTokens.ets（明色）与 LhDarkTokens.ets（暗色覆盖）。
 * ArkUI 颜色接受 '#AARRGGBB' 字符串，尺寸为 vp 数值，时长为 ms 数值。
 */

import { structureValue, toArgbHash } from '../format'
import { buildTokenTree, pascalCase } from '../tree'
import type { CodegenInput, CodegenTarget, GeneratedFile, ResolvedToken, TokenSet } from '../types'
import { render } from '../render'

const HEADER_SOURCE = '@lh-ui/core tokens'

interface EtsLine {
  indent: number
  text: string
}

function formatEts(token: ResolvedToken): string {
  const structured = structureValue(token)
  switch (structured.kind) {
    case 'color':
      return `'${toArgbHash(structured.color)}'`
    case 'dimension': {
      const d = structured.dimension
      if (d.unit === '%') return `${(d.value / 100).toFixed(3)}  // ${d.value}%（分数，由容器尺寸换算）`
      return String(d.value)
    }
    case 'duration':
      return `${structured.duration.ms}  // ${token.value}（毫秒）`
    case 'cubicBezier': {
      const [x1, y1, x2, y2] = structured.bezier
      return `[${x1}, ${y1}, ${x2}, ${y2}]  // 贝塞尔控制点，组件侧以 curves.cubicBezierCurve 消费`
    }
    case 'shadow': {
      const s = structured.shadow
      const spreadNote = s.spread !== undefined ? `  // 扩展量 ${s.spread}px ArkUI 不支持，已忽略` : ''
      return `{ color: '${toArgbHash(
        s.color,
      )}', radius: ${s.blur}, offsetX: ${s.x}, offsetY: ${s.y} }${spreadNote}`
    }
    case 'number':
      return String(structured.number)
    case 'string':
      return JSON.stringify(structured.string)
  }
}

interface TreeGroup {
  name: string
  tokens: { name: string; token: ResolvedToken }[]
  children: TreeGroup[]
}

function emitTree(lines: EtsLine[], group: TreeGroup, indent: number): void {
  if (group.tokens.length || group.children.length) {
    // 嵌套类不带 export（类体内不允许 export 声明）；仅根类导出
    lines.push({ indent, text: `class ${pascalCase(group.name)} {` })
    for (const { name, token } of group.tokens) {
      const comment = token.description ? `  // ${token.description}` : ''
      lines.push({ indent: indent + 2, text: `static readonly ${name}: ${typeAnnotation(token)} = ${formatEts(token)}${comment}` })
    }
    for (const child of group.children) emitTree(lines, child, indent + 2)
    lines.push({ indent, text: '}' })
  }
}

function typeAnnotation(token: ResolvedToken): string {
  switch (token.type) {
    case 'color':
      return 'ResourceColor'
    case 'dimension':
      return 'Dimension | number'
    case 'duration':
    case 'number':
      return 'number'
    case 'shadow':
      return 'LhShadow'
    case 'cubicBezier':
      return 'number[]'
    case 'string':
      return 'string'
  }
}

function buildEtsBody(tokenSet: TokenSet, rootName: string): string {
  const lines: EtsLine[] = []
  lines.push({ indent: 0, text: `export class ${rootName} {` })
  for (const group of buildTokenTree(tokenSet.tokens)) {
    emitTree(lines, group, 2)
  }
  lines.push({ indent: 0, text: '}' })
  return lines.map((l) => `${' '.repeat(l.indent)}${l.text}`).join('\n')
}

function buildDarkEtsBody(tokenSet: TokenSet): string {
  const darkTokens: ResolvedToken[] = [...tokenSet.dark.entries()]
    .map(([path, value]) => {
      const base = tokenSet.byPath.get(path)
      return {
        path,
        type: base?.type ?? ('color' as const),
        value,
        description: base?.description,
      }
    })
    .sort((a, b) => a.path.localeCompare(b.path))
  const lines: EtsLine[] = []
  lines.push({ indent: 0, text: 'export class LhDarkTokens {' })
  for (const group of buildTokenTree(darkTokens)) {
    emitTree(lines, group, 2)
  }
  lines.push({ indent: 0, text: '}' })
  return lines.map((l) => `${' '.repeat(l.indent)}${l.text}`).join('\n')
}

export const harmonyTarget: CodegenTarget = {
  name: 'harmony',
  outDir: 'harmony',
  generate(input: CodegenInput): GeneratedFile[] {
    const templateData = { version: input.version, source: HEADER_SOURCE }
    const hasShadow = input.tokens.tokens.some((t) => t.type === 'shadow')
    const files: GeneratedFile[] = [
      {
        relativePath: 'tokens/LhTokens.ets',
        content: render('harmony/LhTokens.ets.hbs', { ...templateData, body: buildEtsBody(input.tokens, 'LhTokens') }),
      },
      {
        relativePath: 'tokens/LhDarkTokens.ets',
        content: render('harmony/LhTokens.ets.hbs', { ...templateData, body: buildDarkEtsBody(input.tokens) }),
      },
    ]
    if (hasShadow) {
      files.push({
        relativePath: 'tokens/LhShadow.ets',
        content: render('harmony/LhShadow.ets.hbs', templateData),
      })
    }
    return files
  },
}
