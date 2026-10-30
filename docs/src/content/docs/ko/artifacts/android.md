---
title: "Android 산출물"
---

**경로**: `dist/android/top/lhgb/ui/tokens/LhTokens.kt`와 `LhDarkTokens.kt`

**패키지 이름**: `top.lhgb.ui.tokens`(역도메인 규칙, 마스터 플랜 D20)

## 구조

토큰은 경로 계층에 따라 **중첩 `object`**로 구성되며, 멤버는 `val`입니다:

```kotlin
package top.lhgb.ui.tokens

import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.animation.core.CubicBezierEasing

object LhTokens {
  object Button {
    val borderRadius = 2.dp  // 버튼 모서리 둥글기가 전역 모서리 둥글기를 따름
    val borderWidth = 1.dp
    object FontSize {
      val large = 16.sp
      val medium = 14.sp
    }
    object Height {
      val medium = 40.dp  // 중간 크기 버튼 높이(기본)
      val small = 32.dp  // 작은 크기 버튼 높이
    }
  }
  object Color {
    val focus = ComposeColor(0xFF2B4C7C)
  }
}
```

## 명명 매핑

| 토큰 경로 | Kotlin 멤버 |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

그룹 이름은 `pascalCase`를 따르고(첫 글자만 대문자), 멤버 이름은 그대로 유지합니다.

## 단위와 리터럴

| 토큰 타입 | Kotlin 리터럴 |
| --- | --- |
| 색상 | `ComposeColor(0xFF2B4C7C)`(ARGB Int) |
| 치수 | `40.dp`, **글자 크기류 토큰(경로에 `fontsize` 포함)은 `.sp`**, 나머지는 `.dp` |
| 백분율 | `0.50f  // 50%(비율, 컨테이너 크기로 환산)` |
| 지속 시간 | `200  // 200ms(밀리초)`(Int) |
| 베지어 | `CubicBezierEasing(0.4f, 0f, 0.2f, 1f)` |
| 그림자 | `Shadow(color = ..., offset = Offset(0f, 2f), blurRadius = 8f)` |
| 수치 / 문자열 | 그대로 / `JSON.stringify` |

dp/sp 판정은 `format.ts`의 `usesSp()`(`/fontsize/i`)를 참고하세요.

## import는 필요에 따라 생성

import 목록은 **실제로 사용되는 런타임 타입**에 따라 결정(`importsFor(features)`), 사용하지 않는 타입은 import하지 않습니다:

| 특성 | import |
| --- | --- |
| 색상 | `androidx.compose.ui.graphics.Color as ComposeColor` |
| 치수 | `androidx.compose.ui.unit.dp` + `.sp` |
| 그림자 | `androidx.compose.ui.graphics.Shadow` + `androidx.compose.ui.geometry.Offset` |
| 베지어 | `androidx.compose.animation.core.CubicBezierEasing` |

## 다크

독립적인 `object LhDarkTokens`, **네임스페이스 구조는 라이트와 동일**:

```kotlin
object LhDarkTokens {
  object Color {
    val focus = ComposeColor(0xFF7FA6D9)  // 키보드 포커스 링 색상, 기본적으로 주 색상을 따름
    val selected = ComposeColor(0xFFB1C1D8)  // 선택 상태 텍스트 색상, 주 색상의 누름 변형을 따름
    object Background {
      ...
    }
  }
}
```

다크는 덮어쓰기된 키만 포함(현재 `color.*`만), 덮어쓰지 않은 키는 다크에서 `LhTokens`의 값을 따릅니다.

## 소비 방식

Android 리포지터리는 `dist/android/` 디렉터리를 Gradle 소스 세트나 로컬 maven 의존성으로 도입하고, `import top.lhgb.ui.tokens.LhTokens`로 사용할 수 있습니다. 로컬 연결은 [로컬 연결](../guide/local-linking)을 참고하세요.
