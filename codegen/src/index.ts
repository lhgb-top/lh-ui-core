/**
 * codegen CLI 编排入口：装载 -> 解析 -> 逐 target 生成 -> 写入 dist/。
 *
 * 只生成令牌骨架，不生成任何 UI 实现（见 AGENTS.md 红线 1）。
 */

import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { resolve as resolvePath } from 'node:path'
import { loadCases, loadSpecs, loadTokenFiles, readVersion } from './load'
import { resolveTokens } from './resolve'
import type { CodegenInput, CodegenTarget } from './types'
import { androidTarget } from './targets/android'
import { docsTarget } from './targets/docs'
import { harmonyTarget } from './targets/harmony'
import { iosTarget } from './targets/ios'
import { windowsTarget } from './targets/windows'

const ROOT = resolvePath(import.meta.dirname, '..', '..')
const DIST = resolvePath(ROOT, 'dist')

const targets: CodegenTarget[] = [androidTarget, iosTarget, harmonyTarget, windowsTarget, docsTarget]

function main(): void {
  const version = readVersion()
  const files = loadTokenFiles()
  const { tokenSet } = resolveTokens(files)
  const specs = loadSpecs()
  const cases = loadCases()

  const input: CodegenInput = { tokens: tokenSet, specs, cases, version }

  if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true })
  mkdirSync(DIST, { recursive: true })

  let fileCount = 0
  for (const target of targets) {
    const outDir = resolvePath(DIST, target.outDir)
    const generated = target.generate(input)
    for (const file of generated) {
      const filePath = resolvePath(outDir, file.relativePath)
      mkdirSync(resolvePath(filePath, '..'), { recursive: true })
      writeFileSync(filePath, file.content, 'utf-8')
      fileCount++
      console.log(`  [${target.name}] ${target.outDir}/${file.relativePath}`)
    }
  }

  console.log(`\ncodegen 完成：${targets.length} 个 target，${fileCount} 个文件，版本 v${version}`)
}

main()
