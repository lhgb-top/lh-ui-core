---
title: "레드라인 및 명명 규칙"
---

## 6개 레드라인

### 1. 골격만 생성, 구현은 생성하지 않음

codegen은 **토큰 바인딩**, props 열거형과 타입, 기본값 상수만 산출합니다. **모든 UI 구현의 생성을 금지**합니다 — Composable 본문, SwiftUI View 본문, ArkUI 컴포넌트 본문, C 컴포넌트 함수 본문을 생성하지 않습니다. UI 구현은 모두 각 네이티브 리포지터리에서 직접 작성합니다.

이 레드라인은 `codegen/src/index.ts`의 파일 머리 주석에 적혀 있으며, 도구 체인의 자기 선언입니다.

### 2. 토큰의 유일 원본은 `tokens/*.json`

어떤 플랫폼이나 컴포넌트도 이 리포지터리를 우회해 토큰 값을 따로 정할 수 없습니다. 각 네이티브 리포지터리는 `dist/` 산출물이나 해당 플랫폼의 이미 게시된 패키지만 소비할 수 있으며, **색상값 / 간격 / 글자 크기를 직접 작성하는 것은 금지**합니다.

### 3. 런타임 JS 0

이 리포지터리의 TS 코드는 빌드 시 도구 체인에만 존재하며, **산출물에는 어떤 JavaScript도 들어갈 수 없습니다**.

### 4. `lh-ui-share`에 의존하지 않음

두 혈통은 서로 독립적이며, 상대 측의 어떤 것도 import할 수 없습니다. 토큰의 초기값은 일회성으로 사람이 옮긴 시드이며, 어떤 자동 의존성도 만들지 않습니다.

### 5. JSON에 플랫폼 전용 구문을 포함할 수 없음

토큰 값에는 중성 표현만 허용됩니다: 16진수 색상값 / `rgba()` / `number` 타입의 순수 수치 / `dimension` / `duration` / `shadow`의 **단위가 있는 문자열**(`"12px"` / `"50%"` / `"200ms"`, `assertTypedValue`가 강제, 자세한 내용은 [토큰 형식](../tokens/token-format) 참고). `var()`, `rem`, `sp`, `dp` 등 어떤 플랫폼 전용 단위나 참조도 금지합니다. **플랫폼 단위 환산은 각 target 템플릿이 담당**(예: Android의 dp/sp 판정, iOS의 초 환산).

### 6. `dist/` 수동 수정 금지

모든 변경은 `tokens/` / `specs/` / `cases/` 또는 템플릿을 수정한 뒤 `pnpm codegen`을 다시 실행합니다. `dist/`는 `.gitignore` 안에 있으며, codegen은 매번 삭제 후 재구축합니다.

## 명명 규칙(마스터 플랜 D20)

### 플랫폼 패키지 이름 / 식별자

플랫폼 패키지 이름은 모두 역도메인 `top.lhgb.ui`를 사용합니다:

| 플랫폼 | 패키지 이름 / 식별자 |
| --- | --- |
| Android | `package top.lhgb.ui.tokens`, 산출물 디렉터리 `dist/android/top/lhgb/ui/tokens/` |
| iOS | `Sources/LhUITokens/`(SwiftPM 디렉터리 관례) |
| HarmonyOS | `tokens/`(ohpm 모듈 내) |
| C | `include/lh_ui/` |

### 자체 상수 / 클래스 / 열거형 접두사

모두 **LH 접두사**를 사용하며, 대소문자는 각 언어의 관례를 따릅니다:

| 언어 | 관례 | 예 |
| --- | --- | --- |
| Kotlin | `Lh*`(PascalCase) | `object LhTokens`, `object LhDarkTokens` |
| Swift | `Lh*`(PascalCase) | `public enum LhTokens`, `struct LhShadow` |
| ArkTS | `Lh*`(PascalCase) | `export class LhTokens`, `interface LhShadow` |
| C | `LH_*`(모두 대문자 스네이크) | `LH_COLOR_PRIMARY_DEFAULT`, `LH_Z_INDEX_MODAL` |

npm / ohpm의 `@lh-ui/*` scope는 이 제약을 받지 않습니다(npm은 역도메인을 사용하지 않음).

### C 매크로 명명 규칙

`zIndex.modal` → `LH_Z_INDEX_MODAL`: 먼저 `.`을 밑줄로 바꾸고, 각 대문자 앞에 밑줄을 추가한 뒤, 모두 대문자로 만듭니다. 자세한 내용은 [C 산출물](../artifacts/c)을 참고하세요.

## JSON 명명 제약

각 계층의 schema가 정규식으로 명명을 강하게 제약합니다:

| 계층 | 필드 | 규칙 |
| --- | --- | --- |
| spec | `name` | kebab-case: `^[a-z][a-z0-9-]*$` |
| spec | `component` | Lh 접두사가 있는 PascalCase: `^Lh[A-Z][a-zA-Z0-9]*$` |
| spec | prop 이름 | camelCase: `^[a-z][a-zA-Z0-9]*$` |
| spec | event 이름 | `^on[A-Z][a-zA-Z0-9]*$` |
| case | `id` | kebab-case |
| case | `component` | 동일한 이름의 spec `name`과 일치해야 함 |

## 주석과 문서의 언어

주석, 문서, 커밋 메시지는 모두 **중국어**로 작성합니다(가족 마스터 플랜 요구).
