/**
 * 令牌引用解析与暗色合并。
 *
 * - 把各 token 文件折叠为单一 path -> ResolvedToken 映射
 * - 静态解析 ref（含间接链与环检测），将引用烘焙为字面值
 * - 应用暗色覆盖，产出明色令牌集 + 暗色覆盖表
 */

import type { LoadedTokenFile } from './load'
import { assertTypedValue } from './format'
import type { DarkOverrides, ResolvedToken, TokenSet, TokenValue, TokenType } from './types'

export interface ResolveResult {
  tokenSet: TokenSet
  /** 暗色文件中出现、但明色集里不存在的路径（verify 报告用） */
  orphanDarkPaths: string[]
  /** 解析出的引用关系（path -> 原始 ref 字符串），供文档与校验使用 */
  refMap: Map<string, string>
}

export function resolveTokens(files: LoadedTokenFile[]): ResolveResult {
  const lightFiles = files.filter((f) => !f.isDark)
  const darkFiles = files.filter((f) => f.isDark)

  // 1) 折叠所有明色文件为一个 path -> {raw, fileDefaultType} 映射
  const rawMap = new Map<
    string,
    {
      token: ResolvedToken
      raw: string | number | number[] | undefined
      ref?: string
      /** 叶子自身声明的 type（区别于文件级默认，ref 继承时需区分） */
      ownType?: TokenType
    }
  >()
  for (const file of lightFiles) {
    for (const [path, raw] of file.flat) {
      if (rawMap.has(path)) throw new Error(`令牌路径重复定义：${path}（文件 ${file.fileName}）`)
      rawMap.set(path, {
        token: {
          path,
          type: raw.type ?? (file.defaultType as ResolvedToken['type']),
          value: raw.value as TokenValue,
          description: raw.description,
          nativeOnly: raw.nativeOnly,
        },
        raw: raw.value,
        ref: raw.ref,
        ownType: raw.type,
      })
    }
  }

  const refMap = new Map<string, string>()

  // 2) 解析 ref：沿引用链走到字面值，烘焙进 token.value；同时把目标的类型带给引用方
  function resolveRef(path: string, chain: string[]): { value: TokenValue; type?: TokenType } {
    const entry = rawMap.get(path)
    if (!entry) throw new Error(`引用的令牌不存在：${path}`)
    if (entry.ref) {
      if (chain.includes(path)) {
        throw new Error(`检测到令牌引用环：${[...chain, path].join(' -> ')}`)
      }
      return resolveRef(entry.ref, [...chain, path])
    }
    return { value: entry.token.value, type: entry.token.type }
  }

  const tokens: ResolvedToken[] = []
  for (const [path, entry] of rawMap) {
    let value: TokenValue
    if (entry.ref) {
      refMap.set(path, entry.ref)
      const resolved = resolveRef(entry.ref, [path])
      value = resolved.value
      entry.token.value = value
      entry.token.refChain = [entry.ref]
      // 自身未声明类型时，沿用引用目标的类型（令牌类型随真源走）
      if (entry.ownType === undefined && resolved.type !== undefined) {
        entry.token.type = resolved.type
      }
    } else {
      value = entry.token.value
    }
    if (entry.token.type === undefined) {
      throw new Error(`令牌 ${path} 缺少类型（既无自身 type 也无文件级 $type）`)
    }
    assertTypedValue(entry.token.type, value)
    tokens.push(entry.token)
  }

  tokens.sort((a, b) => a.path.localeCompare(b.path))
  const byPath = new Map(tokens.map((t) => [t.path, t]))

  // 3) 暗色覆盖：暗色文件只声明需要覆盖的键，值替换到覆盖表
  const dark: DarkOverrides = new Map()
  const orphanDarkPaths: string[] = []
  for (const file of darkFiles) {
    for (const [path, raw] of file.flat) {
      let value: TokenValue
      if (raw.ref) {
        if (!byPath.has(raw.ref) && !rawMap.has(raw.ref)) {
          throw new Error(`暗色令牌 ${path} 引用不存在：${raw.ref}`)
        }
        value = resolveRef(raw.ref, [path]).value
        refMap.set(`dark:${path}`, raw.ref)
      } else {
        value = raw.value as TokenValue
      }
      const type = raw.type ?? byPath.get(path)?.type
      if (!type) {
        orphanDarkPaths.push(path)
        continue
      }
      assertTypedValue(type, value)
      if (!byPath.has(path)) orphanDarkPaths.push(path)
      dark.set(path, value)
    }
  }

  return { tokenSet: { tokens, byPath, dark }, orphanDarkPaths, refMap }
}
