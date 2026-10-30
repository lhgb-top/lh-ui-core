---
title: "docs 산출물"
---

**경로**: `dist/docs/`

이것은 codegen의 다섯 번째 target(`docsTarget`)이며, **유일하게 handlebars 템플릿을 사용하지 않는** target입니다 — 코드로 직접 문자열을 조립합니다.

## 세 가지 산출물

### `tokens.md` — 토큰 빠른 참조표

**최상위 네임스페이스**별로 `##` 섹션을 나누고(button / cell / checkbox / color / dialog / icon / input / loading / motion / navbar / picker / radio / radius / shadow / spacing / switch / tag / textarea / toast / typography / zIndex), 각 섹션마다 5열 표를 만듭니다:

```markdown
## button

| 토큰 | 타입 | 라이트 | 다크 | 설명 |
| --- | --- | --- | --- | --- |
| `button.borderRadius` | dimension | 2px | — | 버튼 모서리 둥글기가 전역 모서리 둥글기를 따름 |
| `button.height.medium` | dimension | 40px | — | 네이티브 추가, 중간 크기 버튼 높이(기본) |
| `color.primary.default` | color | #2B4C7C → #2b4c7c | #3D649E → #3d649e | 주 색상(남색 — 청화자(青花瓷, ceramic blue)의 청색) |
```

특징:

- 토큰 열은 **전체 점 경로**
- 색상 열은 "원본 값 → 정규화된 소문자" 두 개를 표시
- `nativeOnly` 항목은 설명 열에 "네이티브 추가"로 표시
- 덮어쓰기가 없는 다크 열은 `—`(현재 다크는 `color.*`만 덮어씀)

### `tokens.light.json` — 라이트 평면 스냅샷

```json
{
  "button.borderRadius": "2px",
  "button.fontWeight": 400,
  "button.height.medium": "40px",
  "color.primary.default": "#2B4C7C"
}
```

`{ path -> 베이크된 값 }`의 평면 매핑, 기계 소비용.

### `tokens.dark.json` — 다크 덮어쓰기 표

```json
{
  "color.focus": "#7FA6D9",
  "color.selected": "#B1C1D8",
  …
}
```

**덮어쓰기된 키**만 포함(모두 `color.*`, 정확한 항목 수는 버전에 따라 달라짐), path 순으로 정렬.

## 소비자

| 소비자 | 사용하는 것 |
| --- | --- |
| **이 문서 사이트** | `dist/docs/`를 직접 소비하지 않음 — [토큰 레퍼런스](../tokens/reference) 페이지는 `.astro` 페이지가 **동일한** `loadTokenFiles` + `resolveTokens` 파이프라인으로 실시간 렌더링하여 소스와 동기화됨 |
| 가족 문서 사이트 | `tokens.md`를 토큰 빠른 참조로 삽입 |
| 각 플랫폼 정렬 | `tokens.light.json` / `tokens.dark.json`으로 빌드 시 비교 |
| 기준선 문서 필터링 | `nativeOnly` 표시를 "네이티브 추가 토큰" 목록에 사용 |

## 머리 가드

`tokens.md`의 시작 부분:

```html
<!-- 이 파일은 @lh-ui/core가 자동으로 생성했습니다, 수동으로 수정하지 마세요. 소스: @lh-ui/core tokens -->
```

각 플랫폼 산출물의 "수동 수정 금지" 배너와 같은 이치(레드라인 6).

## 문서 사이트 참조 페이지와의 차이

| | `dist/docs/tokens.md` | 문서 사이트 토큰 레퍼런스 페이지 |
| --- | --- | --- |
| 생성 시점 | `pnpm codegen` | `pnpm docs:build` / `docs:dev` |
| 데이터 소스 | codegen 메모리의 `tokenSet` | `.astro` 페이지 frontmatter가 `loadTokenFiles` + `resolveTokens`를 다시 실행 |
| 형태 | 정적 markdown 표 | 상호작용 가능한 Astro 표(필터, 색상 칩 미리보기) |
| 위치 | `dist/`(gitignore, 버전 관리 제외) | 사이트 페이지(빌드 산출물은 `docs/dist/`) |

두 가지는 **동일한 해석 파이프라인**을 거치므로 값이 항상 일치합니다. 차이는 표현 형태와 빌드 진입점뿐입니다.
