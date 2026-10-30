---
title: "참조 메커니즘"
---

## `ref`란

하나의 리프는 `value` 대신 `ref`를 적어, 다른 토큰의 **전체 경로**를 가리킬 수 있습니다:

```json
"selected": { "ref": "color.primary.active", "description": "선택 상태의 텍스트 색상, 주 색상의 누름 변형을 따름" }
```

빌드 시 `ref`는 **정적으로 해석되어 리터럴 값으로 베이크**됩니다 — 각 플랫폼 산출물에는 이미 해석된 값이 보이며, **런타임 간접 참조가 0**입니다.

## 해석 알고리즘

`resolve.ts`의 인라인 함수 `resolveRef(path, chain)`:

1. 목표 경로가 존재하지 않음 → `참조하는 토큰이 존재하지 않음: <path>`를 throw
2. 목표 자체도 ref → **재귀**로 체인을 따라 내려감(임의 길이의 간접 체인 지원)
3. 체인에 이미 현재 경로가 포함됨 → `토큰 참조 순환 감지: a -> b -> a`를 throw
4. 리터럴 값에 도달 → `{ value, type }` 반환

## 간접 체인

```json
"a": { "ref": "b" },
"b": { "ref": "c" },
"c": { "value": "#2B4C7C" }
```

`a`는 체인을 따라 `c`의 리터럴 값까지 해석됩니다.

## 순환 감지

```json
"a": { "ref": "b" },
"b": { "ref": "a" }
```

resolve할 때 `chain.includes(path)`가 hit하여 `토큰 참조 순환 감지: a -> b -> a`를 throw하고, codegen이 즉시 실패합니다.

## 베이크 결과

해석 결과는 `token.value`에 기록되고, `refChain`도 기록합니다(`ResolvedToken.refChain`, 예: `["color.primary.active"]`). 각 플랫폼 산출물에는 리터럴 값만 있고 ref는 보이지 않습니다:

```kotlin
// button.borderRadius는 radius.base(2px)를 참조, 베이크 후:
val borderRadius = 2.dp  // 버튼 모서리 둥글기가 전역 모서리 둥글기를 따름
```

## 타입은 원본을 따름

ref 리프가 자체 `type`을 선언하지 않은 경우, **타입은 참조 목표의 타입**을 취합니다(3계층 우선순위의 2번째, 자세한 내용은 [타입 시스템](./type-system) 참고).

## refMap

`resolveTokens`가 반환하는 `refMap`은 해석된 모든 참조 관계를 기록합니다(`path -> 원본 ref 문자열`, 다크 키는 `dark:` 접두사 포함). 문서와 `pnpm verify:tokens`가 사용합니다.

## 실제 사용법

`tokens/`에서 ref의 전형적인 시나리오:

| 시나리오 | 예 |
| --- | --- |
| 컴포넌트가 전역량을 따름 | `button.borderRadius` → `radius.base` |
| 상태가 의미 색상을 따름 | `color.selected` → `color.primary.active` |
| 컴포넌트 글자 크기가 타이포그래피를 따름 | `button.fontSize.small` → `typography.fontSize.small` |

**모든 참조는 반드시 전체 경로**를 적어야 합니다(네임스페이스 + 중첩 경로). 자세한 내용은 [네임스페이스](./namespace)를 참고하세요.
