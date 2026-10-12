// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dist-toolkit/**',
      'node_modules/**',
      'coverage/**',
      // Astro 生成的类型与缓存目录（构建产物，不归 eslint 管）
      '.astro/**',
      'docs/.astro/**',
      'docs/dist/**',
      // docs 站点是 .astro / .mdx，不归 eslint 管，类型检查交给 astro check
      'docs/src/**',
      'docs/astro.config.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      // 全仓都是 Node 工具链脚本/测试，统一声明 Node 全局
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
)
