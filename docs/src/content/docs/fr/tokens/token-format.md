---
title: "Format des jetons"
---

Chaque fichier `tokens/*.json` est une source neutre, indépendante de toute plateforme, dont le format est contraint strictement par `tokens/schema.json`.

## Les méta-propriétés de niveau fichier

Les clés qui commencent par `$` sont des méta-propriétés, qui ne produisent pas de jeton :

| Propriété | Rôle |
| --- | --- |
| `$schema` | Pointe vers `./schema.json` (auto-complétion + validation dans l'éditeur) |
| `$description` | La description du fichier, qui apparaîtra dans la cible docs et dans le document de référence |
| `$type` | **Le type par défaut du fichier** ; les feuilles littérales qui ne déclarent pas leur propre `type` en héritent |
| `$dark` | `true` signifie que ce fichier est un fichier de surcharge sombre (il ne déclare que les clés à surcharger) |
| `$namespace` | Le préfixe d'espace de noms, qui détermine le chemin pointillé global (voir [Espaces de noms](./namespace)) |

```json
{
  "$schema": "./schema.json",
  "$namespace": "color",
  "$type": "color",
  "$description": "La palette et les couleurs sémantiques",
  "primary": { "default": { "value": "#2B4C7C" } }
}
```

## Les cinq champs d'une feuille (un jeton)

| Champ | Obligatoire | Rôle |
| --- | --- | --- |
| `value` | L'un des deux, `value` **ou** `ref` | La valeur littérale |
| `ref` | L'un des deux, `ref` **ou** `value` | Le chemin complet du jeton référencé (résolu statiquement et cuit à la compilation) |
| `type` | Optionnel | Le type du jeton ; en l'absence de déclaration, hérite du `$type` du fichier |
| `description` | Optionnel | La description, qui sera rendue dans les commentaires des artéfacts de chaque cible et dans les tables de la documentation |
| `nativeOnly` | Optionnel | `true` = un ajout de la lignée native, sans équivalent dans la lignée web |

Le schéma utilise `anyOf: [{required: [value]}, {required: [ref]}]` + `additionalProperties: false` afin de garantir que chaque feuille possède **un et un seul** des deux, `value` ou `ref`, et qu'aucun champ supplémentaire n'est autorisé.

## Les sept types

`type` / `$type` n'accepte que ces sept valeurs :

| Type | La forme des valeurs | Exemple |
| --- | --- | --- |
| `color` | `#RGB` / `#RRGGBB` / `#AARRGGBB` / `rgba(r,g,b,a)` | `"#2B4C7C"`, `"rgba(61, 100, 158, 0.25)"` |
| `dimension` | **Uniquement une chaîne avec unité** `"12px"` / `"50%"` (`assertTypedValue` impose une chaîne ; une valeur numérique nue n'est légale que pour le type `number`) | `"40px"`, `"50%"` |
| `number` | Une valeur numérique pure | `400`, `1000` |
| `string` | Une chaîne | `"PingFang SC"` |
| `shadow` | Une chaîne d'ombre découpée selon les espaces (`x y blur [spread] color`) | `"0px 2px 12px 0px rgba(26, 26, 26, 0.08)"` |
| `duration` | `"200ms"` / `"0.2s"` (tout est normalisé en millisecondes) | `"200ms"` |
| `cubicBezier` | Un tableau de quatre valeurs | `[0.4, 0, 0.2, 1]` |

Une inadéquation entre le type et la valeur (par exemple `type: color` avec `40px`) est refusée à l'étape resolve par `assertTypedValue`, voir [Système de types](./type-system).

## Les contraintes sur les valeurs neutres (ligne rouge 5)

Les valeurs des jetons **n'acceptent que des expressions neutres** :

- ✅ Une couleur hexadécimale, un `rgba()`, une chaîne avec unité `"12px"` / `"50%"`, une valeur numérique pure avec le type `number`
- ❌ `var()`, `rem`, `sp`, `dp` et toute autre unité ou référence propre à une plateforme

La conversion des unités est prise en charge par les modèles de chaque cible :

| Plateforme | Conversion |
| --- | --- |
| Android | `usesSp()` décide entre `sp` pour les tailles de police et `dp` pour le reste |
| iOS | La dimension est un `CGFloat`, la durée est **convertie en secondes** (`(ms/1000)`, les animations SwiftUI s'expriment en secondes) |
| HarmonyOS | La dimension est une valeur `vp` pure |
| C | Une valeur nue, avec l'unité indiquée en commentaire (une couleur en `0xAARRGGBB`, une dimension en pixels logiques, une durée en millisecondes) |

## L'imbrication des groupes

Des groupes peuvent être imbriqués à n'importe quel niveau, et un groupe peut également déclarer son propre `$type` pour écraser le type par défaut de l'ensemble du groupe :

```json
"fontSize": {
  "$type": "dimension",
  "base": { "value": "14px" },
  "small": { "value": "13px" }
}
```

`typography.json` n'a pas de `$type` au niveau fichier ; il s'appuie sur des `$type` au niveau groupe ou sur le `type` porté par chaque feuille, chacun déclarant ce qui lui revient.

## Le marquage `nativeOnly`

Signale un jeton ajouté par la lignée native, sans équivalent dans la lignée web (le plus souvent des dimensions ajoutées pour le mobile). Ses effets :

- La colonne de description de `dist/docs/tokens.md` est marquée « ajout natif »
- Le document de référence familial filtre sur cette base la liste des « jetons ajoutés natifs »
- **Les différentes cibles natives ne filtrent pas** ; la génération se fait à l'identique

## La liste des fichiers

| Fichier | `$namespace` | `$type` | Description |
| --- | --- | --- | --- |
| `color.json` | `color` (déduit du nom du fichier) | `color` | La palette et les couleurs sémantiques |
| `color-dark.json` | `color` (explicite, doit être le même espace de noms que le clair) | `color` | Les surcharges incrémentales du mode sombre |
| `components.json` | `""` | `dimension` | Les jetons de niveau composant |
| `typography.json` | `typography` | Aucun (déclaré par chaque groupe / feuille) | La typographie |
| `spacing.json` | `spacing` | `dimension` | L'échelle d'espacement |
| `radius.json` | `radius` | `dimension` | Les rayons |
| `shadow.json` | `shadow` | `shadow` | Les ombres |
| `motion.json` | `motion` | Aucun (déclaré par chaque groupe / feuille) | Les durées et les easing |
| `z-index.json` | `zIndex` (explicite) | `number` | L'élévation |
