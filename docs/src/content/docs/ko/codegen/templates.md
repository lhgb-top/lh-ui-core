---
title: "템플릿 목록"
---

`codegen/templates/` 아래에 총 **8개의 Handlebars 템플릿**이 있으며, **커스텀 helper는 하나도 등록하지 않습니다**(내장 `{{#each}}`와 삼중 중괄호 `{{{ }}}`만 사용).

## 템플릿 → 산출물 → 데이터 필드

| 템플릿 | 렌더링 산출물 | 데이터 필드 |
| --- | --- | --- |
| `android/LhTokens.kt.hbs` | `LhTokens.kt` **과** `LhDarkTokens.kt`(명/암 공용) | `{ version, source, package, imports[], body }` |
| `ios/LhTokens.swift.hbs` | `LhTokens.swift`과 `LhDarkTokens.swift` | `{ version, source, body }` |
| `ios/LhShadow.swift.hbs` | `LhShadow.swift`(정적 템플릿, body 슬롯 없음) | `{ version, source }` |
| `harmony/LhTokens.ets.hbs` | `LhTokens.ets`과 `LhDarkTokens.ets` | `{ version, source, body }` |
| `harmony/LhShadow.ets.hbs` | `LhShadow.ets`(정적 템플릿) | `{ version, source }` |
| `windows/LhTokens.cs.hbs` | `LhTokens.cs`과 `LhDarkTokens.cs` | `{ version, source, namespace, body }` |
| `windows/LhShadow.cs.hbs` | `LhShadow.cs`(정적 템플릿) | `{ version, source, namespace }` |
| `windows/LhEasing.cs.hbs` | `LhEasing.cs`(정적 템플릿) | `{ version, source, namespace }` |

## 통일 헤더 배너

모든 템플릿의 최상단에는 같은 형태의 주석 블록이 있습니다:

```
// =====================================================================================
// 이 파일은 @lh-ui/core가 자동 생성했습니다(빌드 시간 codegen). 수동으로 수정하지 마세요.
// 원본: {{{source}}} @ v{{{version}}}
// 수정하려면 lh-ui-core 저장소의 tokens/*.json을 편집한 뒤 pnpm codegen을 다시 실행하세요.
// =====================================================================================
```

이것이 `dist/`의 수동 수정 금지(레드라인 6)에 대한 코드 수준의 선언입니다.

## 명/암 공용 템플릿

**android / ios / harmony / windows의 명색 산출물과 다크 산출물은 같은 템플릿을 공용**으로 사용하며, 차이는 주입되는 `body`뿐입니다(루트 object / enum / class 이름이 다름).

## 정적 템플릿(캐리어 구조)

`ios/LhShadow.swift.hbs`, `harmony/LhShadow.ets.hbs`, `windows/LhShadow.cs.hbs`, `windows/LhEasing.cs.hbs`는 **body 슬롯이 없으며**, 내용이 완전히 정적입니다:

```handlebars
{{!-- harmony/LhShadow.ets.hbs --}}
/// 그림자 토큰 구조
export interface LhShadow {
  color: ResourceColor
  /** 블러 반경 */
  radius: number
  offsetX: number
  offsetY: number
}
```

SwiftUI / ArkUI / WinUI 모두 「복합 그림자」나 「베지어」에 대응하는 직접 타입이 없어서 단측 캐리어가 필요하기 때문입니다. 반면 Android의 그림자는 플랫폼 API이므로 추가 파일이 필요 없습니다. Windows의 두 캐리어는 모두 `readonly record struct`입니다:

```handlebars
{{!-- windows/LhShadow.cs.hbs --}}
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
```

## 템플릿 예시

```handlebars
{{!-- android/LhTokens.kt.hbs --}}
// 헤더 배너…

package {{{package}}}

{{#each imports}}
{{{this}}}
{{/each}}

{{{body}}}
```

```handlebars
{{!-- windows/LhTokens.cs.hbs --}}
// 헤더 배너…

namespace {{{namespace}}};

{{{body}}}
```

## 설계 원칙

- **얇은 템플릿**: 파일 골격만 담당합니다(헤더 주석, package / namespace, 가드 열고 닫기). 토큰별 리터럴 포맷팅은 모두 target의 TS에서 완료한 뒤 `body`로 템플릿에 먹입니다. 자세한 내용은 [렌더링 계층](./render)을 참고하세요.
- **`noEscape: true`**: 템플릿에는 `<` `>` `#` 등의 문자가 포함되므로(`#ifndef`, `#define`, 제네릭 꺾쇠 괄호) 반드시 HTML 이스케이프를 꺼야 합니다.
- **컴파일 캐시**: `render.ts`의 `loadTemplate`이 컴파일 결과를 캐싱하여 반복 컴파일을 피합니다.

## 템플릿을 새로 추가하는 방법

1. `codegen/templates/<platform>/`에 `.hbs` 파일을 추가합니다
2. 해당 target에서 데이터를 조립하고 `render('<platform>/<name>.hbs', data)`를 호출합니다
3. `pnpm codegen`으로 산출물을 확인하고, `pnpm test -- -u`로 스냅샷을 업데이트합니다
