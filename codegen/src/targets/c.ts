/**
 * C / C++ 嵌入式令牌生成。
 *
 * 产出 include/lh_ui/lh_tokens.h（明色）与 lh_dark_tokens.h（暗色覆盖）。
 * 色值为 0xAARRGGBB 宏，尺寸为整型（逻辑像素），时长为毫秒，贝塞尔为静态数组。
 */

import { structureValue, toArgbHex } from '../format'
import { buildTokenTree } from '../tree'
import type { CodegenInput, CodegenTarget, GeneratedFile, ResolvedToken, TokenSet } from '../types'
import { render } from '../render'

const HEADER_SOURCE = '@lh-ui/core tokens'

interface CLine {
  indent: number
  text: string
}

/** 点路径转大写蛇形宏名：color.primary.default -> LH_COLOR_PRIMARY_DEFAULT */
function macroName(path: string): string {
  return 'LH_' + path.replace(/\./g, '_').replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`).toUpperCase()
}

/** 数值转合法 C 浮点字面量：整数补 .0 后缀，避免 0f / 2f 这类非法后缀 */
function floatLiteral(value: number): string {
  return Number.isInteger(value) ? `${value}.0f` : `${value}f`
}

function formatC(token: ResolvedToken): string {
  const structured = structureValue(token)
  switch (structured.kind) {
    case 'color':
      return toArgbHex(structured.color)
    case 'dimension': {
      const d = structured.dimension
      if (d.unit === '%') return `${(d.value / 100).toFixed(3)}f  /* ${d.value}% 分数 */`
      return Number.isInteger(d.value) ? String(d.value) : `${d.value}f`
    }
    case 'duration':
      return `${structured.duration.ms}  /* ${token.value} 毫秒 */`
    case 'cubicBezier': {
      const [x1, y1, x2, y2] = structured.bezier
      return `{ ${floatLiteral(x1)}, ${floatLiteral(y1)}, ${floatLiteral(x2)}, ${floatLiteral(y2)} }`
    }
    case 'shadow': {
      const s = structured.shadow
      const spreadNote = s.spread !== undefined ? `  /* 扩展量 ${s.spread}px 已忽略 */` : ''
      return `{ ${toArgbHex(s.color)}, ${floatLiteral(s.x)}, ${floatLiteral(s.y)}, ${floatLiteral(s.blur)} }${spreadNote}`
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

function emitTree(lines: CLine[], group: TreeGroup, parentPath: string): void {
  const groupPath = parentPath ? `${parentPath}.${group.name}` : group.name
  if (group.tokens.length) {
    lines.push({ indent: 0, text: `/* --- ${groupPath} --- */` })
  }
  for (const { name, token } of group.tokens) {
    const macro = macroName(`${groupPath}.${name}`)
    const comment = token.description ? `  /* ${token.description} */` : ''
    lines.push({ indent: 0, text: `#define ${macro} ${formatC(token)}${comment}` })
  }
  for (const child of group.children) emitTree(lines, child, groupPath)
}

function buildCBody(tokenSet: TokenSet): string {
  const lines: CLine[] = []
  for (const group of buildTokenTree(tokenSet.tokens)) {
    emitTree(lines, group, '')
  }
  return lines.map((l) => `${' '.repeat(l.indent)}${l.text}`).join('\n')
}

function buildDarkCBody(tokenSet: TokenSet): string {
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
  const lines: CLine[] = []
  for (const token of darkTokens) {
    const macro = macroName(token.path)
    const comment = token.description ? `  /* ${token.description} */` : ''
    lines.push({ indent: 0, text: `#define ${macro} ${formatC(token)}${comment}` })
  }
  return lines.map((l) => `${' '.repeat(l.indent)}${l.text}`).join('\n')
}

export const cTarget: CodegenTarget = {
  name: 'c',
  outDir: 'c',
  generate(input: CodegenInput): GeneratedFile[] {
    const templateData = { version: input.version, source: HEADER_SOURCE }
    return [
      {
        relativePath: 'include/lh_ui/lh_tokens.h',
        content: render('c/lh_tokens.h.hbs', { ...templateData, body: buildCBody(input.tokens) }),
      },
      {
        relativePath: 'include/lh_ui/lh_dark_tokens.h',
        content: render('c/lh_dark_tokens.h.hbs', { ...templateData, body: buildDarkCBody(input.tokens) }),
      },
    ]
  },
}

/** 点路径转 C 宏名，供测试与外部消费 */
export { macroName as cMacroName }

