---
title: "Format des cas"
---

Chaque fichier `cases/<name>.json` est le jeu de **cas dorés** d'un composant : des assertions comportementales traduisibles d'une plateforme à l'autre. Le format est contraint strictement par `cases/schema.json`.

## Philosophie de conception

> La logique n'est pas partagée, le comportement si.

Les différentes cibles natives **ne partagent aucun code de test** ; chacune traduit manuellement, à partir des mêmes cas, ses tests locaux (JUnit / XCTest / ohpm test / tests unitaires C). Les cas ne décrivent que des **comportements** (conditions initiales, actions, résultats attendus), sans aucune API propre à une cible.

## Structure de premier niveau

```json
{
  "$schema": "./schema.json",
  "component": "button",
  "cases": [ ... ]
}
```

- `component` : kebab-case, **doit être identique au `name` du spec du même nom**
- `cases` : au moins un cas

## La structure en trois parties

Chaque cas exige `id` / `name` / `given` / `when` / `then` :

```json
{
  "id": "disabled-blocks-click",
  "name": "L'état désactivé ne déclenche pas onClick",
  "given": { "props": { "disabled": true } },
  "when": { "action": "click" },
  "then": {
    "events": [{ "name": "onClick", "assertion": "notEmitted" }],
    "enabled": false
  }
}
```

### given (préconditions)

| Champ | Description |
| --- | --- |
| `props` | Les props initiaux ; **les clés doivent exister dans les props du spec du même nom** |
| `state` | L'état initial du composant ; **clés libres**, pour les scénarios propres à une cible (par exemple `{ "text": "Bouton" }`) |

### when (action)

| Champ | Description |
| --- | --- |
| `action` | **Obligatoire**, l'une des six valeurs (voir ci-dessous) |
| `target` | La cible de l'action (nom de slot, nom du sous-composant, etc.) |
| `payload` | La charge utile de l'action (le texte saisi, par exemple) |

**Les six actions** : `render` (rendu) / `click` (clic) / `input` (saisie) / `focus` (prise de focus) / `blur` (perte de focus, **réservé, aucun composant ne l'utilise actuellement**) / `custom` (personnalisé, **doit être précisé via `target`**).

### then (assertions)

| Champ | Description |
| --- | --- |
| `events` | Tableau des assertions sur les événements |
| `tokens` | Tableau des assertions sur l'application des jetons |
| `visible` | Visibilité attendue |
| `enabled` | Interactivité attendue |
| `text` | Texte rendu attendu |
| `notes` | Compléments d'assertion indépendants de la cible (langage naturel) |

**Assertions sur les événements** :

```json
{
  "name": "onValueChange",
  "assertion": "emitted",
  "times": 1,
  "payload": { "value": "青花瓷" }
}
```

- `name` : **doit exister dans les events du spec du même nom**
- `assertion` : `emitted` (déclenché) ou `notEmitted` (non déclenché)
- `times` : optionnel, nombre de déclenchements attendu
- `payload` : optionnel, charge utile attendue (**comparaison profonde**)

**Assertions sur les jetons** :

```json
{ "path": "button.height.large", "applied": false }
```

`path` est le chemin complet du jeton, et `applied` indique si le jeton **est** ou non appliqué au résultat du rendu. L'**assertion inverse** `applied: false` sert aux régressions d'exclusivité entre dimensions (si la taille small est choisie, `button.height.large` ne doit pas être consommé).

## Exemples complets

```json
{
  "id": "small-size-uses-small-tokens",
  "name": "La taille small consomme les jetons de la taille small",
  "given": { "props": { "size": "small" } },
  "when": { "action": "render" },
  "then": {
    "tokens": [
      { "path": "button.height.small",   "applied": true },
      { "path": "button.fontSize.small", "applied": true },
      { "path": "button.height.large",   "applied": false }
    ]
  }
}
```

```json
{
  "id": "clearable-emits-empty-value",
  "name": "Le bouton d'effacement déclenche une valeur vide",
  "given": { "props": { "value": "Texte existant", "clearable": true } },
  "when": { "action": "custom", "payload": { "call": "clear" } },
  "then": {
    "events": [{ "name": "onValueChange", "assertion": "emitted", "times": 1, "payload": { "value": "" } }]
  }
}
```

## Relation avec les specs

`pnpm verify:specs` vérifie :

- que les clés de `given.props` figurent toutes parmi les props du spec
- que les `then.events[].name` figurent tous parmi les events du spec

C'est pourquoi **lorsqu'on renomme les props / events d'un spec, il faut modifier les cas en conséquence**.

## Liste des composants actuels

15 composants ; le nombre total de cas varie selon les versions. Tous les cas se trouvent dans [Référence des cas dorés](./reference).
