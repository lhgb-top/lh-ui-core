/**
 * 中性值的解析与各端格式化。
 *
 * 所有令牌值都是平台无关的中性表达（十六进制 / rgba / 带单位字符串 / 数字 / 贝塞尔数组），
 * 这里把它们解析为结构化数据，再由各 target 格式化成本地语言的字面量。
 */

import type { ResolvedToken, TokenValue, TokenType } from './types'

// ============================== 解析 ==============================

export interface ParsedColor {
  /** 0..255 */
  r: number
  g: number
  b: number
  /** 0..1 */
  a: number
}

export interface ParsedDimension {
  value: number
  unit: 'px' | '%'
}

export interface ParsedDuration {
  /** 毫秒 */
  ms: number
}

export interface ParsedShadow {
  x: number
  y: number
  blur: number
  spread?: number
  color: ParsedColor
}

/** 十六进制色值（#RGB / #RRGGBB / #AARRGGBB）解析为 RGBA */
export function parseHex(hex: string): ParsedColor {
  const body = hex.replace('#', '')
  let r: number, g: number, b: number, a = 1
  if (body.length === 3) {
    r = parseInt(body[0]! + body[0]!, 16)
    g = parseInt(body[1]! + body[1]!, 16)
    b = parseInt(body[2]! + body[2]!, 16)
  } else if (body.length === 6) {
    r = parseInt(body.slice(0, 2), 16)
    g = parseInt(body.slice(2, 4), 16)
    b = parseInt(body.slice(4, 6), 16)
  } else if (body.length === 8) {
    a = parseInt(body.slice(0, 2), 16) / 255
    r = parseInt(body.slice(2, 4), 16)
    g = parseInt(body.slice(4, 6), 16)
    b = parseInt(body.slice(6, 8), 16)
  } else {
    throw new Error(`无法解析的十六进制色值：${hex}`)
  }
  return { r, g, b, a }
}

/** rgba() / rgb() 解析为 RGBA，alpha 默认 1 */
export function parseRgba(raw: string): ParsedColor {
  const match = /^rgba?\(\s*([^)]+)\)$/.exec(raw)
  if (!match) throw new Error(`无法解析的颜色表达式：${raw}`)
  const parts = match[1]!.split(',').map((p) => p.trim())
  const [r, g, b, a = '1'] = parts
  return {
    r: clamp255(Number(r)),
    g: clamp255(Number(g)),
    b: clamp255(Number(b)),
    a: Number(a),
  }
}

export function parseColor(value: string): ParsedColor {
  const v = value.trim()
  if (v.startsWith('#')) return parseHex(v)
  if (v.startsWith('rgb')) return parseRgba(v)
  throw new Error(`不支持的颜色格式（仅接受十六进制与 rgba）：${v}`)
}

export function parseDimension(value: string): ParsedDimension {
  const match = /^(\d+(?:\.\d+)?)(px|%)$/.exec(value.trim())
  if (!match) throw new Error(`无法解析的尺寸值：${value}`)
  return { value: Number(match[1]), unit: match[2] as 'px' | '%' }
}

export function parseDuration(value: string): ParsedDuration {
  const match = /^(\d+(?:\.\d+)?)(s|ms)$/.exec(value.trim())
  if (!match) throw new Error(`无法解析的时长值：${value}`)
  const n = Number(match[1])
  return { ms: match[2] === 's' ? n * 1000 : n }
}

export function parseShadow(value: string): ParsedShadow {
  const parts = value.trim().split(/\s+/)
  if (parts.length < 4) throw new Error(`投影值字段不足：${value}`)
  const x = Number(parts[0]!.replace('px', ''))
  const y = Number(parts[1]!.replace('px', ''))
  const blur = Number(parts[2]!.replace('px', ''))
  const rest = parts.slice(3)
  let spread: number | undefined
  // 第 4 段若为长度则是扩展量，否则为颜色
  if (rest.length > 1 && /^-?\d+(\.\d+)?px$/.test(rest[0]!)) {
    spread = Number(rest[0]!.replace('px', ''))
    rest.shift()
  }
  return { x, y, blur, spread, color: parseColor(rest.join(' ')) }
}

