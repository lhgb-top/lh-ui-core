---
title: "해석 계층 resolve.ts"
---

> 참조 해석과 다크 병합.

`resolveTokens(files: LoadedTokenFile[]): ResolveResult`가 핵심 함수이며, 3단 구조입니다:

## 반환값

```ts
interface ResolveResult {
  tokenSet: TokenSet                    // 라이트 토큰 집합 + 다크 덮어쓰기 표
  orphanDarkPaths: string[]             // 고아 다크 경로(verify 보고용)
  refMap: Map<string, string>           // path -> 원본 ref 문자열(다크 키는 dark: 접두사 포함)
}
```

## 1단계: 라이트 접기

모든 비다크 파일의 `flat`을 단일 `rawMap`으로 합칩니다:

```ts
if (rawMap.has(path)) throw new Error(`토큰 경로가 중복 정의됨: ${path} (파일 ${file.fileName})`)
```

각 레코드는 세 개의 값을 가집니다:

| 필드 | 의미 |
| --- | --- |
| `token` | 조립 중인 `ResolvedToken`(타입은 먼저 `raw.type ?? file.defaultType`로 폴백) |
| `raw` / `ref` | 원본 값과 참조 문자열 |
| `ownType` | **리프 자신이 선언한 type**, "리프가 자체 선언한 것"과 "파일 수준 기본값"을 구분하기 위한 전용 |

`ownType`는 3계층 타입 우선순위의 핵심입니다: ref가 해석되어 돌아온 뒤, **`ownType === undefined`인 경우에만** 참조 목표의 타입을 따릅니다.

## 2단계: ref 해석

인라인 함수 `resolveRef(path, chain): { value, type? }`:

1. `rawMap.get(path)`가 존재하지 않음 → `참조하는 토큰이 존재하지 않음: <path>`를 throw
2. 목표 자체도 ref → 재귀 `resolveRef(entry.ref, [...chain, path])`
3. `chain.includes(path)` → `토큰 참조 순환 감지: a -> b -> a`를 throw
4. 리터럴 값에 도달 → `{ value, type }` 반환

주 루프는 ref가 있는 각 엔트리에 대해:

```ts
refMap.set(path, entry.ref)                    // 참조 관계 기록
const resolved = resolveRef(entry.ref, [path])
entry.token.value = resolved.value             // 리터럴 값으로 베이크
entry.token.refChain = [entry.ref]             // 참조 체인 기록
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type             // 타입은 원본을 따름
}
```

마지막으로:

```ts
if (entry.token.type === undefined) {
  throw new Error(`토큰 ${path}에 타입 없음(자체 type도 없고 파일 수준 $type도 없음)`)
}
assertTypedValue(entry.token.type, value)      // 의미 검증
```

결과는 path 사전순으로 정렬하고, 동시에 `byPath` 인덱스를 구축합니다.

## 3단계: 다크 덮어쓰기

다크 파일은 **덮어쓸 키**만 선언합니다.

**다크 네임스페이스 뷰**: 먼저 모든 다크 파일의 `flat`을 다시 접어 `darkRawMap`을 만듭니다(`path -> { value, ref }`).

**인라인 함수 `resolveDarkRef(path, chain): TokenValue`** — 다크 ref의 근접 해석:

| 상황 | 동작 |
| --- | --- |
| 목표가 `darkRawMap`에 있고 ref | **다크 네임스페이스 내**에서 체인을 따라 재귀(다크가 다크를 참조해야 같은 테마의 값을 취함), 마찬가지로 순환 감지 |
| 목표가 `darkRawMap`에 있고 리터럴 값 | 다크 값 반환 |
| 목표가 `darkRawMap`에 **없음** | **라이트 네임스페이스로 폴백** `resolveRef(path, chain).value` |

**다크 엔트리 순회**:

```ts
if (raw.ref) {
  // 목표는 byPath / rawMap / darkRawMap 중 하나에 반드시 존재해야 함
  if (!byPath.has(raw.ref) && !rawMap.has(raw.ref) && !darkRawMap.has(raw.ref)) {
    throw new Error(`다크 토큰 ${path}의 참조가 존재하지 않음: ${raw.ref}`)
  }
  value = resolveDarkRef(raw.ref, [path])
  refMap.set(`dark:${path}`, raw.ref)    // 다크 키는 접두사 포함
}
const type = raw.type ?? byPath.get(path)?.type
if (!type) { orphanDarkPaths.push(path); continue }   // 타입 누락 → 이 키를 건너뜀
assertTypedValue(type, value)
if (!byPath.has(path)) orphanDarkPaths.push(path)     // 고아 → 여전히 덮어쓰기 표에 씀
dark.set(path, value)
```

## 고아 다크 경로

두 종류의 비정상은 **codegen을 중단하지 않고** `orphanDarkPaths`에만 기록하여 `pnpm verify:tokens`에 보고를 맡깁니다:

- 다크 키의 **타입 누락**(자체 type도 없고 라이트 집합에도 상속받을 같은 이름의 키가 없음) → **이 키를 건너뛰고 덮어쓰기 표에 쓰지 않음**
- 다크 키가 라이트 집합에 **존재하지 않음**(고아) → **여전히 덮어쓰기 표에 쓰지만** 보고

자세한 내용은 [다크 모드 병합](../tokens/dark-mode)을 참고하세요.

## 각 플랫폼이 `dark`를 소비하는 방법

`dark`는 평면 `Map<path, TokenValue>`이며, 각 플랫폼 target이 어떻게 내보낼지 각자 결정합니다(Kotlin / Swift / ArkTS는 독립적인 `LhDarkTokens` 네임스페이스, C는 같은 이름의 매크로 재정의). 자세한 내용은 [다섯 target](./targets)을 참고하세요.
