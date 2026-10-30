---
title: "Système de types"
---

## Les sept types

`type` et le `$type` de niveau fichier n'acceptent que : `color` / `dimension` / `number` / `string` / `shadow` / `duration` / `cubicBezier` (en correspondance une à une avec l'énumération de `tokens/schema.json`, voir le `TokenType` de `codegen/src/types.ts`).

La forme légale des valeurs de chaque type est décrite dans [Format des jetons](./token-format).

## Les trois niveaux de priorité des types

Le type d'une feuille est évalué dans l'ordre suivant :

```
1. Le type déclaré par la feuille elle-même
2. Le type de la cible du ref (uniquement si la feuille n'a pas déclaré son propre type)
3. Le $type au niveau fichier / niveau groupe
4. Si aucun n'est présent → une erreur est levée à l'étape resolve
```

Cette priorité est mise en œuvre par **la collaboration des deux étapes, flatten et resolve**.

### L'étape 1 : flatten (le `$type` de niveau groupe est propagé vers le bas)

Le `flatten` de `load.ts` propage vers le bas, dans l'arborescence, le `$type` déclaré par un groupe (y compris par la racine du fichier), mais **ne le cuit que dans les feuilles littérales** :

```ts
// Le jeton littéral hérite du type du groupe ; le jeton ref garde undefined, c'est resolve qui prend le type sur la cible de la référence
if (node.type === undefined && node.ref === undefined && groupType !== undefined) {
  out.set(path, { ...node, type: groupType })
}
```

**Les feuilles ref sont délibérément non cuites** — pour éviter d'être induites en erreur par le type par défaut du fichier où elles se trouvent.

### L'étape 2 : resolve (le type de la cible du recouvre le défaut de niveau fichier)

Lorsque `resolve.ts` assemble la correspondance du mode clair :

```ts
token: {
  type: raw.type ?? (file.defaultType as ResolvedToken['type']),  // Prend d'abord le $type de niveau fichier comme repli
  ...
},
ownType: raw.type,  // Utilisé spécifiquement pour distinguer « le type déclaré par la feuille elle-même » et « la valeur par défaut du fichier »
```

Une fois la résolution des refs revenue :

```ts
// Si la feuille n'a pas déclaré son propre type, on adopte le type de la cible de la référence (le type du jeton suit la source de vérité)
if (entry.ownType === undefined && resolved.type !== undefined) {
  entry.token.type = resolved.type
}
```

Cette étape place **le 2e niveau (le type de la cible du ref) au-dessus du 3e niveau (le `$type` de niveau fichier)**. Si, au final, le type est toujours undefined, l'erreur `Le jeton X n’a pas de type` est levée.

## Pourquoi trois niveaux sont nécessaires

Un exemple typique : `button.fontWeight` référence `typography.fontWeight.primary` :

```json
// components.json ($type de niveau fichier : dimension)
"button": { "fontWeight": { "ref": "typography.fontWeight.primary" } }

// typography.json
"fontWeight": { "primary": { "value": 400, "type": "number" } }
```

Si la feuille ref prenait, elle aussi, le `dimension` de niveau fichier, le type de `button.fontWeight` serait erroné. La priorité sur trois niveaux garantit qu'il **suit la cible de la référence et prend `number`**.

Autre exemple : `typography.json` n'a pas de `$type` de niveau fichier, et s'appuie sur les `$type` de niveau groupe (le groupe `fontSize` est marqué `dimension`) et sur les `type` portés par les feuilles (`fontWeight.primary` porte son propre `number`), chacun gérant ce qui lui revient.

## La validation sémantique

Le schéma ne gère que la structure. **L'adéquation entre le type et la valeur** est assertée, à l'étape resolve, par le `assertTypedValue` de `format.ts`, qui analyse réellement chaque valeur :

- `color` → Doit pouvoir être analysé par `parseColor` (hexadécimal ou rgba)
- `dimension` → Doit correspondre à `/^\d+(\.\d+)?(px|%)$/`
- `duration` → Prend en charge `s` / `ms`
- `shadow` → Découpé selon les espaces ; si le 4e segment correspond à `-?\d+(\.\d+)?px`, c'est le spread, sinon c'est la couleur
- `cubicBezier` → Un tableau de quatre valeurs

Voir [Couche de formatage](../codegen/format).

## L'inférence de type du côté sombre

L'inférence de type des clés de surcharge sombres est plus simple : `raw.type ?? byPath.get(path)?.type`. Une clé sombre dont le type manque ne fait pas échouer le codegen : elle est consignée dans `orphanDarkPaths` et signalée par `pnpm verify:tokens`. Voir [Fusion du mode sombre](./dark-mode).
