---
title: "새 컴포넌트 추가 흐름"
---

네이티브 혈통에 새 컴포넌트를 추가할 때는 다섯 단계를 순서대로 거칩니다.

## 1. 컴포넌트 계약 작성 `specs/<name>.json`

props / 열거형 / 기본값 / 이벤트 / 슬롯 / 동작 / 소비하는 토큰을 선언합니다.

```json
{
  "$schema": "./schema.json",
  "name": "stepper",
  "component": "LhStepper",
  "since": "0.1.0",
  "description": "스텝퍼: 지정된 범위 내에서 스텝 단위로 값을 증감합니다.",
  "props": [
    { "name": "value", "type": "number", "default": 0, "description": "현재 값(제어됨)" },
    { "name": "step", "type": "number", "default": 1, "description": "스텝 크기" },
    { "name": "disabled", "type": "boolean", "default":  false, "description": "비활성화 여부" }
  ],
  "events": [
    { "name": "onChange", "payload": [{ "name": "value", "type": "number", "description": "변경 후의 값" }], "description": "값이 변할 때 발생" }
  ],
  "behaviors": [
    "disabled가 true일 때: 증감 버튼이 응답하지 않고 onChange를 발생시키지 않음"
  ],
  "tokenRefs": ["stepper.height", "stepper.buttonSize"]
}
```

필드 제약에 대한 자세한 내용은 [계약 형식](../specs/spec-format)을 참고하세요.

## 2. 골든 케이스 작성 `cases/<name>.json`

크로스 플랫폼 보증이 필요한 동작마다 given/when/then 어서션을 한 개씩 작성합니다:

```json
{
  "$schema": "./schema.json",
  "component": "stepper",
  "cases": [
    {
      "id": "disabled-blocks-change",
      "name": "비활성화 상태는 onChange를 발생시키지 않음",
      "given": { "props": { "disabled": true } },
      "when": { "action": "click", "target": "증가 버튼" },
      "then": {
        "events": [{ "name": "onChange", "assertion": "notEmitted" }],
        "enabled": false
      }
    }
  ]
}
```

형식에 대한 자세한 내용은 [케이스 형식](../cases/case-format)을 참고하세요.

## 3. 검증 실행

```bash
pnpm verify:specs
```

case와 spec의 일치성을 검증합니다: case의 `given.props` 키가 모두 spec의 props에 있는지, `then.events[].name`이 모두 spec의 events에 있는지 등.

## 4. 컴포넌트 수준 토큰 추가(필요한 경우)

컴포넌트가 새로운 **컴포넌트 수준 토큰**(예: `stepper.height`)을 도입한 경우, `tokens/components.json`의 해당 컴포넌트 네임스페이스 아래에 키를 추가합니다:

```json
"stepper": {
  "height": { "value": "32px", "description": "스텝퍼 높이", "nativeOnly": true },
  "buttonSize": { "value": "24px", "description": "증감 버튼 크기" }
}
```

그리고:

```bash
pnpm codegen      # dist/ 재생성
pnpm verify:tokens
pnpm test -- -u   # 스냅샷 업데이트
```

새 토큰이 **브랜드 수준**(컴포넌트 치수가 아닌 색판, 간격 스케일 등 전역량)인 경우, 해당 `tokens/<category>.json`를 수정하고, 가족 `docs/설계 언어 기준선.md`의 "변경 등록" 섹션에 등록합니다.

## 5. 릴리스

```bash
pnpm changeset    # changeset 작성
pnpm changeset:version
```

core가 먼저 릴리스되고, 각 네이티브 플랫폼이 이어서 토큰 의존성 버전을 올리며, `cases/stepper.json`에 따라 케이스를 사람이 로컬 테스트로 번역합니다(JUnit / XCTest / ohpm test / C 단위 테스트).

## checklist

- [ ] `specs/<name>.json`이 존재하고 `pnpm verify:specs`를 통과
- [ ] `cases/<name>.json`이 존재하고 spec과 일치
- [ ] 새 토큰이 `tokens/`에 추가되었고 `pnpm verify:tokens`를 통과
- [ ] `pnpm codegen` 성공, `pnpm test` 스냅샷 업데이트 완료
- [ ] changeset 작성 완료
- [ ] (브랜드 수준 토큰) 가족 기준선 문서에 등록 완료
