/**
 * 装载 tokens/ 与 specs/ 与 cases/ 的 JSON 文件，并用 JSON Schema 做结构校验。
 *
 * 语义校验（类型与值匹配、引用完整性）在 resolve.ts 与 scripts/verify-*.mts 中完成。
 */

import { readFileSync, readdirSync } from 'node:fs'
import { resolve as resolvePath } from 'node:path'
import Ajv from 'ajv/dist/2020.js'
import type { ErrorObject } from 'ajv'
import type { ComponentCases, ComponentSpec, RawToken, TokenType } from './types'

const ROOT = resolvePath(import.meta.dirname, '..', '..')

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf-8')) as T
}

function listJsonFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== 'schema.json')
    .sort()
    .map((f) => resolvePath(dir, f))
}

export interface LoadedTokenFile {
  fileName: string
  /** 令牌点路径的命名空间前缀（如 color / radius / zIndex；空串表示顶层键即命名空间） */
  namespace: string
  isDark: boolean
  defaultType?: TokenType
  description?: string
  /** path -> RawToken（已折叠，含命名空间前缀） */
  flat: Map<string, RawToken>
}

/**
 * 文件名推导命名空间：z-index.json → zIndex，color-dark.json → colorDark。
 * 暗色文件通常显式声明 $namespace 与明色文件对齐，此函数只做兜底。
 */
function namespaceFromFileName(fileName: string): string {
  const stem = fileName.replace(/\.json$/, '')
  return stem
    .split('-')
    .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('')
}

/**
 * 折叠嵌套令牌为扁平映射。
 *
 * 类型继承：分组（含文件根）声明的 `$type` 会向下传递，**仅烤进字面量叶子**
 * （有 ref 的叶子不烤，其类型由 resolve 阶段从引用目标继承，避免被分组默认类型误导）。
 */
function flatten(
  obj: Record<string, unknown>,
  prefix: string,
  out: Map<string, RawToken>,
  inheritedType?: TokenType,
): void {
  const groupType = (obj.$type as TokenType | undefined) ?? inheritedType
  for (const [key, node] of Object.entries(obj)) {
    if (key.startsWith('$')) continue
    const path = prefix ? `${prefix}.${key}` : key
    if (isRawToken(node)) {
      // 字面量令牌继承分组类型；ref 令牌保留 undefined，交给 resolve 向引用目标取类型
      if (node.type === undefined && node.ref === undefined && groupType !== undefined) {
        out.set(path, { ...node, type: groupType })
      } else {
        out.set(path, node)
      }
    } else if (node && typeof node === 'object') {
      flatten(node as Record<string, unknown>, path, out, groupType)
    } else {
      throw new Error(`令牌路径 ${path} 既不是叶子令牌也不是分组`)
    }
  }
}

function isRawToken(node: unknown): node is RawToken {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return 'value' in n || 'ref' in n
}

export function loadTokenFiles(tokensDir = resolvePath(ROOT, 'tokens')): LoadedTokenFile[] {
  const schema = readJson<object>(resolvePath(tokensDir, 'schema.json'))
  const ajv = new Ajv({ allErrors: true, strict: false })
  const validate = ajv.compile(schema)

  const files: LoadedTokenFile[] = []
  for (const filePath of listJsonFiles(tokensDir)) {
    const fileName = resolvePath(filePath).split(/[\\/]/).pop()!
    const raw = readJson<Record<string, unknown>>(filePath)
    if (!validate(raw)) {
      const messages = formatErrors(validate.errors ?? [])
      throw new Error(`令牌文件校验失败：${filePath}\n${messages}`)
    }
    const flat = new Map<string, RawToken>()
    const namespace =
      typeof raw.$namespace === 'string' ? raw.$namespace : namespaceFromFileName(fileName)
    flatten(raw, namespace, flat)
    files.push({
      fileName,
      namespace,
      isDark: raw.$dark === true,
      defaultType: raw.$type as TokenType | undefined,
      description: raw.$description as string | undefined,
      flat,
    })
  }
  return files
}

function formatErrors(errors: ErrorObject[]): string {
  return errors.map((e) => `  - ${e.instancePath || '(root)'} ${e.message}`).join('\n')
}

export function loadSpecs(specsDir = resolvePath(ROOT, 'specs')): ComponentSpec[] {
  const schema = readJson<object>(resolvePath(specsDir, 'schema.json'))
  const ajv = new Ajv({ allErrors: true, strict: false })
  const validate = ajv.compile(schema)

  const specs: ComponentSpec[] = []
  for (const filePath of listJsonFiles(specsDir)) {
    const raw = readJson<Record<string, unknown>>(filePath)
    if (!validate(raw)) {
      throw new Error(`组件契约校验失败：${filePath}\n${formatErrors(validate.errors ?? [])}`)
    }
    specs.push(raw as unknown as ComponentSpec)
  }
  return specs
}

export function loadCases(casesDir = resolvePath(ROOT, 'cases')): ComponentCases[] {
  const schema = readJson<object>(resolvePath(casesDir, 'schema.json'))
  const ajv = new Ajv({ allErrors: true, strict: false })
  const validate = ajv.compile(schema)

  const cases: ComponentCases[] = []
  for (const filePath of listJsonFiles(casesDir)) {
    const raw = readJson<Record<string, unknown>>(filePath)
    if (!validate(raw)) {
      throw new Error(`黄金用例校验失败：${filePath}\n${formatErrors(validate.errors ?? [])}`)
    }
    cases.push(raw as unknown as ComponentCases)
  }
  return cases
}

/** 读取本仓 package.json 版本号，作为产物头部注释的一部分 */
export function readVersion(): string {
  const pkg = readJson<{ version: string }>(resolvePath(ROOT, 'package.json'))
  return pkg.version
}
