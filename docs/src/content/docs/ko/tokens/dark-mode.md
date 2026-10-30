---
title: "다크 모드 병합"
---

## 증분 덮어쓰기

다크 파일(`"$dark": true`)은 **라이트와 다른 키만 선언**하며, 덮어쓰지 않은 키는 라이트 값을 그대로 따릅니다:

```json
// color-dark.json
{
  "$namespace": "color",
  "$dark": true,
  "$description": "라이트와 다른 키만 선언, 덮어쓰지 않은 키는 color.json을 따름",
  "primary": { "default": { "value": "#3D649E" } }
}
```

`color.primary.hover`, `.active` 등 나열되지 않은 키는 다크에서 라이트 값을 따릅니다. 가지치기 원칙은 **키 단위 비교**입니다: 라이트 값과 완전히 같은 키는 모두 삭제합니다(예: `onPrimary`는 두 테마 모두 `#FFFFFF`, `disabled.*`는 두 테마 모두 같은 ref 그룹이므로 다크 파일에 나타나지 않습니다).

## 네임스페이스 정렬 필수

다크 파일은 라이트 파일과 **동일한 `$namespace`**를 선언해야(`color-dark.json`은 명시적으로 `"$namespace": "color"`를 작성) 덮어쓰기 키가 같은 경로에 떨어집니다.

## 다크 ref의 근접 해석

다크 파일 내의 `ref`는 `resolveDarkRef`로 해석하며, 규칙이 라이트와 다릅니다:

1. 목표가 **다크 네임스페이스 내**에 있고 ref인 경우 → 다크 내에서 체인을 따라 재귀(다크가 다크를 참조해야 같은 테마의 값을 취함)
2. 목표가 다크 네임스페이스 내에 있고 리터럴 값인 경우 → 다크 값 반환
3. 목표가 다크 네임스페이스 내에 **없는** 경우 → **라이트 네임스페이스로 폴백**해 값을 취함

```json
// 다크가 다크를 참조: 다크의 primary.active 값을 취함
"selectedDark": { "ref": "color.primary.active" }
```

다크 ref에는 순환 감지(`다크 토큰 참조 순환 감지`)도 있으며, 목표는 반드시 라이트 집합 / 다크 집합 중 하나에 존재해야 합니다. 그렇지 않으면 `다크 토큰 X의 참조가 존재하지 않음`을 throw합니다.

## color-mix 사전 계산

Web 혈통의 다크는 `color-mix()`를 많이 사용하지만, **네이티브 측에는 이런 런타임 능력이 없습니다**. 그래서 빌드 시 **평면 색상값으로 미리 계산**하고, 계산 근거를 description에 기록합니다:

```json
"selected": {
  "value": "#B1C1D8",
  "description": "color-mix(primary 40%, #fff)에서 사전 계산, 다크 패널 대비 5.2:1"
},
"primary": {
  "bg": {
    "value": "rgba(61, 100, 158, 0.25)",
    "description": "color-mix(primary 25%, transparent)에서 사전 계산"
  }
}
```

## 산출물 형태

`resolveTokens`가 `TokenSet.dark`를 산출합니다: 평면 `Map<path, TokenValue>`로, 덮어쓰기된 키만 포함합니다. 각 플랫폼 target이 어떻게 내보낼지는 각자 결정합니다:

| 플랫폼 | 다크 메커니즘 |
| --- | --- |
| Android | 독립 `object LhDarkTokens` |
| iOS | 독립 `public enum LhDarkTokens` |
| HarmonyOS | 독립 `export class LhDarkTokens` |
| **C** | **같은 이름의 매크로 재정의** — 다크 헤더 파일이 라이트 이후에 include되어 같은 이름의 `#define`을 직접 덮어씀 |

## 고아 다크 경로

두 종류의 비정상이 `orphanDarkPaths`에 기록됩니다(**codegen을 중단하지 않고**, `pnpm verify:tokens`가 보고):

- 다크 키의 **타입 누락**(자체 type도 없고, 라이트 집합에도 상속받을 같은 이름의 키가 없음) → 이 키를 건너뛰고 덮어쓰기 표에 쓰지 않음
- 다크 키가 라이트 집합에 **존재하지 않음**(고아) → 여전히 덮어쓰기 표에 쓰지만, 보고

## 다크 덮어쓰기 범위

현재 다크는 `color.*` 네임스페이스만 덮어씁니다(정확한 키 수는 버전에 따라 달라짐, [토큰 레퍼런스](./reference) 페이지의 다크 열 참고). 비색 네임스페이스(간격, 모서리 둥글기, 글자 크기 등)는 다크에서 라이트 값을 그대로 따릅니다 — 이것이 `dist/docs/tokens.md`에서 비색 행의 다크 열이 `—`인 이유입니다.

[토큰 레퍼런스](./reference) 페이지에서 각 토큰의 라이트 값과 다크 값을 함께 볼 수 있습니다.
