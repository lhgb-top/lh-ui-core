/**
 * 单元测试：解析器、引用解析、暗色合并与各 target 的格式化。
 *
 * 快照测试（产物逐字比对）见 tests/codegen-snapshot.spec.ts。
 */

import { describe, expect, it } from 'vitest'
import {
  parseColor,
  parseDimension,
  parseDuration,
  parseShadow,
  structureValue,
  toArgbHex,
  toArgbHash,
  usesSp,
} from '../codegen/src/format'
import { resolveTokens } from '../codegen/src/resolve'
import { loadTokenFiles } from '../codegen/src/load'
import { csTokenPath } from '../codegen/src/targets/windows'

describe('format 解析', () => {
  it('解析十六进制色值', () => {
    expect(parseColor('#2B4C7C')).toEqual({ r: 0x2b, g: 0x4c, b: 0x7c, a: 1 })
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('#80FF0000')).toEqual({ r: 255, g: 0, b: 0, a: 0x80 / 255 })
  })

  it('解析 rgba', () => {
    expect(parseColor('rgba(0, 0, 0, 0.05)')).toEqual({ r: 0, g: 0, b: 0, a: 0.05 })
    expect(parseColor('rgb(255, 100, 50)')).toEqual({ r: 255, g: 100, b: 50, a: 1 })
  })

  it('拒绝不支持的色值格式', () => {
    expect(() => parseColor('var(--lh-primary)')).toThrow()
    expect(() => parseColor('hsl(0, 0%, 0%)')).toThrow()
  })

  it('解析尺寸与时长', () => {
    expect(parseDimension('4px')).toEqual({ value: 4, unit: 'px' })
    expect(parseDimension('50%')).toEqual({ value: 50, unit: '%' })
    expect(parseDuration('0.3s')).toEqual({ ms: 300 })
    expect(parseDuration('250ms')).toEqual({ ms: 250 })
  })

  it('解析投影复合值', () => {
    expect(parseShadow('0px 2px 12px 0px rgba(26, 26, 26, 0.08)')).toEqual({
      x: 0,
      y: 2,
      blur: 12,
      spread: 0,
      color: { r: 26, g: 26, b: 26, a: 0.08 },
    })
  })

  it('ARGB 十六进制输出', () => {
    expect(toArgbHex(parseColor('#2B4C7C'))).toBe('0xFF2B4C7C')
    expect(toArgbHash(parseColor('#2B4C7C'))).toBe('#FF2B4C7C')
    expect(toArgbHex(parseColor('rgba(0,0,0,0.05)'))).toBe('0x0D000000')
  })

  it('字号路径判定 sp', () => {
    expect(usesSp('typography.fontSize.base')).toBe(true)
    expect(usesSp('button.fontSize.medium')).toBe(true)
    expect(usesSp('button.height.medium')).toBe(false)
  })
})

describe('resolve 引用解析', () => {
  it('解析全部令牌文件并烘焙 ref', () => {
    const { tokenSet, orphanDarkPaths } = resolveTokens(loadTokenFiles())
    expect(tokenSet.tokens.length).toBeGreaterThan(0)

    // selected 由 ref 烘焙为 primary.active 的值
    const selected = tokenSet.byPath.get('color.selected')
    expect(selected?.value).toBe('#1F3A5F')
    expect(selected?.refChain).toEqual(['color.primary.active'])

    // 暗色覆盖存在且与明色不同
    expect(tokenSet.dark.get('color.primary.default')).toBe('#3D649E')
    expect(tokenSet.dark.get('color.background.default')).toBe('#2A2520')

    // 暗色所有路径都应能在明色集找到
    expect(orphanDarkPaths).toEqual([])
  })

  it('检测引用环', () => {
    expect(() =>
      resolveTokens([
        {
          fileName: 'a.json',
          namespace: 'a',
          isDark: false,
          defaultType: 'color',
          flat: new Map([
            ['a', { ref: 'b' }],
            ['b', { ref: 'a' }],
          ]),
        },
      ]),
    ).toThrow(/引用环/)
  })
})

describe('C# 令牌路径命名', () => {
  it('点路径转 PascalCase 嵌套路径', () => {
    expect(csTokenPath('color.primary.default')).toBe('LhTokens.Color.Primary.Default')
    expect(csTokenPath('button.fontSize.medium')).toBe('LhTokens.Button.FontSize.Medium')
  })
})

describe('structureValue 类型分发', () => {
  it('按类型结构化', () => {
    const { tokenSet } = resolveTokens(loadTokenFiles())
    const radius = structureValue(tokenSet.byPath.get('radius.round')!)
    expect(radius.kind).toBe('dimension')
    const z = structureValue(tokenSet.byPath.get('zIndex.modal')!)
    expect(z.kind).toBe('number')
    const ease = structureValue(tokenSet.byPath.get('motion.easing.easeInOut')!)
    expect(ease.kind).toBe('cubicBezier')
  })
})
