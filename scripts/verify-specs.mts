/**
 * 规范校验：组件契约（spec）与黄金用例（cases）的一致性检查。
 *
 * - cases 的 component 必须存在同名 spec
 * - cases.given.props 的键必须存在于 spec.props
 * - cases.then.events 的名称必须存在于 spec.events
 * - cases.then.tokens 的路径必须存在于令牌集
 * - spec.tokenRefs 的路径必须存在于令牌集
 * - 同一组件的 case id 不得重复
 */

import { loadCases, loadSpecs, loadTokenFiles, readVersion } from '../codegen/src/load'
import { resolveTokens } from '../codegen/src/resolve'

function main(): void {
  const errors: string[] = []

  const { tokenSet } = resolveTokens(loadTokenFiles())
  const specs = loadSpecs()
  const cases = loadCases()

  const specByName = new Map(specs.map((s) => [s.name, s]))
  const caseFilesByComponent = new Map<string, Set<string>>()

  for (const caseFile of cases) {
    const spec = specByName.get(caseFile.component)
    if (!spec) {
      errors.push(`黄金用例 ${caseFile.component} 没有对应的组件契约`)
      continue
    }

    const propNames = new Set(spec.props.map((p) => p.name))
    const eventNames = new Set((spec.events ?? []).map((e) => e.name))
    const seenIds = caseFilesByComponent.get(caseFile.component) ?? new Set<string>()

    for (const c of caseFile.cases) {
      if (seenIds.has(c.id)) {
        errors.push(`${caseFile.component}：重复的 case id「${c.id}」`)
      }
      seenIds.add(c.id)

      for (const key of Object.keys(c.given.props ?? {})) {
        if (!propNames.has(key)) {
          errors.push(`${caseFile.component} / case「${c.id}」：given.props 引用了不存在的 prop「${key}」`)
        }
      }
      for (const ev of c.then.events ?? []) {
        if (!eventNames.has(ev.name)) {
          errors.push(`${caseFile.component} / case「${c.id}」：断言了不存在的事件「${ev.name}」`)
        }
      }
      for (const t of c.then.tokens ?? []) {
        if (!tokenSet.byPath.has(t.path)) {
          errors.push(`${caseFile.component} / case「${c.id}」：引用了不存在的令牌「${t.path}」`)
        }
      }
    }
    caseFilesByComponent.set(caseFile.component, seenIds)
  }

  for (const spec of specs) {
    const caseFile = cases.find((c) => c.component === spec.name)
    if (!caseFile) {
      console.log(`⚠️  组件 ${spec.name} 有契约但无黄金用例（建议补齐 cases/${spec.name}.json）`)
    }
    for (const ref of spec.tokenRefs ?? []) {
      if (!tokenSet.byPath.has(ref)) {
        errors.push(`契约 ${spec.name}：tokenRefs 引用了不存在的令牌「${ref}」`)
      }
    }
  }

  if (errors.length > 0) {
    for (const e of errors) console.error(`❌ ${e}`)
    console.error(`\n规范校验失败：${errors.length} 个错误（@lh-ui/core v${readVersion()}）`)
    process.exitCode = 1
    return
  }
  console.log(`✅ 规范校验通过：${specs.length} 份契约、${cases.length} 份用例（@lh-ui/core v${readVersion()}）`)
}

main()
