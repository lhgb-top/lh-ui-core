---
title: "Ajout d'un nouveau composant"
---

L'ajout d'un composant à la lignée native passe par cinq étapes, dans l'ordre.

## 1. Écrire le contrat du composant `specs/<name>.json`

Déclarer les props / énumérations / valeurs par défaut / événements / slots / comportements / jetons consommés.

```json
{
  "$schema": "./schema.json",
  "name": "stepper",
  "component": "LhStepper",
  "since": "0.1.0",
  "description": "Un stepper : incrémente ou décrémente une valeur par pas fixe, à l'intérieur d'une plage donnée.",
  "props": [
    { "name": "value", "type": "number", "default": 0, "description": "La valeur courante (contrôlée)" },
    { "name": "step", "type": "number", "default": 1, "description": "Le pas" },
    { "name": "disabled", "type": "boolean", "default":  false, "description": "Désactivé ou non" }
  ],
  "events": [
    { "name": "onChange", "payload": [{ "name": "value", "type": "number", "description": "La valeur après le changement" }], "description": "Déclenché lorsque la valeur change" }
  ],
  "behaviors": [
    "Lorsque disabled vaut true : les boutons d'incrémentation / décrémentation ne répondent pas et onChange n'est pas déclenché"
  ],
  "tokenRefs": ["stepper.height", "stepper.buttonSize"]
}
```

Les contraintes des champs sont détaillées dans [Format des contrats](../specs/spec-format).

## 2. Écrire les cas dorés `cases/<name>.json`

Pour chaque comportement qui doit être garanti sur toutes les plateformes, écrire une assertion given/when/then :

```json
{
  "$schema": "./schema.json",
  "component": "stepper",
  "cases": [
    {
      "id": "disabled-blocks-change",
      "name": "L'état désactivé ne déclenche pas onChange",
      "given": { "props": { "disabled": true } },
      "when": { "action": "click", "target": "le bouton d'incrémentation" },
      "then": {
        "events": [{ "name": "onChange", "assertion": "notEmitted" }],
        "enabled": false
      }
    }
  ]
}
```

Le format est détaillé dans [Format des cas](../cases/case-format).

## 3. Lancer la validation

```bash
pnpm verify:specs
```

Valide la cohérence entre les cas et le spec : les clés de `given.props` figurent-elles toutes parmi les props du spec, les `then.events[].name` figurent-ils tous parmi les events du spec, etc.

## 4. Compléter les jetons de niveau composant (si nécessaire)

Si le composant introduit de nouveaux **jetons de niveau composant** (comme `stepper.height`), ajoutez les clés sous l'espace de noms du composant correspondant dans `tokens/components.json` :

```json
"stepper": {
  "height": { "value": "32px", "description": "Hauteur du stepper", "nativeOnly": true },
  "buttonSize": { "value": "24px", "description": "La taille des boutons d'incrémentation / décrémentation" }
}
```

Puis :

```bash
pnpm codegen      # Régénérer dist/
pnpm verify:tokens
pnpm test -- -u   # Mettre à jour les instantanés
```

Si les nouveaux jetons sont de **niveau marque** (des quantités globales comme les palettes ou les échelles d'espacement, et non des dimensions de composant), modifiez le `tokens/<category>.json` correspondant et enregistrez la modification dans la section « enregistrement des changements » du document familial `docs/设计语言基线.md`.

## 5. La release

```bash
pnpm changeset    # Écrire un changeset
pnpm changeset:version
```

Core publie sa release en premier ; les cibles natives montent ensuite la version de leur dépendance aux jetons et traduisent manuellement, en s'appuyant sur `cases/stepper.json`, les cas en tests locaux (JUnit / XCTest / ohpm test / tests unitaires C).

## La checklist

- [ ] `specs/<name>.json` existe et `pnpm verify:specs` passe
- [ ] `cases/<name>.json` existe et est cohérent avec le spec
- [ ] Les nouveaux jetons ont été ajoutés dans `tokens/` et `pnpm verify:tokens` passe
- [ ] `pnpm codegen` réussit ; les instantanés `pnpm test` sont à jour
- [ ] Le changeset est écrit
- [ ] (Pour les jetons de niveau marque) Le document de référence familial a été mis à jour
