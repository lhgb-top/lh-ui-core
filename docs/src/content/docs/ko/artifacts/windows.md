---
title: "Windows 산출물"
---

**경로**: `dist/windows/Tokens/LhTokens.cs`와 `LhDarkTokens.cs`, 그림자 토큰이 있을 때 추가로 `LhShadow.cs`, 베지어 토큰이 있을 때 추가로 `LhEasing.cs`가 생성됩니다

**네임스페이스**: `Top.Lhgb.Ui.Tokens`(역도메인, 마스터 플랜 D20)

## 구조

중첩 `public static class`로 토큰 계층을 표현하고, 멤버는 `public static readonly`입니다:

```csharp
public static class LhTokens {
  public static class Button {
    public static readonly double BorderRadius = 2.0;  // 버튼 모서리 둥글기가 전역 모서리 둥글기를 따름
    public static class Height {
      public static readonly double Large = 48.0;  // 큰 크기 버튼 높이
      public static readonly double Medium = 40.0;  // 중간 크기 버튼 높이(기본)
      public static readonly double Small = 32.0;  // 작은 크기 버튼 높이
    }
    // ...
  }
  public static class Color {
    public static class Primary {
      public static readonly Windows.UI.Color Default = Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C);
    }
  }
}
```

## 멤버 명명 규칙

`csMemberName(name)`: **PascalCase**로 변환(`default → Default`, `extraLarge → ExtraLarge`), `default` / `base` 등 C# 문맥 키워드도 함께 회피합니다. 그룹 이름도 마찬가지로 PascalCase를 따릅니다.

## 단위와 리터럴

| 토큰 타입 | C# 리터럴 | 필드 타입 |
| --- | --- | --- |
| 색상 | `Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C)` | `Windows.UI.Color` |
| 치수(정수) | `40.0` | `double` |
| 치수(소수) | `0.5` | `double` |
| 백분율 | `0.5  // 50%(비율, 컨테이너 크기로 환산)` | `double` |
| 지속 시간 | `200  // 200ms(밀리초)` | `int` |
| 베지어 | `new LhEasing(0.4, 0, 0.2, 1)` | `LhEasing` |
| 그림자 | `new LhShadow(0xFF..., 0.0, 2.0, 8.0)` | `LhShadow` |
| 문자열 | `"'Source Code Pro', ..."` | `string` |

단위 관례: **치수는 epx(논리 픽셀, 수치를 그대로 사용)**, **지속 시간은 밀리초**(컴포넌트 측에서 `TimeSpan.FromMilliseconds(...)`), **색상은 ARGB**.

### Windows.UI.Color를 사용하는 이유

Windows App SDK 1.6 이하에는 `Microsoft.UI.Color` 구조체가 **존재하지 않으며**, `Microsoft.UI.Colors` 색상 표의 속성이 반환하는 것도 `Windows.UI.Color`입니다. 따라서 토큰 측은 모두 `Windows.UI.Color`를 사용합니다 — `FromArgb` 팩터리가 내장되어 있고, Colors 표와 타입이 일치합니다. 컴포넌트 측에서 Colors 표를 참조하려면 `using Microsoft.UI;`(Colors) + `using Windows.UI;`(Color)가 필요합니다.

## 다크: 병렬 객체

`LhDarkTokens`는 `LhTokens`와 병렬인 독립 객체이며, **`Color` 서브클래스만 포함**:

```csharp
public static class LhDarkTokens {
  public static class Color {
    public static readonly Windows.UI.Color Focus = Windows.UI.Color.FromArgb(0xFF, 0x7F, 0xA6, 0xD9);
    // ...
  }
}
```

다크는 색상만 덮어씁니다, **치수 / 모션 / 모서리 둥글기는 다크에서 변하지 않으며**, 컴포넌트가 다크 치수가 필요할 때는 라이트 객체의 값을 취합니다. 이는 android / ios / harmony 세 플랫폼의 형태와 완전히 일치합니다.

## 운반체 구조

`LhShadow.cs`와 `LhEasing.cs`는 모두 `readonly record struct`입니다(WinUI에는 복합 그림자와 베지어에 직접 대응하는 타입이 없음):

```csharp
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
public readonly record struct LhEasing(double X1, double Y1, double X2, double Y2);
```

그림자의 `spread`(확장량)는 모든 플랫폼에서 무시되고 주석으로 설명합니다(WinUI DropShadow가 미지원). 예: `// 확장량 0px WinUI DropShadow가 지원하지 않아 무시됨`.

## 소비 방식

Windows 리포지터리(`lh-ui-windows`)의 `pnpm link:tokens`가 `dist/windows/` 트리 전체를 `src/Tokens/`에 복사(위치는 소스 루트 아래의 `Tokens/` 서브디렉터리)하며, 컴포넌트 측은 `using Top.Lhgb.Ui.Tokens;`으로 이곳을 가리킵니다. 3단계 존재 여부 가드(로컬 dist → npm `@lh-ui/core` → 오류)는 [로컬 연결](../guide/local-linking)을 참고하세요.
