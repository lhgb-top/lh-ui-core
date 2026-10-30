---
title: "토큰 형식"
---

각 `tokens/*.json` 파일은 플랫폼 독립적인 중성 소스이며, 형식은 `tokens/schema.json`이 강하게 제약합니다.

## 파일 수준 메타 속성

`$`로 시작하는 키는 메타 속성이며 토큰을 생성하지 않습니다:

| 속성 | 역할 |
| --- | --- |
| `$schema` | `./schema.json`을 가리킴(에디터 자동 완성 + 검증) |
| `$description` | 파일 설명, docs target과 기준선 문서에 나타남 |
| `$type` | **파일 수준 기본 타입**, 자체 `type`을 선언하지 않은 리터럴 리프가 이것을 상속 |
| `$dark` | `true`이면 이 파일은 다크 덮어쓰기 파일(덮어써야 하는 키만 선언) |
| `$namespace` | 네임스페이스 접두사, 전역 점 경로를 결정([네임스페이스](./namespace) 참고) |

```json
{
  "$schema": "./schema.json",
  "$namespace": "color",
  "$type": "color",
  "$description": "색판과 의미 색상",
  "primary": { "default": { "value": "#2B4C7C" } }
}
```

## 리프 토큰의 다섯 필드

| 필드 | 필수 | 역할 |
| --- | --- | --- |
| `value` | `ref`와 **둘 중 하나** | 리터럴 값 |
| `ref` | `value`와 **둘 중 하나** | 다른 토큰의 전체 경로(빌드 시 정적으로 해석되어 베이크됨) |
| `type` | 선택 | 토큰 타입, 선언하지 않으면 파일 수준 `$type`을 상속 |
| `description` | 선택 | 설명, 각 플랫폼 산출물의 주석과 문서 표에 렌더링됨 |
| `nativeOnly` | 선택 | `true` = 네이티브 혈통에 추가, Web 혈통에 대응 항목이 없음 |

schema는 `anyOf: [{required: [value]}, {required: [ref]}]` + `additionalProperties: false`를 통해 모든 리프가 `value`와 `ref` 중 **정확히 하나**를 가지며, 여분의 필드를 허용하지 않습니다.

## 7가지 타입

`type` / `$type`에는 이 7개의 값만 허용됩니다:

| 타입 | 값의 형태 | 예 |
| --- | --- | --- |
| `color` | `#RGB` / `#RRGGBB` / `#AARRGGBB` / `rgba(r,g,b,a)` | `"#2B4C7C"`, `"rgba(61, 100, 158, 0.25)"` |
| `dimension` | **단위가 있는 문자열만** `"12px"` / `"50%"`(`assertTypedValue`가 문자열을 강제, 순수 수치는 `number` 타입에서만 합법) | `"40px"`, `"50%"` |
| `number` | 순수 수치 | `400`, `1000` |
| `string` | 문자열 | `"PingFang SC"` |
| `shadow` | 공백으로 구분된 그림자 문자열(`x y blur [spread] color`) | `"0px 2px 12px 0px rgba(26, 26, 26, 0.08)"` |
| `duration` | `"200ms"` / `"0.2s"`(밀리초로 정규화) | `"200ms"` |
| `cubicBezier` | 4원소 배열 | `[0.4, 0, 0.2, 1]` |

타입과 값이 일치하지 않으면(예: `type: color`에 `40px`) resolve 단계에서 `assertTypedValue`가 거부합니다. 자세한 내용은 [타입 시스템](./type-system)을 참고하세요.

## 중성값 제약(레드라인 5)

토큰 값에는 **중성 표현만 허용**됩니다:

- ✅ 16진수 색상값, `rgba()`, `"12px"` / `"50%"` 단위 문자열, `number` 타입의 순수 수치
- ❌ `var()`, `rem`, `sp`, `dp` 등 모든 플랫폼 전용 단위나 참조

플랫폼 단위 환산은 각 target 템플릿이 담당합니다:

| 플랫폼 | 환산 |
| --- | --- |
| Android | `usesSp()`로 글자 크기는 `sp`, 나머지는 `dp` 판정 |
| iOS | 치수 `CGFloat`, 지속 시간 **초로 변환**(`(ms/1000)`, SwiftUI 애니메이션은 초 단위) |
| HarmonyOS | 치수는 순수 `vp` 수치 |
| C | 순수 수치, 주석으로 단위 설명(색상값 `0xAARRGGBB`, 치수는 논리 픽셀, 지속 시간은 밀리초) |

## 그룹 중첩

모든 계층에서 그룹을 중첩할 수 있으며, 그룹은 자신의 `$type`을 선언해 그룹 전체의 기본 타입을 덮어쓸 수 있습니다:

```json
"fontSize": {
  "$type": "dimension",
  "base": { "value": "14px" },
  "small": { "value": "13px" }
}
```

`typography.json`에는 파일 수준 `$type`이 없고, 그룹 수준 `$type`이나 리프 자체의 `type`으로 각각 선언합니다.

## `nativeOnly` 표시

네이티브 혈통에 추가되어 Web 혈통에 대응 항목이 없는 토큰(대부분 모바일에서 새로 추가된 치수)으로 표시합니다. 역할:

- `dist/docs/tokens.md`의 설명 열에 "네이티브 추가" 표시
- 가족 기준선 문서가 이를 바탕으로 "네이티브 추가 토큰" 목록을 걸러냄
- **각 네이티브 target은 걸러내지 않고** 있는 그대로 생성

## 파일 목록

| 파일 | `$namespace` | `$type` | 설명 |
| --- | --- | --- | --- |
| `color.json` | `color`(파일 이름에서 유도) | `color` | 색판과 의미 색상 |
| `color-dark.json` | `color`(명시, 라이트와 같은 네임스페이스여야 함) | `color` | 다크 증분 덮어쓰기 |
| `components.json` | `""` | `dimension` | 컴포넌트 수준 토큰 |
| `typography.json` | `typography` | 없음(그룹/리프가 각각 선언) | 타이포그래피 |
| `spacing.json` | `spacing` | `dimension` | 간격 스케일 |
| `radius.json` | `radius` | `dimension` | 모서리 둥글기 |
| `shadow.json` | `shadow` | `shadow` | 그림자 |
| `motion.json` | `motion` | 없음(그룹/리프가 각각 선언) | 지속 시간과 이징 |
| `z-index.json` | `zIndex`(명시) | `number` | 쌓임 순서 |
