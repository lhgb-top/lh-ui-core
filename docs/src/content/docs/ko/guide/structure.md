---
title: "디렉터리 구조"
---

```
lh-ui-core/
├── tokens/       디자인 토큰 유일 원본(JSON 중성 소스, schema 포함)
├── specs/        컴포넌트 계약(props / 열거형 / 기본값 / 이벤트 / 슬롯 / 동작)
├── cases/        골든 케이스(크로스 플랫폼 번역 가능 동작 수준 어서션)
├── codegen/      codegen 도구(TS/Node): src/ + templates/
├── dist/         codegen 산출물(빌드가 생성, 수동 수정 금지)
├── scripts/      검증과 패키지 게시 스크립트
├── tests/        스냅샷 테스트와 토큰 메타 테스트
└── docs/         개발자 문서 사이트 소스(Astro Starlight, 이 사이트)
```

## 각 디렉터리의 역할

### `tokens/` — 토큰 유일 원본

플랫폼 독립적인 JSON 중성 소스이며, 형식은 `tokens/schema.json`이 강하게 제약합니다. 데이터 파일은 총 9개입니다:

| 파일 | 네임스페이스 | 내용 |
| --- | --- | --- |
| `color.json` | `color` | 색판: 의미 색상을 default/hover/active/bg/border로 구성 |
| `color-dark.json` | `color`(라이트와 동일) | 다크 증분 덮어쓰기(라이트와 다른 키만 선언) |
| `components.json` | `""`(빈 문자열) | 컴포넌트 수준 토큰: `button.*`, `input.*` 등 |
| `typography.json` | `typography` | 글꼴족 / 글자 크기 / 글꼴 두께 / 줄 높이 |
| `spacing.json` | `spacing` | 간격 스케일 xs–xxl |
| `radius.json` | `radius` | 모서리 둥글기 |
| `shadow.json` | `shadow` | 그림자 |
| `motion.json` | `motion` | 지속 시간 + 이징(베지어) |
| `z-index.json` | `zIndex` | 쌓임 순서 |

각 파일의 정확한 리프 수는 버전에 따라 달라지므로 [토큰 레퍼런스](../tokens/reference) 페이지를 기준으로 하세요. 본문에 숫자를 고정해 두면 반드시 시대에 뒤떨어지게 됩니다.

자세한 내용은 [토큰 형식](../tokens/token-format)과 [네임스페이스와 점 경로](../tokens/namespace)를 참고하세요.

### `specs/` — 컴포넌트 계약

컴포넌트마다 JSON 한 부: props 이름 / 타입 / 열거형 / 기본값 / 이벤트 / 슬롯 / 동작 설명 / 소비하는 토큰 목록. 형식은 `specs/schema.json`이 강하게 제약합니다. 자세한 내용은 [계약 형식](../specs/spec-format)을 참고하세요.

### `cases/` — 골든 케이스

컴포넌트마다 JSON 한 부: 크로스 플랫폼으로 번역 가능한 동작 수준 어서션(given/when/then). 각 플랫폼의 테스트 리포지터리는 이것을 보고 사람이 로컬 테스트로 번역합니다. 형식은 `cases/schema.json`이 강하게 제약합니다. 자세한 내용은 [케이스 형식](../cases/case-format)을 참고하세요.

### `codegen/` — 생성 도구

```
codegen/
├── src/
│   ├── index.ts      CLI 편성 진입점(pnpm codegen의 실체)
│   ├── types.ts      전체 타입 정의(런타임 산출물에 들어가지 않음)
│   ├── load.ts       JSON 적재 + Ajv schema 검증 + 평탄화
│   ├── resolve.ts    ref 해석 + 다크 병합
│   ├── format.ts     중성값 파싱 / 각 플랫폼 포맷팅
│   ├── tree.ts       평면 path → 중첩 트리
│   ├── render.ts     Handlebars 래핑
│   └── targets/      android / ios / harmony / windows / docs 다섯 target
└── templates/        각 플랫폼 handlebars 템플릿(7개 .hbs)
```

자세한 내용은 [파이프라인 개요](../codegen/pipeline)를 참고하세요.

### `dist/` — 생성 산출물

**수동 수정 금지**(`.gitignore` 안에 있음). 배치:

```
dist/
├── android/top/lhgb/ui/tokens/   LhTokens.kt, LhDarkTokens.kt
├── ios/Sources/LhUITokens/       LhTokens.swift, LhDarkTokens.swift, LhShadow.swift
├── harmony/tokens/               LhTokens.ets, LhDarkTokens.ets, LhShadow.ets
├── c/include/lh_ui/              lh_tokens.h, lh_dark_tokens.h
└── docs/                         tokens.md, tokens.light.json, tokens.dark.json
```

자세한 내용은 [산출물](../artifacts/android)을 참고하세요.

### `scripts/` — 검증과 패키지 게시 스크립트

`verify-tokens.mts`(토큰 검증: schema + 참조 무결성 + 고아 다크 보고), `verify-specs.mts`(spec과 cases 일치성), `resolve-local-tokens.mjs`(로컬 연결 가드). 패키지 게시는 changesets를 따릅니다([명령어 목록](./commands) 참고).

### `tests/` — 스냅샷 테스트

`codegen-snapshot.spec.ts`는 `dist/`의 모든 산출물을 반영합니다(스냅샷 파일은 버전 관리에 포함). `tokens.spec.ts`는 토큰 메타 테스트를 수행합니다.

### `docs/` — 이 사이트

Astro Starlight 사이트 소스입니다(설정은 `docs/astro.config.mjs`, 콘텐츠는 `docs/src/content/docs/`). 세 참조 페이지(토큰 / 계약 / 케이스)는 `docs/src/pages/` 아래의 `.astro` 페이지로, 빌드 시 codegen의 적재와 해석 함수를 직접 호출해 JSON 원본에서 렌더링하므로 표를 수동으로 유지할 필요가 없습니다. 배포 안내는 [배포 안내](../deployment)를 참고하세요.
