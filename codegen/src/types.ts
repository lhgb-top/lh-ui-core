/**
 * 令牌类型定义（构建期工具链内部，不进入任何运行时产物）
 */

/** 令牌类型枚举，与 tokens/schema.json 的 tokenType 一一对应 */
export type TokenType =
  | 'color'
  | 'dimension'
  | 'number'
  | 'string'
  | 'shadow'
  | 'duration'
  | 'cubicBezier'

/** 令牌的中性值类型 */
export type TokenValue = string | number | number[]

/** JSON 源文件中的叶子令牌（schema 中 token 节点的直接映射） */
export interface RawToken {
  value?: TokenValue
  ref?: string
  type?: TokenType
  description?: string
  nativeOnly?: boolean
}

/** 解析后的令牌：路径唯一，ref 已烘焙为字面值 */
export interface ResolvedToken {
  /** 点路径，如 color.primary.default */
  path: string
  type: TokenType
  /** 烘焙后的字面值 */
  value: TokenValue
  /** 若由 ref 解析而来，记录原始引用路径（含间接链） */
  refChain?: string[]
  description?: string
  nativeOnly?: boolean
}

/** 已解析的暗色覆盖：path -> 值 */
export type DarkOverrides = Map<string, TokenValue>

/** codegen 输入：解析后的明色令牌集 + 暗色覆盖 */
export interface TokenSet {
  tokens: ResolvedToken[]
  /** 按路径快速查找 */
  byPath: Map<string, ResolvedToken>
  dark: DarkOverrides
}

/** 组件契约（specs/*.json 的类型映射） */
export interface ComponentSpec {
  name: string
  component: string
  since?: string
  description: string
  props: SpecProp[]
  events?: SpecEvent[]
  slots?: SpecSlot[]
  behaviors?: string[]
  tokenRefs?: string[]
}

export interface SpecProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'tokenRef' | 'node' | 'array'
  values?: string[]
  default?: unknown
  required?: boolean
  description: string
}

export interface SpecEvent {
  name: string
  payload?: { name: string; type: SpecProp['type']; description?: string }[]
  description: string
}

export interface SpecSlot {
  name: string
  description: string
}

/** 黄金用例（cases/*.json 的类型映射） */
export interface ComponentCases {
  component: string
  cases: GoldenCase[]
}

export interface GoldenCase {
  id: string
  name: string
  given: { props?: Record<string, unknown>; state?: Record<string, unknown> }
  when: {
    action: 'render' | 'click' | 'input' | 'focus' | 'blur' | 'custom'
    target?: string
    payload?: unknown
  }
  then: {
    events?: { name: string; assertion: 'emitted' | 'notEmitted'; times?: number; payload?: unknown }[]
    tokens?: { path: string; applied: boolean }[]
    visible?: boolean
    enabled?: boolean
    text?: string
    notes?: string
  }
}

/** 单个 codegen target 的产物描述 */
export interface GeneratedFile {
  /** 相对 dist/<platform>/ 的输出路径 */
  relativePath: string
  content: string
}

export interface CodegenTarget {
  name: string
  /** dist 下的子目录名 */
  outDir: string
  generate(input: CodegenInput): GeneratedFile[]
}

export interface CodegenInput {
  tokens: TokenSet
  specs: ComponentSpec[]
  cases: ComponentCases[]
  version: string
}