function clamp255(n: number): number {
  if (n < 0 || n > 255 || Number.isNaN(n)) throw new Error(`颜色通道超出范围：${n}`)
  return n
}

/** 根据类型断言中性值合法，并返回归一化后的值（供 schema 之外的语义校验） */
export function assertTypedValue(type: TokenType, value: TokenValue): void {
  switch (type) {
    case 'color':
      if (typeof value !== 'string') throw new Error(`color 令牌须为字符串：${String(value)}`)
      parseColor(value)
      return
    case 'dimension':
      if (typeof value !== 'string') throw new Error(`dimension 令牌须为字符串：${String(value)}`)
      parseDimension(value)
      return
    case 'duration':
      if (typeof value !== 'string') throw new Error(`duration 令牌须为字符串：${String(value)}`)
      parseDuration(value)
      return
    case 'shadow':
      if (typeof value !== 'string') throw new Error(`shadow 令牌须为字符串：${String(value)}`)
      parseShadow(value)
      return
    case 'cubicBezier':
      if (!Array.isArray(value) || value.length !== 4 || value.some((n) => typeof n !== 'number'))
        throw new Error(`cubicBezier 令牌须为 4 数字数组：${String(value)}`)
      return
    case 'number':
    case 'string':
      return
  }
}

// ============================== 格式化 ==============================

/** ARGB 十六进制字面量（0xAARRGGBB），供 Kotlin / C 使用 */
export function toArgbHex(c: ParsedColor): string {
  const aa = Math.round(c.a * 255)
  const rr = c.r.toString(16).padStart(2, '0')
  const gg = c.g.toString(16).padStart(2, '0')
  const bb = c.b.toString(16).padStart(2, '0')
  return `0x${aa.toString(16).padStart(2, '0').toUpperCase()}${rr.toUpperCase()}${gg.toUpperCase()}${bb.toUpperCase()}`
}

/** #AARRGGBB 字符串，供 ArkTS 使用 */
export function toArgbHash(c: ParsedColor): string {
  return toArgbHex(c).replace('0x', '#')
}

export function toNormalizedRgb(c: ParsedColor): { r: number; g: number; b: number; a: number } {
  return { r: round(c.r / 255), g: round(c.g / 255), b: round(c.b / 255), a: round(c.a) }
}

/** 字号类令牌用 sp，其余尺寸用 dp（Android 专用判定） */
export function usesSp(path: string): boolean {
  return /fontsize/i.test(path)
}

function round(n: number, digits = 3): number {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

/** 按类型把中性值结构化，供各 target 自行格式化 */
export function structureValue(token: ResolvedToken):
  | { kind: 'color'; color: ParsedColor }
  | { kind: 'dimension'; dimension: ParsedDimension }
  | { kind: 'duration'; duration: ParsedDuration }
  | { kind: 'shadow'; shadow: ParsedShadow }
  | { kind: 'cubicBezier'; bezier: number[] }
  | { kind: 'number'; number: number }
  | { kind: 'string'; string: string } {
  switch (token.type) {
    case 'color':
      return { kind: 'color', color: parseColor(String(token.value)) }
    case 'dimension':
      return { kind: 'dimension', dimension: parseDimension(String(token.value)) }
    case 'duration':
      return { kind: 'duration', duration: parseDuration(String(token.value)) }
    case 'shadow':
      return { kind: 'shadow', shadow: parseShadow(String(token.value)) }
    case 'cubicBezier':
      return { kind: 'cubicBezier', bezier: token.value as number[] }
    case 'number':
      return { kind: 'number', number: token.value as number }
    case 'string':
      return { kind: 'string', string: token.value as string }
  }
}
