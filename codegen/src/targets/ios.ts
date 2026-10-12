/**
 * iOS（Swift + SwiftUI）令牌生成。
 *
 * 产出 Sources/LhUITokens/LhTokens.swift（明色）与 LhDarkTokens.swift（暗色覆盖）。
 * 命名空间用 enum（Swift 的无实例命名空间惯用法），色值以 RGB 归一化 Double 表达。
 */

import { structureValue } from '../format'
import { buildTokenTree, pascalCase } from '../tree'
import type { CodegenInput, CodegenTarget, GeneratedFile, ResolvedToken, TokenSet } from '../types'
import { render } from '../render'

const HEADER_SOURCE = '@lh-ui/core tokens'

interface SwiftLine {
  indent: number
  text: string
}

function formatSwift(token: ResolvedToken): string {
  const structured = structureValue(token)
  switch (structured.kind) {
    case 'color': {
      const c = structured.color
      const r = (c.r / 255).toFixed(3)
      const g = (c.g / 255).toFixed(3)
      const b = (c.b / 255).toFixed(3)
      if (c.a >= 1) return `SwiftUI.Color(red: ${r}, green: ${g}, blue: ${b})`
      return `SwiftUI.Color(red: ${r}, green: ${g}, blue: ${b}).opacity(${c.a.toFixed(3)})`
    }
    case 'dimension': {
      const d = structured.dimension
      if (d.unit === '%') {
        const fraction = (d.value / 100).toFixed(3)
        return `${fraction}  // ${d.value}%（分数，由容器尺寸换算）`
      }
      return `CGFloat(${d.value})`
    }
    case 'duration':
      // SwiftUI 动画以秒为单位
      return `${(structured.duration.ms / 1000).toFixed(3)}  // ${token.value}（秒）`
    case 'cubicBezier': {
      const [x1, y1, x2, y2] = structured.bezier
      return `(x1: ${x1}, y1: ${y1}, x2: ${x2}, y2: ${y2})  // 贝塞尔控制点，端自行构造 easing`
    }
    case 'shadow': {
      const s = structured.shadow
      const spreadNote = s.spread !== undefined ? `  // 扩展量 ${s.spread}px SwiftUI 不支持，已忽略` : ''
      // LhShadow 的 color 已内联 alpha（组件直接取 .color 喂给 .shadow(color:)），
      // 括号必须在 opacity 后闭合，radius/x/y 属于 LhShadow 而非 Color
      const alpha = s.color.a.toFixed(3)
      return `LhShadow(color: SwiftUI.Color(red: ${(s.color.r / 255).toFixed(
        3,
      )}, green: ${(s.color.g / 255).toFixed(3)}, blue: ${(s.color.b / 255).toFixed(
        3,
      )}, opacity: ${alpha}), opacity: ${alpha}, radius: ${s.blur}, x: ${s.x}, y: ${s.y})${spreadNote}`
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

/**
 * Swift 关键字集合：令牌名与其同形时成员名需加反引号（如 `default`），
 * 否则产物无法编译。枚举类型名走 pascalCase 不会撞关键字，仅成员名需要转义。
 */
const SWIFT_KEYWORDS = new Set([
  'as', 'any', 'break', 'case', 'catch', 'class', 'continue', 'default', 'defer', 'do', 'else',
  'enum', 'extension', 'fallthrough', 'false', 'for', 'func', 'guard', 'if', 'import', 'in',
  'init', 'inout', 'is', 'let', 'nil', 'operator', 'private', 'protocol', 'public', 'repeat',
  'return', 'self', 'static', 'struct', 'subscript', 'super', 'switch', 'throw', 'true', 'try',
  'typealias', 'var', 'where', 'while',
])

function swiftMemberName(name: string): string {
  return SWIFT_KEYWORDS.has(name) ? `\`${name}\`` : name
}

function emitTree(lines: SwiftLine[], group: TreeGroup, indent: number): void {
  if (group.tokens.length || group.children.length) {
    lines.push({ indent, text: `public enum ${pascalCase(group.name)} {` })
    for (const { name, token } of group.tokens) {
      const comment = token.description ? `  // ${token.description}` : ''
      lines.push({
        indent: indent + 2,
        text: `public static let ${swiftMemberName(name)} = ${formatSwift(token)}${comment}`,
      })
    }
    for (const child of group.children) emitTree(lines, child, indent + 2)
    lines.push({ indent, text: '}' })
  }
}

function buildSwiftBody(tokenSet: TokenSet, rootName: string): string {
  const lines: SwiftLine[] = []
  lines.push({ indent: 0, text: `public enum ${rootName} {` })
  for (const group of buildTokenTree(tokenSet.tokens)) {
    emitTree(lines, group, 2)
  }
  lines.push({ indent: 0, text: '}' })
  return lines.map((l) => `${' '.repeat(l.indent)}${l.text}`).join('\n')
}

function buildDarkSwiftBody(tokenSet: TokenSet): string {
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
  const lines: SwiftLine[] = []
  lines.push({ indent: 0, text: 'public enum LhDarkTokens {' })
  for (const group of buildTokenTree(darkTokens)) {
    emitTree(lines, group, 2)
  }
  lines.push({ indent: 0, text: '}' })
  return lines.map((l) => `${' '.repeat(l.indent)}${l.text}`).join('\n')
}

export const iosTarget: CodegenTarget = {
  name: 'ios',
  outDir: 'ios',
  generate(input: CodegenInput): GeneratedFile[] {
    const templateData = { version: input.version, source: HEADER_SOURCE }
    const hasShadow = input.tokens.tokens.some((t) => t.type === 'shadow')
    const files: GeneratedFile[] = [
      {
        relativePath: 'Sources/LhUITokens/LhTokens.swift',
        content: render('ios/LhTokens.swift.hbs', { ...templateData, body: buildSwiftBody(input.tokens, 'LhTokens') }),
      },
      {
        relativePath: 'Sources/LhUITokens/LhDarkTokens.swift',
        content: render('ios/LhTokens.swift.hbs', { ...templateData, body: buildDarkSwiftBody(input.tokens) }),
      },
    ]
    if (hasShadow) {
      files.push({
        relativePath: 'Sources/LhUITokens/LhShadow.swift',
        content: render('ios/LhShadow.swift.hbs', templateData),
      })
    }
    return files
  },
}
