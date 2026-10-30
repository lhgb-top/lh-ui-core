---
title: "계약 형식"
---

각 `specs/<name>.json`은 컴포넌트의 **크로스 플랫폼 계약**입니다. 형식은 `specs/schema.json`이 강하게 제약합니다.

## 최상위 구조

```json
{
  "$schema": "./schema.json",
  "name": "button",
  "component": "LhButton",
  "since": "0.1.0",
  "description": "버튼: 즉각적인 동작을 실행하며 타입, 크기, 로딩, 비활성화, 아이콘, 문양 배경을 지원합니다.",
  "props": [ ... ],
  "events": [ ... ],
  "slots": [ ... ],
  "behaviors": [ ... ],
  "tokenRefs": [ ... ]
}
```

| 필드 | 필수 | 제약 |
| --- | --- | --- |
| `name` | 예 | kebab-case: `^[a-z][a-z0-9-]*$`, 파일 이름과 일치 |
| `component` | 예 | Lh 접두사가 있는 PascalCase: `^Lh[A-Z][a-zA-Z0-9]*$` |
| `description` | 예 | 중국어 설명 |
| `props` | 예 | 배열, 최소 한 항목(schema가 `minItems: 1`로 강제) |
| `since` | 아니요 | 도입 버전 |
| `events` / `slots` / `behaviors` / `tokenRefs` | 아니요 | 아래 참고 |

`additionalProperties: false` — 여분의 필드를 허용하지 않습니다.

## props

```json
{ "name": "size", "type": "enum", "values": ["small", "medium", "large"], "default": "medium", "description": "버튼 크기" }
```

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `name` | 예 | camelCase: `^[a-z][a-zA-Z0-9]*$`, **다섯 플랫폼 통일** |
| `type` | 예 | 아래 표 참고 |
| `description` | 예 | 중국어 설명 |
| `values` | 아니요 | `type: enum`일 때의 열거값(문자열 리터럴 배열) |
| `items` | `type: array`일 때 **필수** | 배열 요소의 타입(`string` / `number` / `boolean`) + 설명 |
| `default` | 아니요 | 기본값(임의의 JSON 타입), 생략하면 기본값이 없음 |
| `required` | 아니요 | boolean, 기본 `false` |

**7가지 prop 타입**:

| 타입 | 의미 | 각 플랫폼 매핑 |
| --- | --- | --- |
| `string` | 문자열 | `String` / `String` / `string` / `const char*` |
| `number` | 수치 | `Int` / `Double` / `number` / `int` |
| `boolean` | 불리언 | `Boolean` / `Bool` / `boolean` / `bool` |
| `enum` | 열거형(`values`를 제공해야 함) | 각 플랫폼에 대응하는 열거형 타입 생성 |
| `tokenRef` | 토큰 점 경로 | 토큰 참조, verify 시 경로 존재 여부 확인(**예약, 현재 사용 중인 컴포넌트 없음**) |
| `node` | 슬롯 / 자식 노드 콘텐츠 | Compose content, SwiftUI ViewBuilder, ArkUI Builder, C 자식 노드 핸들(**예약, 현재 사용 중인 컴포넌트 없음**) |
| `array` | 배열(`items`를 제공해야 함) | 선택기 후보 항목 등 |

## events

```json
{
  "name": "onValueChange",
  "payload": [{ "name": "value", "type": "string", "description": "변경 후의 텍스트" }],
  "description": "텍스트가 변할 때 발생, disabled 또는 readonly가 true이면 발생하지 않음"
}
```

- `name`: `^on[A-Z][a-zA-Z0-9]*$`, **다섯 플랫폼 통일**
- `payload`: 필드 배열(각 항목은 `name` + `type` + 선택 `description`), **빈 배열은 페이로드 없음을 의미**
- `description`: 필수

## slots

```json
{ "name": "prefix", "description": "입력 상자 접두 콘텐츠(왼쪽의 비입력 영역)" }
```

`name`는 마찬가지로 camelCase입니다. slot의 **플랫폼 측 구현**은 `node` 타입의 prop이나 각 플랫폼의 슬롯 메커니즘이 담당합니다.

## behaviors

자연어 동작 설명 배열, cases 추출과 문서 생성에 사용:

```json
"behaviors": [
  "disabled가 true일 때: 클릭에 응답하지 않고 비활성화 스타일을 표시(disabled.* 토큰), onClick를 발생시키지 않음",
  "size 매핑: small/medium/large가 각각 button.height.<size> 등의 크기 토큰을 취함"
]
```

## tokenRefs

이 컴포넌트가 소비하는 토큰 **전체 경로** 목록, `pnpm verify:specs`가 참조 무결성을 확인:

```json
"tokenRefs": ["button.height.medium", "color.primary.default", "color.onPrimary"]
```

## 명명이 이렇게 엄격한 이유

모든 명명 정규식은 **크로스 플랫폼 정렬**을 위한 것입니다: `name`은 파일 이름과 각 플랫폼의 테스트 명명을 결정하고, `component`는 각 플랫폼의 클래스 이름의 기반이 되며, prop 이름과 이벤트 이름은 다섯 플랫폼에서 일치하므로 cases가 이를 따라 번역될 수 있습니다.

## 현재 컴포넌트 목록

15개 컴포넌트: button, cell, checkbox, dialog, icon, input, loading, navbar, picker, radio, switch, tag, text, textarea, toast. 모든 계약은 [컴포넌트 계약 레퍼런스](./reference)를 참고하세요.
