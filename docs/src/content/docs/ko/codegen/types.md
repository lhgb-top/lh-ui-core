---
title: "타입 정의 types.ts"
---

> 모든 codegen 모듈이 공유하는 타입 정의. 어떤 플랫폼 API에도 의존하지 않으며, 빌드 시간 도구 체인 내부에서만 사용되고 어떤 런타임 산출물에도 들어가지 않습니다.

[파이프라인 개요](./pipeline)에 네 개의 핵심 인터페이스(`CodegenTarget` / `CodegenInput` / `GeneratedFile` / `TokenSet`)가 소개되어 있고, 이 페이지는 완전한 참고입니다.

## 토큰 측

### `TokenType`

```ts
type TokenType =
  | 'color'
  | 'dimension'
  | 'number'
  | 'string'
  | 'shadow'
  | 'duration'
  | 'cubicBezier'
```

`tokens/schema.json`의 `$type` / `type` 열거값과 일대일로 대응합니다. 각 타입의 중성값 제약은 [토큰 형식](../tokens/token-format)을, 해석은 [포맷팅 계층](./format)을 참고하세요.

### `TokenValue`

```ts
type TokenValue = string | number | number[]
```

토큰의 중성값: 16진수 색상값 / `rgba()` / 단위 문자열(`"12px"`, `"50%"`, `"0.3s"`) / 순수 수치(`number` 타입) / 베지어 4원소 배열. 어떤 플랫폼 전용 문법도 금지됩니다.

### `RawToken`

```ts
interface RawToken {
  value?: TokenValue       // 리터럴 값(ref와 둘 중 하나)
  ref?: string             // 다른 토큰의 점 경로, 빌드 시간에 정적 해석되어 베이크됨
  type?: TokenType         // 미선언 시 파일 / 그룹 수준 $type을 상속
  description?: string
  nativeOnly?: boolean     // 네이티브 혈통 신규 항목으로 표시(web 혈통 정렬 항목이 아님)
}
```

JSON 소스 파일의 리프 토큰으로, schema의 `token` 노드를 직접 매핑합니다. `value`와 `ref`는 상호 배타적입니다(schema의 `anyOf`가 둘 중 하나를 강제).

### `ResolvedToken`

```ts
interface ResolvedToken {
  path: string             // 점 경로(예: color.primary.default)
  type: TokenType
  value: TokenValue        // 베이크된 리터럴 값(ref는 이미 전개됨)
  refChain?: string[]      // ref를 통해 해석된 경우, 원래 참조 경로를 기록(간접 체인 포함)
  description?: string
  nativeOnly?: boolean
}
```

`resolveTokens`의 산출물입니다. `refChain`은 토큰이 참조로부터 온 경우에만 존재하며, 문서와 디버깅이 원래 참조 체인을 추적할 수 있게 합니다.

### `DarkOverrides`

```ts
type DarkOverrides = Map<string, TokenValue>
```

해석이 끝난 다크 덮어쓰기: path -> 값. 키는 명색과 동일한 이름의 경로입니다(`color-dark.json`의 `$namespace`가 명색과 정렬되어야 덮어쓰기 키가 같은 경로에 떨어집니다).

### `TokenSet`

```ts
interface TokenSet {
  tokens: ResolvedToken[]              // 명색 토큰
  byPath: Map<string, ResolvedToken>   // 경로로 빠르게 찾기
  dark: DarkOverrides                  // path -> 다크 덮어쓰기 값
}
```

`resolveTokens`가 반환하는 `ResolveResult.tokenSet`으로, 모든 target의 입력입니다. `byPath`는 다크 덮어쓰기가 명색 토큰의 타입과 설명을 역조회할 때 쓰입니다.

## 계약 측(specs)

### `ComponentSpec`

```ts
interface ComponentSpec {
  name: string             // 계약 식별자(kebab-case, 예: 'button')
  component: string        // 표시명(예: 'Button 버튼')
  since?: string           // 도입 버전
  description: string
  props: SpecProp[]
  events?: SpecEvent[]
  slots?: SpecSlot[]
  behaviors?: string[]
  tokenRefs?: string[]     // 이 컴포넌트가 소비하는 토큰의 전체 경로
}
```

