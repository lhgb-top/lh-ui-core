---
title: "네임스페이스와 점 경로"
---

## 규칙

**토큰의 전역 점 경로 = `$namespace` + 파일 내 중첩 경로.**

```
tokens/color.json        "$namespace": "color"
                         primary.default.value = "#2B4C7C"
                         → 전체 경로 color.primary.default

tokens/z-index.json      "$namespace": "zIndex"
                         modal.value = 1050
                         → 전체 경로 zIndex.modal
```

모든 크로스 파일 참조(`ref`, spec의 `tokenRefs`, cases의 `then.tokens`)는 **반드시 전체 경로를 적어야 합니다**.

## 세 가지 네임스페이스 경우

### 1. 기본: 파일 이름으로 유도

`$namespace`를 선언하지 않으면, 파일 이름을 `-`로 분할해 유도합니다(`namespaceFromFileName`). 첫 단어는 그대로 두고, 나머지 단어의 첫 글자를 대문자로 바꾼 뒤 이어 붙입니다.

| 파일 이름 | 유도 결과 |
| --- | --- |
| `color.json` | `color` |
| `z-index.json` | `zIndex` |
| `typography.json` | `typography` |
| `color-dark.json` | `colorDark`(**유도값이지만, 실제로는 사용하지 않음**) |

유도는 **폴백**일 뿐입니다 — 다크 파일은 모두 `$namespace`를 명시적으로 선언해 라이트와 맞춥니다(아래 참고).

### 2. 명시적 선언

`$namespace`를 직접 적습니다:

```json
{ "$namespace": "zIndex", "modal": { "value": 1050 } }
```

**다크 파일은 라이트 파일과 동일한 `$namespace`를 반드시 명시적으로 선언해야** 합니다. 그렇지 않으면 덮어쓰기 키가 같은 경로에 떨어지지 않습니다:

```json
// color-dark.json
{ "$namespace": "color", "$dark": true, "primary": { "default": { "value": "#3D649E" } } }
```

이렇게 해야 `color.primary.default`의 다크 덮어쓰기가 라이트의 같은 경로에 올바르게 병합됩니다.

### 3. 빈 문자열: 최상위 키가 곧 네임스페이스

`components.json`은 `"$namespace": ""`를 선언하므로 **최상위 키가 컴포넌트 네임스페이스**가 되고, 전체 경로는 곧 `button.height.medium`, `input.borderRadius`입니다:

```json
{
  "$namespace": "",
  "$type": "dimension",
  "button": {
    "height": { "medium": { "value": "40px" } }
  }
}
```

## 네임스페이스의 실제 영향

- **`dist/docs/tokens.md`**는 최상위 네임스페이스별로 `##` 섹션을 나눔(button / color / motion / zIndex …)
- **resolve 단계**는 전체 경로로 중복을 검사: 두 라이트 파일에 같은 경로가 나타나면 즉시 오류
- **다크 병합**은 전체 경로로 덮어쓰기 키를 매칭
- **각 플랫폼 target**은 경로의 세그먼트를 분할해 중첩 구조를 구축(Android `object Color`, Swift `enum Color`, C `LH_COLOR_*`)

## 전체 예

```
color.primary.active          ← color.json
button.height.medium          ← components.json(빈 문자열 네임스페이스)
typography.fontSize.base      ← typography.json
zIndex.modal                  ← z-index.json(명시)
motion.easing.easeInOut       ← motion.json(그룹 중첩)
```

[토큰 레퍼런스](./reference) 페이지에서 네임스페이스별로 모든 토큰을 바로 둘러볼 수 있습니다.
