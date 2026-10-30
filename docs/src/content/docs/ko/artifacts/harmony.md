---
title: "HarmonyOS 산출물"
---

**경로**: `dist/harmony/tokens/LhTokens.ets`와 `LhDarkTokens.ets`, 그림자 토큰이 있을 때 추가로 `LhShadow.ets`가 생성됩니다

**모듈 디렉터리**: `tokens/`(ohpm 모듈 내)

## 구조

루트는 `export class`, 중첩 클래스는 **export를 붙이지 않고**(ArkTS 클래스 본문에는 export 선언이 허용되지 않음), 멤버는 `static readonly`입니다:

```ts
export class LhTokens {
  class Button {
    static readonly borderRadius: Dimension | number = 2  // 버튼 모서리 둥글기가 전역 모서리 둥글기를 따름
    static readonly borderWidth: Dimension | number = 1
    class FontSize {
      static readonly large: Dimension | number = 16
      static readonly medium: Dimension | number = 14
    }
    class Height {
      static readonly medium: Dimension | number = 40  // 중간 크기 버튼 높이(기본)
    }
  }
  class Color {
    static readonly focus: ResourceColor = '#FF2B4C7C'
  }
}
```

## 명명 매핑

| 토큰 경로 | ArkTS 멤버 |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

## 유일하게 타입 주석이 있는 플랫폼

ArkTS는 강타입이므로 모든 멤버에 타입 주석이 있습니다(`typeAnnotation()`):

| 토큰 타입 | 타입 주석 |
| --- | --- |
| color | `ResourceColor` |
| dimension | `Dimension \| number` |
| duration / number | `number` |
| shadow | `LhShadow` |
| cubicBezier | `number[]` |
| string | `string` |

Kotlin / Swift / C는 모두 리터럴로 자유 추론되지만, ArkTS만 명시적으로 표기합니다.

## 단위와 리터럴

| 토큰 타입 | ArkTS 리터럴 |
| --- | --- |
| 색상 | `'#FF2B4C7C'`(ArkUI는 `#AARRGGBB` 문자열을 받음, `toArgbHash`를 거침) |
| 치수 | 순수 `vp` 수치(`40`, 단위 없음) |
| 백분율 | `0.500  // 50%(비율, 컨테이너 크기로 환산)` |
| 지속 시간 | `200  // 200ms(밀리초)` |
| 베지어 | `[0.4, 0, 0.2, 1]  // 베지어 제어점, 컴포넌트 측에서 curves.cubicBezierCurve로 소비` |
| 그림자 | `{ color: '#FF000000', radius: 8, offsetX: 0, offsetY: 2 }` |
| 수치 / 문자열 | 그대로 / `JSON.stringify` |

## LhShadow.ets

ArkUI에도 복합 그림자 타입이 없으므로 **interface**로 운반체를 만듭니다(**정적 템플릿, 토큰 콘텐츠 없음**):

```ts
export interface LhShadow {
  color: ResourceColor
  /** 흐림 반경 */
  radius: number
  offsetX: number
  offsetY: number
}
```

iOS의 `struct LhShadow`와 비교: ArkTS는 interface, SwiftUI는 구조체를 사용해 각 언어의 관용구에 맞춥니다.

## 다크

독립적인 `export class LhDarkTokens`, 구조는 라이트와 동일:

```ts
export class LhDarkTokens {
  class Color {
    static readonly focus: ResourceColor = '#FF7FA6D9'
    static readonly selected: ResourceColor = '#FFB1C1D8'
    // …나머지 덮어쓰기된 키
  }
}
```

덮어쓰지 않은 키는 다크에서 `LhTokens`를 따릅니다.

## 소비 방식

HarmonyOS 리포지터리는 ohpm의 `file:` 의존성으로 `dist/harmony/`를 도입(로컬 연결)하거나 게시된 패키지를 소비하며, `import { LhTokens } from '...'`로 사용할 수 있습니다.
