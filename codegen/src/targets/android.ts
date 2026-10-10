/**
 * Android（Kotlin + Jetpack Compose）令牌生成。
 *
 * 产出 top/lhgb/ui/tokens/LhTokens.kt（明色）与 LhDarkTokens.kt（暗色覆盖）。
 * 令牌按路径层级组织为嵌套 object，色值为 ARGB Int，尺寸为 dp / sp。
 * 包名遵循家族命名规范（总纲 D20）：反域名 top.lhgb.ui。
 */

import { structureValue, toArgbHex, usesSp } from '../format'
import { buildTokenTree, pascalCase } from '../tree'
import type { CodegenInput, CodegenTarget, GeneratedFile, ResolvedToken, TokenSet } from '../types'
import { render } from '../render'

const PACKAGE = 'top.lhgb.ui.tokens'
const HEADER_SOURCE = '@lh-ui/core tokens'

interface KotlinLine {
  indent: number
  text: string
}

interface FormatResult {
  literal: string
  /** 用到的运行时类型，决定 import 清单 */
  features: Set<string>
}

function formatKotlin(path: string, token: ResolvedToken): FormatResult {
  const structured = structureValue(token)
  switch (structured.kind) {
    case 'color':
      return { literal: `ComposeColor(${toArgbHex(structured.color)})`, features: new Set(['color']) }
    case 'dimension': {
      const d = structured.dimension
      if (d.unit === '%') {
        const fraction = (d.value / 100).toFixed(3).replace(/0$/, '')
        return { literal: `${fraction}f  // ${d.value}%（分数，由容器尺寸换算）`, features: new Set() }
      }
      return { literal: `${d.value}.${usesSp(path) ? 'sp' : 'dp'}`, features: new Set(['dimension']) }
    }
    case 'duration':
      return {
        literal: `${structured.duration.ms}  // ${token.value}（毫秒）`,
        features: new Set(),
      }
    case 'cubicBezier': {
      const [x1, y1, x2, y2] = structured.bezier.map((n) => `${n}f`)
      return { literal: `CubicBezierEasing(${x1}, ${y1}, ${x2}, ${y2})`, features: new Set(['bezier']) }
    }
    case 'shadow': {
      const s = structured.shadow
      const spreadNote = s.spread !== undefined ? `  // 扩展量 ${s.spread}px Compose 不支持，已忽略` : ''
      return {
        literal: `Shadow(color = ComposeColor(${toArgbHex(
          s.color,
        )}), offset = Offset(${s.x}f, ${s.y}f), blurRadius = ${s.blur}f)${spreadNote}`,
        features: new Set(['color', 'shadow']),
      }
    }
    case 'number':
      return { literal: String(structured.number), features: new Set() }
    case 'string':
      return { literal: JSON.stringify(structured.string), features: new Set() }
  }
}

interface TreeGroup {
  name: string
  tokens: { name: string; token: ResolvedToken }[]
  children: TreeGroup[]
}

function emitTree(lines: KotlinLine[], group: TreeGroup, indent: number, features: Set<string>): void {
  if (group.tokens.length || group.children.length) {
    lines.push({ indent, text: `object ${pascalCase(group.name)} {` })
    for (const { name, token } of group.tokens) {
      const { literal, features: f } = formatKotlin(token.path, token)
      for (const x of f) features.add(x)
      const comment = token.description ? `  // ${token.description}` : ''
      lines.push({ indent: indent + 2, text: `val ${name} = ${literal}${comment}` })
    }
    for (const child of group.children) emitTree(lines, child, indent + 2, features)
    lines.push({ indent, text: '}' })
  }
}

function buildKotlinBody(tokenSet: TokenSet, rootName: string, features: Set<string>): string {
  const lines: KotlinLine[] = []
  lines.push({ indent: 0, text: `object ${rootName} {` })
  for (const group of buildTokenTree(tokenSet.tokens)) {
    emitTree(lines, group, 2, features)
  }
  lines.push({ indent: 0, text: '}' })
  return lines.map((l) => `${' '.repeat(l.indent)}${l.text}`).join('\n')
}

function buildDarkKotlinBody(tokenSet: TokenSet, features: Set<string>): string {
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
  const lines: KotlinLine[] = []
  lines.push({ indent: 0, text: 'object LhDarkTokens {' })
  for (const group of buildTokenTree(darkTokens)) {
    emitTree(lines, group, 2, features)
  }
  lines.push({ indent: 0, text: '}' })
  return lines.map((l) => `${' '.repeat(l.indent)}${l.text}`).join('\n')
}

function importsFor(features: Set<string>): string[] {
  const imports: string[] = []
  if (features.has('color')) imports.push('import androidx.compose.ui.graphics.Color as ComposeColor')
  if (features.has('dimension')) {
    imports.push('import androidx.compose.ui.unit.dp')
    imports.push('import androidx.compose.ui.unit.sp')
  }
  if (features.has('shadow')) imports.push('import androidx.compose.ui.graphics.Shadow', 'import androidx.compose.ui.geometry.Offset')
  if (features.has('bezier')) imports.push('import androidx.compose.animation.core.CubicBezierEasing')
  return imports
}

function renderKotlinFile(body: string, version: string, features: Set<string>): string {
  return render('android/LhTokens.kt.hbs', {
    version,
    source: HEADER_SOURCE,
    package: PACKAGE,
    imports: importsFor(features),
    body,
  })
}

export const androidTarget: CodegenTarget = {
  name: 'android',
  outDir: 'android',
  generate(input: CodegenInput): GeneratedFile[] {
    const lightFeatures = new Set<string>()
    const lightBody = buildKotlinBody(input.tokens, 'LhTokens', lightFeatures)
    const darkFeatures = new Set<string>()
    const darkBody = buildDarkKotlinBody(input.tokens, darkFeatures)
    return [
      {
        relativePath: 'top/lhgb/ui/tokens/LhTokens.kt',
        content: renderKotlinFile(lightBody, input.version, lightFeatures),
      },
      {
        relativePath: 'top/lhgb/ui/tokens/LhDarkTokens.kt',
        content: renderKotlinFile(darkBody, input.version, darkFeatures),
      },
    ]
  },
}
