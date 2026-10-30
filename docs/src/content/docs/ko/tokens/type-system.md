---
title: "타입 시스템"
---

## 7가지 타입

`type`과 파일 수준 `$type`에는 이것만 허용됩니다: `color` / `dimension` / `number` / `string` / `shadow` / `duration` / `cubicBezier`(`tokens/schema.json`의 열거와 1:1 대응, `codegen/src/types.ts`의 `TokenType` 참고).

각 타입의 값의 합법적인 형태는 [토큰 형식](./token-format)을 참고하세요.

## 3계층 타입 우선순위

하나의 리프의 타입은 다음 순서로 평가됩니다:

```
1. 리프 자체가 선언한 type
2. ref가 참조하는 목표의 타입(리프가 자체 type을 선언하지 않은 경우만)
3. 파일 수준 / 그룹 수준 $type
4. 모두 없음 → resolve 단계에서 오류 throw
```

이 우선순위는 **flatten과 resolve 두 단계의 협력**으로 구현됩니다.

### 1단계: flatten(그룹 수준 `$type` 전파)

`load.ts`의 `flatten`은 그룹(파일 루트 포함)이 선언한 `$type`을 트리 아래로 전달하지만, **리터럴 리프에만 구워 넣습니다**:

```ts
// 리터럴 토큰은 그룹 타입을 상속, ref 토큰은 undefined를 유지하고 resolve가 참조 목표에서 타입을 취함
if (node.type === undefined && node.ref === undefined && groupType !== undefined) {
  out.set(path, { ...node, type: groupType })
}
```

**ref 리프는 의도적으로 구워 넣지 않습니다** — 자신이 위치한 파일의 기본 타입에 영향받지 않도록 하기 위해서입니다.

### 2단계: resolve(ref 목표 타입이 파일 수준 기본값을 덮어씀)

`resolve.ts`가 라이트 매핑을 조립할 때:

```ts
token: {
  type: raw.type ?? (file.defaultType as ResolvedToken['type']),  // 먼저 파일 수준 $type으로 폴백
  ...
},
ownType: raw.type,  // "리프가 자체 선언한 타입"과 "파일 수준 기본값"을 구분하는 용도
```

ref가 해석되어 돌아온 뒤:

```ts
// 자체 타입을 선언하지 않은 경우, 참조 목표의 타입을 따름(토큰 타입은 원본을 따름)
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type
}
```

이 단계가 **2번째 계층(ref 목표 타입)을 3번째 계층(파일 수준 `$type`) 위에 덮어씌웁니다**. 마지막으로 타입이 여전히 undefined이면 `토큰 X에 타입 없음`을 throw합니다.

## 3계층이 필요한 이유

전형적인 예: `button.fontWeight`가 `typography.fontWeight.primary`를 참조:

```json
// components.json(파일 수준 $type: dimension)
"button": { "fontWeight": { "ref": "typography.fontWeight.primary" } }

// typography.json
"fontWeight": { "primary": { "value": 400, "type": "number" } }
```

ref 리프도 파일 수준 `dimension`을 먹게 되면 `button.fontWeight`의 타입이 틀려집니다. 3계층 우선순위가 **참조 목표를 따라 `number`를 취하도록** 보장합니다.

또 `typography.json`에는 파일 수준 `$type`이 없고, 그룹 수준 `$type`(`fontSize` 그룹은 `dimension`으로 표시)과 리프 자체의 `type`(`fontWeight.primary`는 자체적으로 `number` 보유)가 각자 맡은 부분을 관리합니다.

## 의미 검증

schema는 구조만 관리합니다. **타입과 값의 일치 여부**는 `format.ts`의 `assertTypedValue`가 resolve 단계에서 하나씩 어서션하고 값을 실제로 해석합니다:

- `color` → `parseColor`로 해석 가능해야 함(16진수 또는 rgba)
- `dimension` → `/^\d+(\.\d+)?(px|%)$/`와 일치
- `duration` → `s` / `ms` 지원
- `shadow` → 공백으로 분할, 4번째 세그먼트가 `-?\d+(\.\d+)?px`와 일치하면 spread, 그렇지 않으면 색상
- `cubicBezier` → 4원소 배열

자세한 내용은 [포맷팅 계층](../codegen/format)을 참고하세요.

## 다크 측의 타입 추론

다크 덮어쓰기 키의 타입 추론은 더 간단합니다: `raw.type ?? byPath.get(path)?.type`. 타입이 누락된 다크 키는 codegen을 실패시키지 않고 `orphanDarkPaths`에 기록되어 `pnpm verify:tokens`가 보고합니다. 자세한 내용은 [다크 모드 병합](./dark-mode)을 참고하세요.
