/**
 * Windows（C# + WinUI 3）令牌生成。
 *
 * 产出 Tokens/LhTokens.cs（明色）与 Tokens/LhDarkTokens.cs（暗色覆盖）。
 * 命名空间 Top.Lhgb.Ui.Tokens（反域名，总纲 D20）；令牌按路径层级组织为嵌套
 * static class，色值为 Microsoft.UI.Color，尺寸为 double（逻辑像素 epx），
 * 时长为毫秒 int，贝塞尔与投影以只读记录结构承载（组件侧自行换算）。
 */

import { structureValue, toArgbHex } from '../format'
import type { ParsedColor } from '../format'
import { buildTokenTree, pascalCase } from '../tree'
import type { CodegenInput, CodegenTarget, GeneratedFile, ResolvedToken, TokenSet } from '../types'
import { render } from '../render'

const NAMESPACE = 'Top.Lhgb.Ui.Tokens'
const HEADER_SOURCE = '@lh-ui/core tokens'

interface CsLine {
  indent: number
  text: string
}

interface FormatResult {
  /** C# 字段类型 */
  type: string
  literal: string
  /** 单位 / 换算说明，与 description 合并输出为行内注释（不能塞进 literal，否则分号会落进注释里） */
  note?: string
}

/**
 * 颜色转 WinUI 工厂调用：Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C)。
 *
 * Windows App SDK 的颜色事实（经 Microsoft.UI.winmd 元数据核实）：
 * - `Microsoft.UI.Color` 结构体**不存在**（Windows App SDK 1.6 及以下）
 * - 颜色结构体是 `Windows.UI.Color`（Windows SDK 提供）
 * - 颜色表 `Microsoft.UI.Colors`（Black/Transparent 等）的属性返回 `Windows.UI.Color`
 *
 * 因此令牌侧一律用 `Windows.UI.Color`：它自带 FromArgb 工厂，且与 Colors 表类型一致。
 * 组件侧若要用 Colors 表，需 `using Microsoft.UI;`（Colors 在该命名空间）+ `using Windows.UI;`（Color 在该命名空间）。
 */
function toCsColor(c: ParsedColor): string {
  const argb = toArgbHex(c).slice(2) // FF2B4C7C
  const byte = (hex: string) => `0x${hex}`
  return `Windows.UI.Color.FromArgb(${byte(argb.slice(0, 2))}, ${byte(argb.slice(2, 4))}, ${byte(
    argb.slice(4, 6),
  )}, ${byte(argb.slice(6, 8))})`
}

/** 数值转 C# double 字面量：整数补 .0 后缀（8 -> 8.0），避免隐式类型转换歧义 */
function doubleLiteral(value: number): string {
  return Number.isInteger(value) ? `${value}.0` : `${value}`
}

function formatCs(token: ResolvedToken): FormatResult {
  const structured = structureValue(token)
  switch (structured.kind) {
    case 'color':
      return { type: 'Windows.UI.Color', literal: toCsColor(structured.color) }
    case 'dimension': {
      const d = structured.dimension
      if (d.unit === '%') {
        const fraction = (d.value / 100).toFixed(3).replace(/0$/, '')
        return {
          type: 'double',
          literal: fraction,
          note: `${d.value}%（分数，由容器尺寸换算）`,
        }
      }
      return { type: 'double', literal: doubleLiteral(d.value) }
    }
    case 'duration':
      // WinUI 动画以 TimeSpan（100ns tick）为单位，组件侧 TimeSpan.FromMilliseconds(...)
      return { type: 'int', literal: String(structured.duration.ms), note: `${token.value}（毫秒）` }
    case 'cubicBezier': {
      const [x1, y1, x2, y2] = structured.bezier
      return {
        type: 'LhEasing',
        literal: `new LhEasing(${x1}, ${y1}, ${x2}, ${y2})`,
        note: '贝塞尔控制点，组件侧以 KeySpline / SplineEase 消费',
      }
    }
    case 'shadow': {
      const s = structured.shadow
      return {
        type: 'LhShadow',
        literal: `new LhShadow(${toCsColor(s.color)}, ${doubleLiteral(s.x)}, ${doubleLiteral(
          s.y,
        )}, ${doubleLiteral(s.blur)})`,
        note: s.spread !== undefined ? `扩展量 ${s.spread}px WinUI DropShadow 不支持，已忽略` : undefined,
      }
    }
    case 'number':
      return {
        type: Number.isInteger(structured.number) ? 'int' : 'double',
        literal: String(structured.number),
      }
    case 'string':
      return { type: 'string', literal: JSON.stringify(structured.string) }
  }
}