`specs/<name>.json`의 타입 매핑으로, `loadSpecs()`가 적재하여 schema 검증을 수행합니다.

### `SpecProp`

```ts
interface SpecProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'tokenRef' | 'node' | 'array'
  values?: string[]        // enum 전용: 열거값 집합
  default?: unknown        // 기본값(기본값이 없으면 생략)
  required?: boolean
  description: string
}
```

`type`은 `specs/schema.json`의 7값 열거와 일치합니다. 이 중 `tokenRef`(토큰 점 경로)와 `node`(노드 참조)는 예약값으로, 현재 15부의 계약 어디에서도 사용되지 않습니다.

### `SpecEvent`

```ts
interface SpecEvent {
  name: string
  payload?: { name: string; type: SpecProp['type']; description?: string }[]
  description: string
}
```

### `SpecSlot`

```ts
interface SpecSlot {
  name: string
  description: string
}
```

## 케이스 측(cases)

### `ComponentCases`

```ts
interface ComponentCases {
  component: string        // 컴포넌트명, ComponentSpec.name에 대응
  cases: GoldenCase[]      // 최소 한 개(schema가 minItems: 1을 강제)
}
```

### `GoldenCase`

```ts
interface GoldenCase {
  id: string               // 케이스 id(kebab-case, 전 저장소 유일)
  name: string             // 사람이 읽을 수 있는 한 문장 설명
  given: { props?: Record<string, unknown>; state?: Record<string, unknown> }
  when: {
    action: 'render' | 'click' | 'input' | 'focus' | 'blur' | 'custom'
    target?: string
    payload?: unknown
  }
  then: {
    events?: { name: string; assertion: 'emitted' | 'notEmitted'; times?: number; payload?: unknown }[]
    tokens?: { path: string; applied: boolean }[]
    visible?: boolean
    enabled?: boolean
    text?: string
    notes?: string
  }
}
```

given / when / then 3단 구조의 타입 매핑입니다. `when.action`의 `blur`는 예약값으로, 현재 어떤 케이스에서도 사용되지 않습니다. 필드의 의미는 [케이스 형식](../cases/case-format)을 참고하세요.

## codegen 입력과 산출물

### `CodegenInput`

```ts
interface CodegenInput {
  tokens: TokenSet
  specs: ComponentSpec[]
  cases: ComponentCases[]
  version: string          // package.json의 버전 번호, 각 산출물의 헤더 주석에 기록됨
}
```

`main()`이 조립하여 각 target의 `generate()`에 전달합니다. 현재 각 target은 `input.tokens`만 소비하며, `specs` / `cases`는 향후 컴포넌트 문서 / 타입 골격 / 테스트 생성을 위해 예약되어 있습니다.

### `CodegenTarget`

```ts
interface CodegenTarget {
  name: string             // 로그 접두사(예: 'android')
  outDir: string           // dist 아래의 하위 디렉터리 이름
  generate(input: CodegenInput): GeneratedFile[]
}
```

각 플랫폼 target이 이 인터페이스를 구현합니다. 플랫폼을 새로 추가한다는 것은 target을 새로 추가하여 `index.ts`의 `targets` 배열에 넣는 것을 의미합니다.

### `GeneratedFile`

```ts
interface GeneratedFile {
  relativePath: string     // dist/<outDir>/에 대한 상대 출력 경로
  content: string
}
```

## 관련 모듈

| 모듈 | 담당 |
| --- | --- |
| [파이프라인 개요](./pipeline) | `index.ts`의 조립과 핵심 인터페이스 요약 |
| [적재 계층 load.ts](./load) | `RawToken` / `ComponentSpec` / `ComponentCases`를 산출 |
| [해석 계층 resolve.ts](./resolve) | `TokenSet`(`ResolvedToken` + `DarkOverrides`)을 산출 |
| [5개 타깃](./targets) | `CodegenInput`을 소비하여 `GeneratedFile`을 산출 |
