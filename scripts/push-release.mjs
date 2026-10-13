/**
 * 把 master 与本次发版的 tag 推到 GitHub，触发 release.yml 自动留档。
 *
 * core 是构建期工具链包（private:true，当前不发布 npm），不跑 changeset
 * publish，发版 tag 没有现成创建者，由本脚本直接打。tag 格式沿用 npm 仓的
 * `@lh-ui/core@<版本>`（core 属工具链包，见 docs/发包流程.md §十一）。
 *
 * 只推 GitHub（remote: github-lhgb）。Gitee 的 tag 与发行版统一由
 * release.yml 接管，避免本地/CI 双写冲突。
 *
 * 用法：pnpm release:push
 *      pnpm release:push -- --dry-run（只打印命令不执行，发版前自检）
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgPath = path.resolve(__dirname, '..', 'package.json')

const dryRun = process.argv.includes('--dry-run')

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const tag = `${pkg.name}@${pkg.version}`
const remote = 'github-lhgb'

const run = (command) => {
  console.log(`$ ${command}`)
  if (dryRun) return
  execFileSync(command, { stdio: 'inherit', shell: true })
}

// tag 若已存在（重跑场景）直接复用，不重复打
let tagExists = false
try {
  execFileSync('git', ['rev-parse', '--verify', `refs/tags/${tag}`], { stdio: 'ignore' })
  tagExists = true
} catch {
  tagExists = false
}
if (!tagExists) {
  run(`git tag -a ${tag} -m "release: ${tag}"`)
}

run(`git push ${remote} master`)
run(`git push ${remote} ${tag}`)

console.log(`
✅${dryRun ? '（dry-run，未实际执行）' : ''} 已推送 ${tag} 到 GitHub。
GitHub Actions 将自动创建发行版（挂源码 zip），随后同步 tag 与发行版到 Gitee。
跟踪进度：https://github.com/lhgb-top/lh-ui-core/actions`)
