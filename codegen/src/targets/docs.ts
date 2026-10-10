/**
 * 文档 target：产出令牌速查表（markdown）与令牌 JSON 快照，供家族文档站与各端对齐使用。
 */

import { structureValue } from '../format'
import type { CodegenInput, CodegenTarget, GeneratedFile, ResolvedToken } from '../types'

const HEADER = `<!-- 本文件由 @lh-ui/core 自动生成，请勿手改。源：@lh-ui/core tokens -->`

interface TokenRow {
  path: string
  type: string
  value: string
  dark?: string
  description?: string
  nativeOnly?: boolean
}

function literalValue(token: ResolvedToken): string {
  const structured = structureValue(token)
  switch (structured.kind) {
    case 'color':
      return `${String(token.value)} → ${structured.color.a < 1 ? `rgba(${structured.color.r}, ${structured.color.g}, ${structured.color.b}, ${structured.color.a})` : `#${structured.color.r.toString(16).padStart(2, '0')}${structured.color.g.toString(16).padStart(2, '0')}${structured.color.b.toString(16).padStart(2, '0')}`}`
    default:
      return String(token.value)
  }
}

function buildTokenTable(input: CodegenInput): string {
  const rows: TokenRow[] = input.tokens.tokens.map((token) => {
    const darkValue = input.tokens.dark.get(token.path)
    return {
      path: `\`${token.path}\``,
      type: token.type,
      value: literalValue(token),
      dark: darkValue !== undefined ? literalValue({ ...token, value: darkValue }) : undefined,
      description: token.description,
      nativeOnly: token.nativeOnly,
    }
  })

  const groups = new Map<string, TokenRow[]>()
  for (const row of rows) {
    const top = row.path.split('.')[0]!.replace('`', '')
    const list = groups.get(top) ?? []
    list.push(row)
    groups.set(top, list)
  }

  const sections: string[] = [HEADER, '', `# lh-ui 设计令牌速查（v${input.version}）`, '']
  for (const [groupName, list] of [...groups.entries()].sort()) {
    sections.push(`## ${groupName}`, '', '| 令牌 | 类型 | 明色 | 暗色 | 说明 |', '| --- | --- | --- | --- | --- |')
    for (const row of list) {
      const desc = [row.nativeOnly ? '原生新增' : null, row.description].filter(Boolean).join('；')
      sections.push(
        `| ${row.path} | ${row.type} | ${row.value} | ${row.dark ?? '—'} | ${desc} |`,
      )
    }
    sections.push('')
  }
  return sections.join('\n')
}

function buildDarkJson(input: CodegenInput): string {
  const obj = Object.fromEntries([...input.tokens.dark.entries()].sort(([a], [b]) => a.localeCompare(b)))
  return JSON.stringify(obj, null, 2)
}

export const docsTarget: CodegenTarget = {
  name: 'docs',
  outDir: 'docs',
  generate(input: CodegenInput): GeneratedFile[] {
    return [
      { relativePath: 'tokens.md', content: buildTokenTable(input) },
      {
        relativePath: 'tokens.light.json',
        content: JSON.stringify(
          Object.fromEntries(input.tokens.tokens.map((t) => [t.path, t.value])),
          null,
          2,
        ),
      },
      { relativePath: 'tokens.dark.json', content: buildDarkJson(input) },
    ]
  },
}
