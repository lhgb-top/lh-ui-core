---
title: "Mécanisme de référence"
---

## Ce qu'est un `ref`

Une feuille peut ne pas écrire de `value` mais un `ref`, qui pointe vers le **chemin complet** d'un autre jeton :

```json
"selected": { "ref": "color.primary.active", "description": "La couleur du texte en état sélectionné ; suit la variante pressée de la couleur principale" }
```

À la compilation, le `ref` est **résolu statiquement et cuit en une valeur littérale** — ce que l'on voit dans les artéfacts de chaque cible, c'est la valeur déjà résolue, avec **zéro indirection à l'exécution**.

## L'algorithme de résolution

La fonction interne `resolveRef(path, chain)` de `resolve.ts` :

1. Le chemin cible n'existe pas → lève `Le jeton référencé n’existe pas : <path>`
2. La cible est elle-même un ref → on **descend récursivamente** le long de la chaîne (les chaînes indirectes de longueur quelconque sont prises en charge)
3. La chaîne contient déjà le chemin courant → lève `Cycle de références de jetons détecté : a -> b -> a`
4. Une valeur littérale est atteinte → retourne `{ value, type }`

## Les chaînes indirectes

```json
"a": { "ref": "b" },
"b": { "ref": "c" },
"c": { "value": "#2B4C7C" }
```

`a` sera résolu le long de la chaîne jusqu'à la valeur littérale de `c`.

## La détection de cycles

```json
"a": { "ref": "b" },
"b": { "ref": "a" }
```

À la résolution, `chain.includes(path)` correspond, et l'erreur `Cycle de références de jetons détecté : a -> b -> a` est levée, ce qui fait échouer le codegen directement.

## Le résultat de la cuisson

Le résultat de la résolution est écrit dans `token.value`, et la chaîne est enregistrée dans `refChain` (`ResolvedToken.refChain`, par exemple `["color.primary.active"]`). Les artéfacts de chaque cible ne contiennent que des valeurs littérales, aucun ref :

```kotlin
// button.borderRadius référence radius.base (2px) ; après la cuisson :
val borderRadius = 2.dp  // Le rayon du bouton suit le rayon global
```

## Le type suit la source de vérité

Lorsqu'une feuille ref ne déclare pas son propre `type`, **le type est pris sur la cible de la référence** (le 2e des trois niveaux de priorité, voir [Système de types](./type-system)).

## refMap

Le `refMap` retourné par `resolveTokens` enregistre toutes les relations de référence résolues (`path -> la chaîne ref brute`, les clés sombres portant le préfixe `dark:`) ; il est utilisé par la documentation et par `pnpm verify:tokens`.

## Les usages en pratique

Les scénarios typiques des `ref` dans `tokens/` :

| Scénario | Exemple |
| --- | --- |
| Un composant qui suit des quantités globales | `button.borderRadius` → `radius.base` |
| Un état qui suit une couleur sémantique | `color.selected` → `color.primary.active` |
| La taille de police d'un composant qui suit la typographie | `button.fontSize.small` → `typography.fontSize.small` |

**Toute référence doit être écrite en chemin complet** (l'espace de noms + le chemin imbriqué), voir [Espaces de noms](./namespace).
