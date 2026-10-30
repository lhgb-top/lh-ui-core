// =====================================================================================
// lh-ui-core 开发者文档站（Astro Starlight）。
//
// 家族约定：部署前缀 /lhui/core/（与 android / ios / harmony / windows 四站同体系），
// dev 端口 5185。base / sitemap / favicon 均由 Starlight 从 site + base 推导。
//
// 关键约定说明：
// - 站点根是 docs/：npm 脚本一律 `astro <cmd> --root docs`，本文件、src/、public/
//   都相对它解析。不传 --root 时 astro 会退回仓根，既找不到 src/pages，还会把产物
//   写进仓根 dist/——那是 codegen 令牌产物的目录（AGENTS.md 红线 6：dist/ 禁止手改），
//   而构建前的清空动作会直接删掉整个令牌包。
// - build.format: 'file' + starlight({ trailingSlash: 'never' })：产出 page.html 而非
//   page/index.html，与家族 nginx 的 `try_files $uri $uri.html $uri/` 契约同构
//   （VitePress 时代开 cleanUrls 的产出形态完全一致，部署侧零改动）。
// - outDir 显式指向 docs/dist（相对站点根）：Astro 默认输出 root/dist，与 codegen 的
//   仓根 dist/ 同名但站点根不同，实际落在 docs/dist，两者互不覆盖。
// - 侧边栏显式配置而非 autogenerate：后者按字母排序，无法保证「介绍」在分组最前。
// - 站点部署在 https://www.lhgb.top/lhui/core/，但 Starlight 0.42.6 的 hero 按钮与
//   Astro 的 markdown 正文链接都不会自动拼 base，只有侧边栏 / 分页 / 资源路径由框架
//   处理。下方 remarkBasePrefix 在构建期给内容里以 / 开头的站内链接（含图片与链接
//   定义）补上前缀，正文写绝对路径也不必关心 base。Astro 7 起 Sätteri 是默认
//   markdown 处理器：不再支持 markdown.remarkPlugins（会因缺少
//   @astrojs/markdown-remark 直接报错），mdast 插件要通过
//   processor: satteri({ mdastPlugins }) 显式传入；@astrojs/mdx 与 Starlight
//   都会复用这同一个 processor（Starlight 往其 options.mdastPlugins 追加自己的
//   插件），故对 .md 与 .mdx 内容页同时生效。
// =====================================================================================

import starlight from '@astrojs/starlight'
import { satteri } from '@astrojs/markdown-satteri'
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const base = '/lhui/core/'
const basePrefix = base.endsWith('/') ? base.slice(0, -1) : base

// Sätteri 插件按节点类型注册 visitor：返回新节点表示替换，不返回表示原样保留。
// node.url 只在是站内绝对路径（以 / 开头但非协议相对的 //）时才需要补前缀。
function rewriteSiteUrl(node) {
  const url = node.url
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) return
  // 根路径单独保留尾斜杠
  return { ...node, url: url === '/' ? base : basePrefix + url }
}

const basePrefixPlugin = {
  name: 'lh-base-prefix',
  link: rewriteSiteUrl,
  image: rewriteSiteUrl,
  definition: rewriteSiteUrl,
}

// 站点根（docs/）：内容目录为 src/content/docs/，语言子目录为 src/content/docs/<key>/。
// 内容门禁：目标语言的内容目录尚不存在时不注册该语言（切换器不展示空内容语言），
// 目录出现后自动失效（2026-10-15）。root 为中文真源，内容直接放内容目录根，始终保留。
const docsRoot = fileURLToPath(new URL('./', import.meta.url))
const STARLIGHT_LOCALES = {
  root: { label: '简体中文', lang: 'zh-CN' },
  en: { label: 'English', lang: 'en' },
  'zh-TW': { label: '繁體中文', lang: 'zh-TW' },
  ja: { label: '日本語', lang: 'ja' },
  ko: { label: '한국어', lang: 'ko' },
  es: { label: 'Español', lang: 'es' },
  ar: { label: 'العربية', lang: 'ar', dir: 'rtl' },
  fr: { label: 'Français', lang: 'fr' },
  ru: { label: 'Русский', lang: 'ru' },
}

