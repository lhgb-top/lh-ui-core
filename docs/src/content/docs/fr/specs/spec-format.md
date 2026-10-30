---
title: "Format des contrats"
---

Chaque `specs/<name>.json` est le **contrat multiplateforme** d'un composant. Le format est contraint strictement par `specs/schema.json`.

## Structure de premier niveau

```json
{
  "$schema": "./schema.json",
  "name": "button",
  "component": "LhButton",
  "since": "0.1.0",
  "description": "Bouton : déclenche une action immédiate ; prend en charge le type, la taille, l'état de chargement, la désactivation, les icônes et les fonds à motif.",
  "props": [ ... ],
  "events": [ ... ],
  "slots": [ ... ],
  "behaviors": [ ... ],
  "tokenRefs": [ ... ]
}
```

| Champ | Obligatoire | Contrainte |
| --- | --- | --- |
| `name` | Oui | kebab-case : `^[a-z][a-z0-9-]*$`, identique au nom du fichier |
| `component` | Oui | PascalCase avec préfixe Lh : `^Lh[A-Z][a-zA-Z0-9]*$` |
| `description` | Oui | Une description en chinois |
| `props` | Oui | Tableau, au moins un élément (le schéma impose `minItems: 1`) |
| `since` | Non | Version d'introduction |
| `events` / `slots` / `behaviors` / `tokenRefs` | Non | Voir ci-dessous |

`additionalProperties: false` — aucun champ supplémentaire n'est autorisé.

## props

```json
{ "name": "size", "type": "enum", "values": ["small", "medium", "large"], "default": "medium", "description": "Taille du bouton" }
```

| Champ | Obligatoire | Description |
| --- | --- | --- |
| `name` | Oui | camelCase : `^[a-z][a-zA-Z0-9]*$`, **identique sur les cinq cibles** |
| `type` | Oui | Voir le tableau ci-dessous |
| `description` | Oui | Une description en chinois |
| `values` | Non | Les valeurs de l'énumération lorsque `type: enum` (un tableau de chaînes littérales) |
| `items` | **Obligatoire** lorsque `type: array` | Le type des éléments du tableau (`string` / `number` / `boolean`) + description |
| `default` | Non | La valeur par défaut (n'importe quel type JSON) ; omis = pas de valeur par défaut |
| `required` | Non | Booléen, `false` par défaut |

**Les sept types de props** :

| Type | Signification | Correspondance par cible |
| --- | --- | --- |
| `string` | Une chaîne | `String` / `String` / `string` / `const char*` |
| `number` | Un nombre | `Int` / `Double` / `number` / `int` |
| `boolean` | Un booléen | `Boolean` / `Bool` / `boolean` / `bool` |
| `enum` | Une énumération (`values` obligatoire) | Chaque cible génère son propre type d'énumération |
| `tokenRef` | Un chemin pointillé de jeton | Une référence de jeton ; verify en contrôle l'existence du chemin (**réservé, aucun composant ne l'utilise actuellement**) |
| `node` | Un slot / le contenu enfant | Compose content, SwiftUI ViewBuilder, ArkUI Builder, handle d'enfant côté C (**réservé, aucun composant ne l'utilise actuellement**) |
| `array` | Un tableau (`items` obligatoire) | Les options d'un sélecteur, etc. |

## events

```json
{
  "name": "onValueChange",
  "payload": [{ "name": "value", "type": "string", "description": "Le texte après le changement" }],
  "description": "Déclenché quand le texte change ; pas déclenché lorsque disabled ou readonly vaut true"
}
```

- `name` : `^on[A-Z][a-zA-Z0-9]*$`, **identique sur les cinq cibles**
- `payload` : Un tableau de champs (chacun avec `name` + `type` + `description` optionnelle) ; **un tableau vide signifie « sans charge utile »**
- `description` : Obligatoire

## slots

```json
{ "name": "prefix", "description": "Le contenu du préfixe de la zone de saisie (la zone non éditable à gauche)" }
```

`name` est également en camelCase. L'**implémentation côté cible** du slot est portée par une prop de type `node` ou par le mécanisme de slots de chaque cible.

## behaviors

Un tableau de descriptions comportementales en langage naturel, pour l'extraction des cas et la génération de documentation :

```json
"behaviors": [
  "Lorsque disabled vaut true : ne répond pas aux clics, présente le style désactivé (jetons disabled.*), ne déclenche pas onClick",
  "Correspondance des tailles : small/medium/large prennent respectivement les jetons de dimension button.height.<size>, etc."
]
```

## tokenRefs

La liste des **chemins complets** des jetons consommés par le composant, pour que `pnpm verify:specs` en contrôle l'intégrité référentielle :

```json
"tokenRefs": ["button.height.medium", "color.primary.default", "color.onPrimary"]
```

## Pourquoi un nommage aussi strict

Toutes les expressions régulières de nommage servent à **l'alignement entre cibles** : `name` détermine le nom du fichier et celui des tests de chaque cible, `component` est la base des noms de classes de chaque cible, et les noms de props et d'événements restent identiques sur les cinq cibles — c'est ce qui permet de traduire les cas.

## Liste des composants actuels

15 composants : button, cell, checkbox, dialog, icon, input, loading, navbar, picker, radio, switch, tag, text, textarea, toast. Tous les contrats se trouvent dans [Référence des contrats de composants](./reference).
