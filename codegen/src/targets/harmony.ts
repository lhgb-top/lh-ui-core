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

/**
 * 扁平化的令牌分组：一个 export interface（形态契约）+ 一个 export const（取值）。
 *
 * ArkTS 约束叠加史：
 * 1. 类体内不允许嵌套 class（新编译器报 Unexpected token）—— 摊平为顶层声明；
 * 2. 类不能当对象用（arkts-no-classes-as-obj：`static readonly X = SomeClass` 违规）——
 *    分组载体从 class 改为「interface + 类型化 const 对象」，普通 const 不在
 *    非法值集合（Class/Enum/Module）内。
 *
 * 消费侧访问路径（`LhTokens.Button.FontSize.medium`）保持不变。
 */
interface FlatGroup {
  constName: string
  typeName: string
  depth: number
  tokens: { name: string; token: ResolvedToken }[]
  childRefs: { propName: string; group: FlatGroup }[]
}

/** 递归收集扁平分组。返回当前层各分组在父分组中的引用。 */
function collectGroups(
  groups: TreeGroup[],
  prefix: string,
  depth: number,
  acc: FlatGroup[],
): { propName: string; group: FlatGroup }[] {
  const refs: { propName: string; group: FlatGroup }[] = []
  for (const group of groups) {
    const constName = `${prefix}${pascalCase(group.name)}`
    const flat: FlatGroup = { constName, typeName: `${constName}T`, depth, tokens: group.tokens, childRefs: [] }
    acc.push(flat)
    flat.childRefs = collectGroups(group.children, constName, depth + 1, acc)
    refs.push({ propName: pascalCase(group.name), group: flat })
  }
  return refs
}

/** formatEts 会在值里内联注释（时长 / 分数 / 贝塞尔），拆出值与注释 */
function splitValueAndComment(raw: string, description?: string): { value: string; comment: string } {
  const ci = raw.indexOf('  //')
  const value = ci >= 0 ? raw.slice(0, ci) : raw
  const embedded = ci >= 0 ? raw.slice(ci + 4).trim() : ''
  const parts = [embedded, description ?? ''].filter((s) => s.length > 0)
  return { value, comment: parts.join('；') }
}

function emitFlatBody(rootName: string, tokens: ResolvedToken[]): string {
  const groups: FlatGroup[] = []
  const rootRefs = collectGroups(buildTokenTree(tokens), rootName, 1, groups)
  const lines: string[] = []
  // 子分组先于父分组声明：const 初始化器在声明处求值，
  // 先声明子分组避免父对象引用到尚未求值的 const（TDZ）。
  const ordered = [...groups].sort((a, b) => b.depth - a.depth)
  for (const g of ordered) {
    lines.push(`export interface ${g.typeName} {`)
    for (const { name, token } of g.tokens) {
      lines.push(`  readonly ${name}: ${typeAnnotation(token)}`)
    }
    for (const ref of g.childRefs) {
      lines.push(`  readonly ${ref.propName}: ${ref.group.typeName}`)
    }
    lines.push('}')
    lines.push(`export const ${g.constName}: ${g.typeName} = {`)
    for (const { name, token } of g.tokens) {
      const { value, comment } = splitValueAndComment(formatEts(token), token.description)
      lines.push(comment ? `  ${name}: ${value},  // ${comment}` : `  ${name}: ${value},`)
    }
    for (const ref of g.childRefs) {
      lines.push(`  ${ref.propName}: ${ref.group.constName},`)
    }
    lines.push('}', '')
  }
  lines.push(`export interface ${rootName}T {`)
  for (const ref of rootRefs) {
    lines.push(`  readonly ${ref.propName}: ${ref.group.typeName}`)
  }
  lines.push('}')
  lines.push(`export const ${rootName}: ${rootName}T = {`)
  for (const ref of rootRefs) {
    lines.push(`  ${ref.propName}: ${ref.group.constName},`)
  }
  lines.push('}')
  return lines.join('\n')
}


function typeAnnotation(token: ResolvedToken): string {
  switch (token.type) {
    case 'color':
      return 'ResourceColor'
    case 'dimension':
      // 令牌值恒为 vp 数值（codegen 只产出裸数字 / 小数），
      // 标注为 number 而非 Dimension | number：后者含 `${number}px` 等模板字符串
      // 成员，无法赋给 number 局部或传入 number 参数。
      return 'number'
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
  return emitFlatBody(rootName, tokenSet.tokens)
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
  return emitFlatBody('LhDarkTokens', darkTokens)
}

export const harmonyTarget: CodegenTarget = {
  name: 'harmony',
  outDir: 'harmony',
  generate(input: CodegenInput): GeneratedFile[] {
    const templateData = { version: input.version, source: HEADER_SOURCE }
    const hasShadow = input.tokens.tokens.some((t) => t.type === 'shadow')
    // LhTokens.ets 的阴影令牌以 LhShadow 为类型标注，需显式导入同目录的载体接口
    const lightBody = hasShadow
      ? `import { LhShadow } from './LhShadow'\n\n${buildEtsBody(input.tokens, 'LhTokens')}`
      : buildEtsBody(input.tokens, 'LhTokens')
    const files: GeneratedFile[] = [
      {
        relativePath: 'tokens/LhTokens.ets',
        content: render('harmony/LhTokens.ets.hbs', { ...templateData, body: lightBody }),
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