function buildStarlightLocales() {
  return Object.fromEntries(
    Object.entries(STARLIGHT_LOCALES).filter(
      ([key]) => key === 'root' || existsSync(resolve(docsRoot, 'src/content/docs', key))
    )
  )
}

export default defineConfig({
  site: 'https://www.lhgb.top',
  base: '/lhui/core/',
  output: 'static',
  build: { format: 'file' },
  // Starlight 0.33 起由 Astro 顶层配置接管，不再写在 starlight() 里
  trailingSlash: 'never',
  outDir: 'dist',
  markdown: {
    processor: satteri({ mdastPlugins: [basePrefixPlugin] }),
  },
  integrations: [
    starlight({
      title: 'lh-ui-core',
      description:
        'lh-ui 原生血脉构建期中心 —— 设计令牌真源 + 组件契约 + 黄金用例 + 跨端 codegen',
      // 语言切换器用覆盖组件：切换改 location.replace，不入历史栈（2026-10-15）
      components: {
        LanguageSelect: './src/components/LanguageSelect.astro',
        // 页脚追加家族统一备案/版权行（数据来自 docs/.beian/beian.json 同步产物）
        Footer: './src/components/BeianFooter.astro',
      },
      // 多语言站：root 仍是中文真源（内容直接放 src/content/docs/ 根）。历史单语言时期
      // 的写法沿用至今——Starlight 的 transform 在单语言分支里会忽略 defaultLocale、
      // 只接受 locales.root，所以中文必须占 root 位，其余八语言内容放
      // src/content/docs/<key>/。界面文案（搜索 / 上一页 / 编辑此页等）由 Starlight
      // 内置翻译包按各 lang 接管，无需创建 src/content/i18n/*.json。
      // ar 显式写 dir: 'rtl'：Intl.Locale 虽能自动推导 RTL，显式声明可防环境差异。
      // 侧边栏分组与条目用原生 translations 字段做 i18n，key 就是各语言的 lang 值，
      // label 保留中文作兜底——官方推荐做法，不复制整份 sidebar（术语沿用
      // lh-ui-android/docs/.vitepress/config.ts 与 docs/i18n/glossary.md）。
      locales: buildStarlightLocales(),
      logo: { src: './src/assets/logo.svg', alt: 'lh-ui-core' },
      favicon: '/favicon.svg',
      lastUpdated: true,
      // 站内搜索由 Pagefind 提供，默认开启；这里显式声明便于日后关闭或调参
      pagefind: true,
      customCss: ['./src/styles/custom.css'],
      // Starlight 0.33 起 social 改为链接数组，不再是按平台命名的对象
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/lhgb-top/lh-ui-core' }],
      sidebar: [
        {
          label: '指南',
          translations: {
            'zh-CN': '指南',
            en: 'Guide',
            'zh-TW': '指南',
            ja: 'ガイド',
            ko: '가이드',
            es: 'Guía',
            ar: 'دليل',
            fr: 'Guide',
            ru: 'Руководство',
          },
          items: [
            {
              label: '介绍',
              slug: 'guide/introduction',
              translations: {
                'zh-CN': '介绍',
                en: 'Introduction',
                'zh-TW': '介紹',
                ja: '紹介',
                ko: '소개',
                es: 'Introducción',
                ar: 'مقدمة',
                fr: 'Introduction',
                ru: 'Введение',
              },
            },
            {
              label: '目录结构',
              slug: 'guide/structure',
              translations: {
                'zh-CN': '目录结构',
                en: 'Directory Structure',
                'zh-TW': '目錄結構',
                ja: 'ディレクトリ構造',
                ko: '디렉터리 구조',
                es: 'Estructura de directorios',
                ar: 'بنية الدليل',
                fr: 'Structure des répertoires',
                ru: 'Структура каталогов',
              },
            },
            {
              label: '快速开始',
              slug: 'guide/quickstart',
              translations: {
                'zh-CN': '快速开始',
                en: 'Quick Start',
                'zh-TW': '快速開始',
                ja: 'クイックスタート',
                ko: '빠른 시작',
                es: 'Inicio rápido',
                ar: 'البدء السريع',
                fr: 'Démarrage rapide',
                ru: 'Быстрый старт',
              },
            },
            {
              label: '红线与命名规范',
              slug: 'guide/redlines',
              translations: {
                'zh-CN': '红线与命名规范',
                en: 'Red Lines & Naming Conventions',
                'zh-TW': '紅線與命名規範',
                ja: 'レッドラインと命名規則',
                ko: '레드라인 및 명명 규칙',
                es: 'Líneas rojas y convenciones de nombres',
                ar: 'الخطوط الحمراء واتفاقيات التسمية',
                fr: 'Lignes rouges et conventions de nommage',
                ru: 'Красные линии и соглашения об именовании',
              },
            },
            {
              label: '新增组件流程',
              slug: 'guide/new-component',
              translations: {
                'zh-CN': '新增组件流程',
                en: 'Adding a New Component',
                'zh-TW': '新增元件流程',
                ja: '新規コンポーネントの追加フロー',
                ko: '새 컴포넌트 추가 흐름',
                es: 'Flujo para añadir un componente',
                ar: 'مسار إضافة مكوّن جديد',
                fr: "Flux d'ajout d'un composant",
                ru: 'Процесс добавления компонента',
              },
            },
            {
              label: '本地联动',
              slug: 'guide/local-linking',
              translations: {
                'zh-CN': '本地联动',
                en: 'Local Linking',
                'zh-TW': '本地聯動',
                ja: 'ローカル連携',
                ko: '로컬 연결',
                es: 'Enlace local',
                ar: 'الربط المحلي',
                fr: 'Liaison locale',
                ru: 'Локальная линковка',
              },
            },
            {
              label: '命令清单',
              slug: 'guide/commands',
              translations: {
                'zh-CN': '命令清单',
                en: 'Commands',
                'zh-TW': '命令清單',
                ja: 'コマンド一覧',
                ko: '명령어 목록',
                es: 'Lista de comandos',
                ar: 'قائمة الأوامر',
                fr: 'Liste des commandes',
                ru: 'Список команд',
              },
            },
            {
              label: '文档站技术选型',
              slug: 'guide/tech-choice',
              translations: {
                'zh-CN': '文档站技术选型',
                en: 'Docs Site Tech Stack',
                'zh-TW': '文件站技術選型',
                ja: 'ドキュメントサイトの技術選定',
                ko: '문서 사이트 기술 선정',
                es: 'Elección tecnológica del sitio de documentación',
                ar: 'الاختيار التقني لموقع التوثيق',
                fr: 'Choix technologique du site de documentation',
                ru: 'Выбор технологий для сайта документации',
              },
            },
          ],
        },
        {
          label: '令牌',
          translations: {
            'zh-CN': '令牌',
            en: 'Tokens',
            'zh-TW': '令牌',
            ja: 'トークン',
            ko: '토큰',
            es: 'Tokens',
            ar: 'الرموز',
            fr: 'Jetons',
            ru: 'Токены',
          },
          items: [
            {
              label: '令牌格式',
              slug: 'tokens/token-format',
              translations: {
                'zh-CN': '令牌格式',
                en: 'Token Format',
                'zh-TW': '令牌格式',
                ja: 'トークンフォーマット',
                ko: '토큰 형식',
                es: 'Formato de tokens',
                ar: 'تنسيق الرموز',
                fr: 'Format des jetons',
                ru: 'Формат токенов',
              },
            },
            {
              label: '命名空间与点路径',
              slug: 'tokens/namespace',
              translations: {
                'zh-CN': '命名空间与点路径',
                en: 'Namespaces & Dot Paths',
                'zh-TW': '命名空間與點路徑',
                ja: '名前空間とドットパス',
                ko: '네임스페이스와 점 경로',
                es: 'Espacios de nombres y rutas con puntos',
                ar: 'مساحات الأسماء ومسارات النقاط',
                fr: 'Espaces de noms et chemins pointés',
                ru: 'Пространства имён и точечные пути',
              },
            },
            {
              label: '类型系统',
              slug: 'tokens/type-system',
              translations: {
                'zh-CN': '类型系统',
                en: 'Type System',
                'zh-TW': '類型系統',
                ja: '型システム',
                ko: '타입 시스템',
                es: 'Sistema de tipos',
                ar: 'نظام الأنواع',
                fr: 'Système de types',
                ru: 'Система типов',
              },
            },
            {
              label: '引用机制',
              slug: 'tokens/refs',
              translations: {
                'zh-CN': '引用机制',
                en: 'Reference Mechanism',
                'zh-TW': '引用機制',
                ja: '参照メカニズム',
                ko: '참조 메커니즘',
                es: 'Mecanismo de referencia',
                ar: 'آلية المرجعية',
                fr: 'Mécanisme de référence',
                ru: 'Механизм ссылок',
              },
            },
            {
              label: '暗色合并',
              slug: 'tokens/dark-mode',
              translations: {
                'zh-CN': '暗色合并',
                en: 'Dark Mode Merging',
                'zh-TW': '暗色合併',
                ja: 'ダークモードのマージ',
                ko: '다크 모드 병합',
                es: 'Fusión del modo oscuro',
                ar: 'دمج الوضع الداكن',
                fr: 'Fusion du mode sombre',
                ru: 'Слияние тёмного режима',
              },
            },
            // 参考页是 src/pages 下的 .astro（数据驱动），用 link 而非 slug 挂入
            {
              label: '令牌参考',
              link: '/tokens/reference',
              translations: {
                'zh-CN': '令牌参考',
                en: 'Token Reference',
                'zh-TW': '令牌參考',
                ja: 'トークンリファレンス',
                ko: '토큰 레퍼런스',
                es: 'Referencia de tokens',
                ar: 'مرجع الرموز',
                fr: 'Référence des jetons',
                ru: 'Справочник по токенам',
              },
            },
          ],
        },
        {
          label: '契约',
          translations: {
            'zh-CN': '契约',
            en: 'Contracts',
            'zh-TW': '契約',
            ja: '契約',
            ko: '계약',
            es: 'Contratos',
            ar: 'العقود',
            fr: 'Contrats',
            ru: 'Контракты',
          },
          items: [
            {
              label: '契约格式',
              slug: 'specs/spec-format',
              translations: {
                'zh-CN': '契约格式',
                en: 'Contract Format',
                'zh-TW': '契約格式',
                ja: '契約フォーマット',
                ko: '계약 형식',
                es: 'Formato de los contratos',
                ar: 'تنسيق العقد',
                fr: 'Format des contrats',
                ru: 'Формат контракта',
              },
            },
            {
              label: '组件契约参考',
              link: '/specs/reference',
              translations: {
                'zh-CN': '组件契约参考',
                en: 'Component Contract Reference',
                'zh-TW': '元件契約參考',
                ja: 'コンポーネント契約リファレンス',
                ko: '컴포넌트 계약 레퍼런스',
                es: 'Referencia de contratos de componentes',
                ar: 'مرجع عقود المكوّنات',
                fr: 'Référence des contrats de composants',
                ru: 'Справочник по контрактам компонентов',
              },
            },
          ],
        },
        {
          label: '用例',
          translations: {
            'zh-CN': '用例',
            en: 'Cases',
            'zh-TW': '用例',
            ja: 'ケース',
            ko: '케이스',
            es: 'Casos',
            ar: 'الحالات',
            fr: 'Cas',
            ru: 'Сценарии',
          },
          items: [
            {
              label: '用例格式',
              slug: 'cases/case-format',
              translations: {
                'zh-CN': '用例格式',
                en: 'Case Format',
                'zh-TW': '用例格式',
                ja: 'ケースフォーマット',
                ko: '케이스 형식',
                es: 'Formato de los casos',
                ar: 'تنسيق الحالات',
                fr: 'Format des cas',
                ru: 'Формат сценариев',
              },
            },
            {
              label: '黄金用例参考',
              link: '/cases/reference',
              translations: {
                'zh-CN': '黄金用例参考',
                en: 'Golden Case Reference',
                'zh-TW': '黃金用例參考',
                ja: 'ゴールデンケースリファレンス',
                ko: '골든 케이스 레퍼런스',
                es: 'Referencia de casos dorados',
                ar: 'مرجع الحالات الذهبية',
                fr: 'Référence des cas dorés',
                ru: 'Справочник по золотым сценариям',
              },
            },
          ],
        },
        {
          label: '工具链',
          translations: {
            'zh-CN': '工具链',
            en: 'Toolchain',
            'zh-TW': '工具鏈',
            ja: 'ツールチェーン',
            ko: '툴체인',
            es: 'Cadena de herramientas',
            ar: 'سلسلة الأدوات',
            fr: "Chaîne d'outils",
            ru: 'Инструментарий',
          },
          items: [
            {
              label: '管线总览',
              slug: 'codegen/pipeline',
              translations: {
                'zh-CN': '管线总览',
                en: 'Pipeline Overview',
                'zh-TW': '管線總覽',
                ja: 'パイプライン概要',
                ko: '파이프라인 개요',
                es: 'Visión general del pipeline',
                ar: 'نظرة عامة على خط المعالجة',
                fr: "Vue d'ensemble du pipeline",
                ru: 'Обзор конвейера',
              },
            },
            {
              label: '装载层 load.ts',
              slug: 'codegen/load',
              translations: {
                'zh-CN': '装载层 load.ts',
                en: 'Loading Layer — load.ts',
                'zh-TW': '裝載層 load.ts',
                ja: '読み込み層 load.ts',
                ko: '적재 계층 load.ts',
                es: 'Capa de carga load.ts',
                ar: 'طبقة التحميل load.ts',
                fr: 'Couche de chargement load.ts',
                ru: 'Слой загрузки load.ts',
              },
            },
            {
              label: '解析层 resolve.ts',
              slug: 'codegen/resolve',
              translations: {
                'zh-CN': '解析层 resolve.ts',
                en: 'Resolve Layer — resolve.ts',
                'zh-TW': '解析層 resolve.ts',
                ja: '解決層 resolve.ts',
                ko: '해결 계층 resolve.ts',
                es: 'Capa de resolución resolve.ts',
                ar: 'طبقة الحل resolve.ts',
                fr: 'Couche de résolution resolve.ts',
                ru: 'Слой разрешения resolve.ts',
              },
            },
            {
              label: '格式化层 format.ts',
              slug: 'codegen/format',
              translations: {
                'zh-CN': '格式化层 format.ts',
                en: 'Formatting Layer — format.ts',
                'zh-TW': '格式化層 format.ts',
                ja: 'フォーマット層 format.ts',
                ko: '포맷팅 계층 format.ts',
                es: 'Capa de formato format.ts',
                ar: 'طبقة التنسيق format.ts',
                fr: 'Couche de formatage format.ts',
                ru: 'Слой форматирования format.ts',
              },
            },
            {
              label: '构树层 tree.ts',
              slug: 'codegen/tree',
              translations: {
                'zh-CN': '构树层 tree.ts',
                en: 'Tree Layer — tree.ts',
                'zh-TW': '構樹層 tree.ts',
                ja: 'ツリー構築層 tree.ts',
                ko: '트리 구성 계층 tree.ts',
                es: 'Capa de árbol tree.ts',
                ar: 'طبقة بناء الشجرة tree.ts',
                fr: "Couche de construction d'arbre tree.ts",
                ru: 'Слой построения дерева tree.ts',
              },
            },
            {
              label: '渲染层 render.ts',
              slug: 'codegen/render',
              translations: {
                'zh-CN': '渲染层 render.ts',
                en: 'Render Layer — render.ts',
                'zh-TW': '渲染層 render.ts',
                ja: 'レンダリング層 render.ts',
                ko: '렌더링 계층 render.ts',
                es: 'Capa de renderizado render.ts',
                ar: 'طبقة التصيير render.ts',
                fr: 'Couche de rendu render.ts',
                ru: 'Слой рендеринга render.ts',
              },
            },
            {
              label: '五个目标平台',
              slug: 'codegen/targets',
              translations: {
                'zh-CN': '五个目标平台',
                en: 'The Five Targets',
                'zh-TW': '五個目標平台',
                ja: '5 つのターゲット',
                ko: '5개 타깃',
                es: 'Las cinco plataformas objetivo',
                ar: 'المنصات المستهدفة الخمس',
                fr: 'Les cinq plateformes cibles',
                ru: 'Пять целевых платформ',
              },
            },
            {
              label: '模板清单',
              slug: 'codegen/templates',
              translations: {
                'zh-CN': '模板清单',
                en: 'Template List',
                'zh-TW': '模板清單',
                ja: 'テンプレート一覧',
                ko: '템플릿 목록',
                es: 'Lista de plantillas',
                ar: 'قائمة القوالب',
                fr: 'Liste des modèles',
                ru: 'Список шаблонов',
              },
            },
            {
              label: '类型定义 types.ts',
              slug: 'codegen/types',
              translations: {
                'zh-CN': '类型定义 types.ts',
                en: 'Type Definitions — types.ts',
                'zh-TW': '類型定義 types.ts',
                ja: '型定義 types.ts',
                ko: '타입 정의 types.ts',
                es: 'Definiciones de tipos types.ts',
                ar: 'تعريفات الأنواع types.ts',
                fr: 'Définitions de types types.ts',
                ru: 'Определения типов types.ts',
              },
            },
          ],
        },
        {
          label: '产物',
          translations: {
            'zh-CN': '产物',
            en: 'Artifacts',
            'zh-TW': '產物',
            ja: '生成物',
            ko: '산출물',
            es: 'Artefactos',
            ar: 'المخرجات',
            fr: 'Artefacts',
            ru: 'Артефакты',
          },
          items: [
            {
              label: 'Android 产物',
              slug: 'artifacts/android',
              translations: {
                'zh-CN': 'Android 产物',
                en: 'Android Artifacts',
                'zh-TW': 'Android 產物',
                ja: 'Android 生成物',
                ko: 'Android 산출물',
                es: 'Artefactos de Android',
                ar: 'مخرجات Android',
                fr: 'Artefacts Android',
                ru: 'Артефакты Android',
              },
            },
            {
              label: 'iOS 产物',
              slug: 'artifacts/ios',
              translations: {
                'zh-CN': 'iOS 产物',
                en: 'iOS Artifacts',
                'zh-TW': 'iOS 產物',
                ja: 'iOS 生成物',
                ko: 'iOS 산출물',
                es: 'Artefactos de iOS',
                ar: 'مخرجات iOS',
                fr: 'Artefacts iOS',
                ru: 'Артефакты iOS',
              },
            },
            {
              label: '鸿蒙产物',
              slug: 'artifacts/harmony',
              translations: {
                'zh-CN': '鸿蒙产物',
                en: 'HarmonyOS Artifacts',
                'zh-TW': '鴻蒙產物',
                ja: 'HarmonyOS 生成物',
                ko: 'HarmonyOS 산출물',
                es: 'Artefactos de HarmonyOS',
                ar: 'مخرجات HarmonyOS',
                fr: 'Artefacts HarmonyOS',
                ru: 'Артефакты HarmonyOS',
              },
            },
            {
              label: 'Windows 产物',
              slug: 'artifacts/windows',
              translations: {
                'zh-CN': 'Windows 产物',
                en: 'Windows Artifacts',
                'zh-TW': 'Windows 產物',
                ja: 'Windows 生成物',
                ko: 'Windows 산출물',
                es: 'Artefactos de Windows',
                ar: 'مخرجات Windows',
                fr: 'Artefacts Windows',
                ru: 'Артефакты Windows',
              },
            },
            {
              label: 'docs 产物',
              slug: 'artifacts/docs-output',
              translations: {
                'zh-CN': 'docs 产物',
                en: 'Docs Artifacts',
                'zh-TW': 'docs 產物',
                ja: 'docs 生成物',
                ko: 'docs 산출물',
                es: 'Artefactos de docs',
                ar: 'مخرجات docs',
                fr: 'Artefacts docs',
                ru: 'Артефакты docs',
              },
            },
          ],
        },
      ],
    }),
  ],
})