interface TreeGroup {
  name: string
  tokens: { name: string; token: ResolvedToken }[]
  children: TreeGroup[]
}

/**
 * 令牌名转 C# 成员名（PascalCase）：default -> Default，extraLarge -> ExtraLarge。
 * 成员名一律 PascalCase，顺带规避 default / base 等 C# 关键字（分组名同理走 pascalCase）。
 */
function csMemberName(name: string): string {
  const cleaned = name.replace(/[^0-9a-zA-Z]/g, '')
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

function emitTree(lines: CsLine[], group: TreeGroup, indent: number): void {
  if (group.tokens.length || group.children.length) {
    lines.push({ indent, text: `public static class ${pascalCase(group.name)} {` })
    for (const { name, token } of group.tokens) {
      const { type, literal, note } = formatCs(token)
      // note 与 description 合并为一条行内注释；分号必须落在 literal 与注释之间，
      // 否则带注释的 literal（分数 / 时长 / 贝塞尔 / 投影）会让分号被注释吞掉（CS1002）
      const parts = [note, token.description].filter((s): s is string => Boolean(s))
      const comment = parts.length ? `  // ${parts.join('；')}` : ''
      lines.push({
        indent: indent + 2,
        text: `public static readonly ${type} ${csMemberName(name)} = ${literal};${comment}`,
      })
    }
    for (const child of group.children) emitTree(lines, child, indent + 2)
    lines.push({ indent, text: '}' })
  }
}

function buildCsBody(tokenSet: TokenSet, rootName: string): string {
  const lines: CsLine[] = []
  lines.push({ indent: 0, text: `public static class ${rootName} {` })
  for (const group of buildTokenTree(tokenSet.tokens)) emitTree(lines, group, 2)
  lines.push({ indent: 0, text: '}' })
  return lines.map((l) => `${' '.repeat(l.indent)}${l.text}`).join('\n')
}

function buildDarkCsBody(tokenSet: TokenSet): string {
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
  const lines: CsLine[] = []
  lines.push({ indent: 0, text: 'public static class LhDarkTokens {' })
  for (const group of buildTokenTree(darkTokens)) emitTree(lines, group, 2)
  lines.push({ indent: 0, text: '}' })
  return lines.map((l) => `${' '.repeat(l.indent)}${l.text}`).join('\n')
}

export const windowsTarget: CodegenTarget = {
  name: 'windows',
  outDir: 'windows',
  generate(input: CodegenInput): GeneratedFile[] {
    const templateData = { version: input.version, source: HEADER_SOURCE, namespace: NAMESPACE }
    const hasShadow = input.tokens.tokens.some((t) => t.type === 'shadow')
    const hasBezier = input.tokens.tokens.some((t) => t.type === 'cubicBezier')
    const files: GeneratedFile[] = [
      {
        relativePath: 'Tokens/LhTokens.cs',
        content: render('windows/LhTokens.cs.hbs', { ...templateData, body: buildCsBody(input.tokens, 'LhTokens') }),
      },
      {
        relativePath: 'Tokens/LhDarkTokens.cs',
        content: render('windows/LhTokens.cs.hbs', { ...templateData, body: buildDarkCsBody(input.tokens) }),
      },
    ]
    if (hasShadow) {
      files.push({
        relativePath: 'Tokens/LhShadow.cs',
        content: render('windows/LhShadow.cs.hbs', templateData),
      })
    }
    if (hasBezier) {
      files.push({
        relativePath: 'Tokens/LhEasing.cs',
        content: render('windows/LhEasing.cs.hbs', templateData),
      })
    }
    return files
  },
}

/** 点路径转 C# 令牌路径，供测试与外部消费 */
export function csTokenPath(path: string): string {
  return `LhTokens.${path
    .split('.')
    .map((seg) => csMemberName(seg))
    .join('.')}`
}
