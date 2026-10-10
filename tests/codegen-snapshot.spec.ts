/**
 * 快照测试：四端产物逐字比对。
 *
 * 首次运行自动生成快照；此后令牌或模板改动导致产物变化时，vitest 会报差异，
 * 确认无误后 `pnpm test -- -u` 更新快照。快照即契约，防止 codegen 静默回归。
 */

import { describe, expect, it } from 'vitest'
import { loadCases, loadSpecs, loadTokenFiles, readVersion } from '../codegen/src/load'
import { resolveTokens } from '../codegen/src/resolve'
import type { CodegenInput } from '../codegen/src/types'
import { androidTarget } from '../codegen/src/targets/android'
import { cTarget } from '../codegen/src/targets/c'
import { docsTarget } from '../codegen/src/targets/docs'
import { harmonyTarget } from '../codegen/src/targets/harmony'
import { iosTarget } from '../codegen/src/targets/ios'

function buildInput(): CodegenInput {
  const { tokenSet } = resolveTokens(loadTokenFiles())
  return {
    tokens: tokenSet,
    specs: loadSpecs(),
    cases: loadCases(),
    version: readVersion(),
  }
}

describe('codegen 产物快照', () => {
  it('android（Kotlin）', async () => {
    for (const file of androidTarget.generate(buildInput())) {
      await expect(file.content).toMatchFileSnapshot(`./snapshots/android/${file.relativePath}.snap`)
    }
  })

  it('ios（Swift）', async () => {
    for (const file of iosTarget.generate(buildInput())) {
      await expect(file.content).toMatchFileSnapshot(`./snapshots/ios/${file.relativePath}.snap`)
    }
  })

  it('harmony（ArkTS）', async () => {
    for (const file of harmonyTarget.generate(buildInput())) {
      await expect(file.content).toMatchFileSnapshot(`./snapshots/harmony/${file.relativePath}.snap`)
    }
  })

  it('c（头文件）', async () => {
    for (const file of cTarget.generate(buildInput())) {
      await expect(file.content).toMatchFileSnapshot(`./snapshots/c/${file.relativePath}.snap`)
    }
  })

  it('docs（速查表与 JSON 快照）', async () => {
    for (const file of docsTarget.generate(buildInput())) {
      await expect(file.content).toMatchFileSnapshot(`./snapshots/docs/${file.relativePath}.snap`)
    }
  })
})

describe('codegen 产物不变式', () => {
  it('产物中不含任何 JavaScript 运行时代码', () => {
    const input = buildInput()
    const allFiles = [
      ...androidTarget.generate(input),
      ...iosTarget.generate(input),
      ...harmonyTarget.generate(input),
      ...cTarget.generate(input),
    ]
    for (const file of allFiles) {
      expect(file.content).not.toMatch(/\brequire\s*\(/)
      expect(file.content).not.toMatch(/\bmodule\.exports\b/)
      expect(file.content).not.toMatch(/import\s+.*\s+from\s+['"]/)
    }
  })

  it('每个文件都带生成器头部注释', () => {
    const input = buildInput()
    const allFiles = [
      ...androidTarget.generate(input),
      ...iosTarget.generate(input),
      ...harmonyTarget.generate(input),
      ...cTarget.generate(input),
    ]
    for (const file of allFiles) {
      expect(file.content).toContain('@lh-ui/core')
      expect(file.content).toContain('请勿手改')
    }
  })
})
