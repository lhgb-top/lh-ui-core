/**
 * 把扁平的 path -> ResolvedToken 构造成嵌套树，供各 target 按命名空间层级输出。
 *
 * color.primary.default =>
 *   { name: 'color', children: [ { name: 'primary', children: [ { name: 'default', token } ] } ] }
 */

import type { ResolvedToken } from './types'

export interface TokenTreeGroup {
  name: string
  /** 分组下的直接令牌（按原名保留） */
  tokens: { name: string; token: ResolvedToken }[]
  /** 子分组 */
  children: TokenTreeGroup[]
}

export function buildTokenTree(tokens: ResolvedToken[]): TokenTreeGroup[] {
  const root: TokenTreeGroup = { name: '', tokens: [], children: [] }
  for (const token of tokens) {
    const segments = token.path.split('.')
    insert(root, segments, token, 0)
  }
  return root.children
}

function insert(group: TokenTreeGroup, segments: string[], token: ResolvedToken, depth: number): void {
  const name = segments[depth]!
  if (depth === segments.length - 1) {
    group.tokens.push({ name, token })
    return
  }
  let child = group.children.find((c) => c.name === name)
  if (!child) {
    child = { name, tokens: [], children: [] }
    group.children.push(child)
  }
  insert(child, segments, token, depth + 1)
}

/** 组名转 PascalCase（Kotlin object / Swift enum 命名） */
export function pascalCase(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}
