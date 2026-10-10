/**
 * 本地令牌联动（家族统一机制）。
 *
 * 家族布局下（各仓同父目录），原生仓本地开发时通过本脚本解析到同级的 lh-ui-core/dist 产物，
 * 改令牌重跑 `pnpm codegen` 即时生效，无需发包。兄弟仓不存在时（CI 单仓 clone）返回空，
 * 调用方自动回退到各平台的已发包。机制与 web 血脉的 createLocalShareAliases 同构。
 *
 * 用法（各原生仓的构建脚本调用）：
 *   node ./scripts/resolve-local-tokens.mjs          # 打印本地 dist 绝对路径，不存在时退出码 1
 *   node ./scripts/resolve-local-tokens.mjs --json   # 输出 { found, distPath } 供脚本消费
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 查找同级的 lh-ui-core/dist 目录。
 * @param repoRoot 调用方仓库根目录（__dirname 的上两级）
 * @returns dist 绝对路径；不存在返回 null
 */
export function resolveLocalTokens(repoRoot) {
  const coreDist = resolve(repoRoot, '..', 'lh-ui-core', 'dist')
  // 存在性守卫：仅当令牌产物存在时才注入本地路径
  if (!existsSync(resolve(coreDist, 'android'))) return null
  return coreDist
}

function main() {
  const args = process.argv.slice(2)
  const asJson = args.includes('--json')
  // 调用方传入 --repo=<path>，缺省以 cwd 上退一级当作兄弟仓根
  const repoArg = args.find((a) => a.startsWith('--repo='))
  const repoRoot = repoArg ? resolve(repoArg.slice('--repo='.length)) : process.cwd()

  const distPath = resolveLocalTokens(repoRoot)

  if (asJson) {
    console.log(JSON.stringify({ found: distPath !== null, distPath }))
    return
  }
  if (!distPath) {
    console.error('本地 lh-ui-core/dist 未找到，回退到平台已发包')
    process.exitCode = 1
    return
  }
  console.log(distPath)
}

// 直接执行时跑 main；被 import 时只导出函数
import { pathToFileURL } from 'node:url'
const isDirect = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url
if (isDirect) main()
