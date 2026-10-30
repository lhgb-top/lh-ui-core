---
title: "명령어 목록"
---

## 빌드

| 명령 | 역할 |
| --- | --- |
| `pnpm codegen` | 생성을 한 번 실행해 `dist/`에 씁니다(삭제 후 재구축) |
| `pnpm build` | `pnpm codegen && pnpm verify` |

## 검증

| 명령 | 역할 |
| --- | --- |
| `pnpm verify:tokens` | 토큰 검증: schema + 참조 무결성 + **핵심 텍스트/배경 대비 ≥4.5:1(WCAG AA, 선언된 쌍만 검사, 비활성 상태는 제외)** + **플랫폼 전용 구문 순찰(`var()` / `rem` / `sp` / `dp` 등 차단)** + 고아 다크 보고 |
| `pnpm verify:specs` | spec과 cases 일치성 검증 |
| `pnpm verify` | 위 두 명령의 결합 |

## 테스트와 정적 검사

| 명령 | 역할 |
| --- | --- |
| `pnpm test` | 스냅샷 테스트(vitest run) |
| `pnpm test:watch` | 스냅샷 테스트 감시 모드 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | eslint |
| `pnpm lint:fix` | eslint --fix |
| `pnpm format` | prettier 포맷팅 json/md/yml |

## 문서 사이트

| 명령 | 역할 |
| --- | --- |
| `pnpm docs:dev` | 로컬 미리보기 `http://localhost:5185/lhui/core/`(base가 프로덕션과 동일) |
| `pnpm docs:build` | 프로덕션 빌드(base `/lhui/core/`) |
| `pnpm docs:preview` | 프로덕션 빌드 미리보기 |

## 릴리스

| 명령 | 역할 |
| --- | --- |
| `pnpm changeset` | changeset 한 개 작성 |
| `pnpm changeset:status` | changeset 상태 확인 |
| `pnpm changeset:version` | changeset에 따라 버전 번호 변경 |

## 스냅샷 업데이트

토큰이나 템플릿을 바꾸면 스냅샷은 반드시 실패합니다. 확인한 뒤:

```bash
pnpm test -- -u
```

## 스크립트 목록

`scripts/` 아래의 스크립트(npm scripts에 등록되지 않은 것):

| 스크립트 | 역할 |
| --- | --- |
| `scripts/verify-tokens.mts` | 토큰 검증의 실체 |
| `scripts/verify-specs.mts` | 사양 검증의 실체 |
| `scripts/resolve-local-tokens.mjs` | 로컬 연결 가드 |

패키지 게시는 changesets를 따릅니다(위 "릴리스" 참고). 추가적인 패키지 게시 스크립트는 없습니다.
