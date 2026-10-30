---
title: "Процесс добавления компонента"
---

Добавление нового компонента в направление native состоит из пяти последовательных шагов.

## 1. Написать контракт компонента `specs/<name>.json`

Объявить props / перечисления / значения по умолчанию / события / слоты / поведение / потребляемые токены.

```json
{
  "$schema": "./schema.json",
  "name": "stepper",
  "component": "LhStepper",
  "since": "0.1.0",
  "description": "Степпер: увеличивает и уменьшает значение на заданный шаг в заданном диапазоне.",
  "props": [
    { "name": "value", "type": "number", "default": 0, "description": "Текущее значение (управляемое)" },
    { "name": "step", "type": "number", "default": 1, "description": "Шаг" },
    { "name": "disabled", "type": "boolean", "default":  false, "description": "Отключён ли компонент" }
  ],
  "events": [
    { "name": "onChange", "payload": [{ "name": "value", "type": "number", "description": "Значение после изменения" }], "description": "Срабатывает при изменении значения" }
  ],
  "behaviors": [
    "При disabled === true: кнопки увеличения/уменьшения не реагируют, onChange не срабатывает"
  ],
  "tokenRefs": ["stepper.height", "stepper.buttonSize"]
}
```

Ограничения на поля — в [Формат контракта](../specs/spec-format).

## 2. Написать золотые сценарии `cases/<name>.json`

Для каждого поведения, требующего межплатформенной гарантии, пишется утверждение given/when/then:

```json
{
  "$schema": "./schema.json",
  "component": "stepper",
  "cases": [
    {
      "id": "disabled-blocks-change",
      "name": "В отключённом состоянии onChange не срабатывает",
      "given": { "props": { "disabled": true } },
      "when": { "action": "click", "target": "Кнопка увеличения" },
      "then": {
        "events": [{ "name": "onChange", "assertion": "notEmitted" }],
        "enabled": false
      }
    }
  ]
}
```

Формат — в [Формат сценариев](../cases/case-format).

## 3. Запустить проверку

```bash
pnpm verify:specs
```

Проверяется согласованность cases и spec: входят ли ключи `given.props` case'а в props spec'а, присутствуют ли имена из `then.events[].name` в events spec'а и т. д.

## 4. Добавить токены компонентного уровня (если нужно)

Если компонент вводит новые **токены компонентного уровня** (например, `stepper.height`), добавьте ключи в пространство имён соответствующего компонента в `tokens/components.json`:

```json
"stepper": {
  "height": { "value": "32px", "description": "Высота степпера", "nativeOnly": true },
  "buttonSize": { "value": "24px", "description": "Размер кнопок увеличения/уменьшения" }
}
```

Затем:

```bash
pnpm codegen      # Перегенерировать dist/
pnpm verify:tokens
pnpm test -- -u   # Обновить снапшоты
```

Если новый токен относится к **брендовому уровню** (палитра, шкала отступов и другие глобальные величины, а не размеры компонента), измените соответствующий `tokens/<category>.json` и зарегистрируйте изменение в разделе «Регистрация изменений» семейного документа `docs/设计语言基线.md`.

## 5. Релиз

```bash
pnpm changeset    # Написать один changeset
pnpm changeset:version
```

Сначала выходит релиз core, затем каждая нативная платформа повышает версию зависимости от токенов и вручную переводит сценарии из `cases/stepper.json` в локальные тесты (JUnit / XCTest / ohpm test / C-тесты).

## Чек-лист

- [ ] `specs/<name>.json` существует, `pnpm verify:specs` проходит
- [ ] `cases/<name>.json` существует и согласован со spec
- [ ] Новые токены добавлены в `tokens/`, `pnpm verify:tokens` проходит
- [ ] `pnpm codegen` выполняется успешно, снапшоты `pnpm test` обновлены
- [ ] changeset написан
- [ ] (Брендовые токены) изменение зарегистрировано в базовом документе семейства
