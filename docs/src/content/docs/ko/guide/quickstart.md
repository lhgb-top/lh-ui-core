---
title: "빠른 시작"
---

## 환경 요구 사항

- Node.js `>= 22.12`(문서 사이트는 Astro 7을 사용하며 필수 요구 사항입니다)
- pnpm `10.x`(리포지터리는 `pnpm@10.34.5`로 고정)

## 설치

```bash
pnpm install
```

이 리포지터리는 **런타임 의존성이 0**(`dependencies`가 비어 있음)이며, 설치되는 것은 모두 빌드 시 도구 체인입니다(tsx, ajv, handlebars, vitest, astro 등).

## codegen 한 번 실행

```bash
pnpm codegen
```

이 명령은 `tsx codegen/src/index.ts`를 실행하며, 전체 흐름은 다음과 같습니다:

1. `package.json`의 버전 번호를 읽습니다
2. `tokens/*.json`을 적재하고 검증합니다(Ajv 구조 검증)
3. ref를 해석하고 다크를 병합합니다(의미 검증: 타입 일치, 참조 무결성, 순환 감지)
4. `specs/*.json`과 `cases/*.json`을 적재하고 검증합니다
5. **`dist/` 전체를 삭제하고 다시 구축합니다**
6. 5개 target을 순서대로 실행합니다(android → ios → harmony → c → docs)

산출물은 `dist/`에 있습니다:

```
  [android] android/top/lhgb/ui/tokens/LhTokens.kt
  [android] android/top/lhgb/ui/tokens/LhDarkTokens.kt
  ...
codegen 완료: target 5개, 파일 N개, 버전 v0.0.1
```

파일 수는 토큰 내용에 따라 달라집니다(그림자 토큰이 있으면 ios / harmony에 그림자 운반체 파일이 하나씩 추가됩니다). 실제 산출물을 기준으로 하세요.

## 검증

```bash
pnpm verify          # = pnpm verify:tokens && pnpm verify:specs
```

- `verify:tokens`: 토큰 schema + 참조 무결성 + **핵심 텍스트/배경 대비 ≥4.5:1(WCAG AA)** + **플랫폼 전용 구문 순찰(`var()` / `rem` / `sp` / `dp`)**, 그리고 **고아 다크 경로**(다크 파일에 선언되었으나 라이트 집합에 없는 키)와 타입이 누락된 다크 키를 보고합니다.
- `verify:specs`: spec과 cases의 일치성(case가 참조하는 prop / event가 spec에 존재하는지 등).

## 테스트

```bash
pnpm test
```

스냅샷 테스트는 `dist/`의 모든 산출물을 반영합니다. 토큰이나 템플릿을 바꾸면 스냅샷이 실패합니다. 확인한 뒤 `pnpm test -- -u`로 스냅샷을 업데이트하세요.

## 문서 사이트

```bash
pnpm docs:dev        # 로컬 미리보기 http://localhost:5185/lhui/core/
pnpm docs:build      # 프로덕션 빌드(base는 /lhui/core/)
pnpm docs:preview    # 프로덕션 빌드 미리보기
```

문서 사이트의 세 참조 페이지(토큰 / 계약 / 케이스)는 빌드 시 `tokens/`, `specs/`, `cases/` 원본을 직접 읽으므로 **codegen을 먼저 실행할 필요가 없습니다**.

## 자주 쓰는 조합

| 상황 | 명령 |
| --- | --- |
| 토큰을 바꾸고 산출물이 필요할 때 | `pnpm codegen` |
| 토큰을 바꾸고 산출물 + 검증이 필요할 때 | `pnpm build`(= codegen + verify) |
| 템플릿을 바꾸고 산출물 + 스냅샷이 필요할 때 | `pnpm codegen && pnpm test -- -u` |
| 토큰 빠른 참조표만 보고 싶을 때 | `pnpm codegen` 실행 후 `dist/docs/tokens.md` 확인 |

## 산출물을 소비하는 곳

각 네이티브 플랫폼은 `dist/` 아래의 해당 플랫폼 산출물을 소비합니다:

- Android: `dist/android/` 아래의 Kotlin 파일
- iOS: `dist/ios/` 아래의 Swift 파일
- HarmonyOS: `dist/harmony/` 아래의 ArkTS 파일
- Windows: `dist/windows/` 아래의 C# 파일

로컬 연결(토큰 변경 즉시 반영, 릴리스 없음) 메커니즘은 [로컬 연결](./local-linking)을 참고하세요.
