---
title: "케이스 형식"
---

각 `cases/<name>.json`은 컴포넌트의 **골든 케이스** 집합입니다: 크로스 플랫폼으로 번역 가능한 동작 수준 어서션. 형식은 `cases/schema.json`이 강하게 제약합니다.

## 설계 이념

> 로직은 공유하지 않고, 동작을 공유합니다.

각 네이티브 플랫폼은 **테스트 코드를 공유하지 않고**, 같은 cases를 보고 사람이 로컬 테스트로 번역합니다(JUnit / XCTest / ohpm test / C 단위 테스트). cases는 **동작**만 설명(어떤 조건에서, 어떤 동작을, 어떤 결과를 기대하는지)하며 어떤 플랫폼 전용 API도 포함하지 않습니다.

## 최상위 구조

```json
{
  "$schema": "./schema.json",
  "component": "button",
  "cases": [ ... ]
}
```

- `component`: kebab-case, **동일한 이름의 spec `name`과 일치해야 함**
- `cases`: 최소 한 개

## 3단 구조

각 케이스는 `id` / `name` / `given` / `when` / `then`이 필수:

```json
{
  "id": "disabled-blocks-click",
  "name": "비활성화 상태는 onClick를 발생시키지 않음",
  "given": { "props": { "disabled": true } },
  "when": { "action": "click" },
  "then": {
    "events": [{ "name": "onClick", "assertion": "notEmitted" }],
    "enabled": false
  }
}
```

### given(사전 조건)

| 필드 | 설명 |
| --- | --- |
| `props` | 초기 props, **키는 동일한 이름의 spec의 props에 존재해야 함** |
| `state` | 초기 컴포넌트 상태, **자유 키**, 플랫폼 특유 시나리오에 사용(예: `{ "text": "버튼" }`) |

### when(동작)

| 필드 | 설명 |
| --- | --- |
| `action` | **필수**, 6개 값 중 하나(아래 참고) |
| `target` | 동작 대상(예: 슬롯 이름, 자식 컴포넌트 이름) |
| `payload` | 동작 페이로드(예: input의 텍스트) |

**6가지 동작**: `render`(렌더링) / `click`(클릭) / `input`(입력) / `focus`(포커스 획득) / `blur`(포커스 상실, **예약, 현재 사용 중인 컴포넌트 없음**) / `custom`(커스텀, **`target`으로 설명 필수**).

### then(어서션)

| 필드 | 설명 |
| --- | --- |
| `events` | 이벤트 어서션 배열 |
| `tokens` | 토큰 적용 어서션 배열 |
| `visible` | 가시성 기댓값 |
| `enabled` | 상호작용 가능 기댓값 |
| `text` | 렌더링되기를 기대하는 텍스트 |
| `notes` | 플랫폼 독립적인 보충 어서션 설명(자연어) |

**이벤트 어서션**:

```json
{
  "name": "onValueChange",
  "assertion": "emitted",
  "times": 1,
  "payload": { "value": "青花瓷" }
}
```

- `name`: **동일한 이름의 spec의 events에 존재해야 함**
- `assertion`: `emitted`(발생함) 또는 `notEmitted`(발생하지 않음)
- `times`: 선택, 발생 횟수 기댓값
- `payload`: 선택, 페이로드 기댓값(**깊은 비교**)

**토큰 어서션**:

```json
{ "path": "button.height.large", "applied": false }
```

`path`는 토큰 전체 경로이며, `applied`는 해당 토큰이 렌더링 결과에 **적용되는지**를 어서션합니다. `applied: false`의 **역방향 어서션**은 치수 상호 배제 회귀에 사용합니다(예: small 크기를 선택하면 `button.height.large`는 소비되지 않아야 함).

## 전체 예

```json
{
  "id": "small-size-uses-small-tokens",
  "name": "small 크기는 small 크기 토큰을 소비함",
  "given": { "props": { "size": "small" } },
  "when": { "action": "render" },
  "then": {
    "tokens": [
      { "path": "button.height.small",   "applied": true },
      { "path": "button.fontSize.small", "applied": true },
      { "path": "button.height.large",   "applied": false }
    ]
  }
}
```

```json
{
  "id": "clearable-emits-empty-value",
  "name": "지우기 버튼이 빈 값을 발생시킴",
  "given": { "props": { "value": "기존 값", "clearable": true } },
  "when": { "action": "custom", "payload": { "call": "clear" } },
  "then": {
    "events": [{ "name": "onValueChange", "assertion": "emitted", "times": 1, "payload": { "value": "" } }]
  }
}
```

## spec과의 관계

`pnpm verify:specs`가 검증:

- `given.props`의 키가 모두 spec의 props에 있는지
- `then.events[].name`이 모두 spec의 events에 있는지

그러므로 **spec의 props / events 이름을 바꿀 때 반드시 cases도 함께 바꿔야** 합니다.

## 현재 컴포넌트 목록

15개 컴포넌트, 케이스 총수는 버전에 따라 달라집니다. 모든 케이스는 [골든 케이스 레퍼런스](./reference)를 참고하세요.
