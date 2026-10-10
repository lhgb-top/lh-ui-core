import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts', 'codegen/tests/**/*.spec.ts'],
    // 单 fork 跑全部用例：快照写盘为串行 IO，多线程隔离收益小且在本机内存紧张时易崩
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
})
