---
title: "Artéfacts HarmonyOS"
---

**Chemins** : `dist/harmony/tokens/LhTokens.ets` et `LhDarkTokens.ets` ; `LhShadow.ets` est en outre généré lorsque des jetons d'ombre existent

**Répertoire du module** : `tokens/` (dans le module ohpm)

## Structure

Une `export class` racine, les classes imbriquées **sans export** (les déclarations `export` ne sont pas autorisées dans le corps d'une classe ArkTS), avec des membres `static readonly` :

```ts
export class LhTokens {
  class Button {
    static readonly borderRadius: Dimension | number = 2  // Le rayon du bouton suit le rayon global
    static readonly borderWidth: Dimension | number = 1
    class FontSize {
      static readonly large: Dimension | number = 16
      static readonly medium: Dimension | number = 14
    }
    class Height {
      static readonly medium: Dimension | number = 40  // Hauteur du bouton moyen (par défaut)
    }
  }
  class Color {
    static readonly focus: ResourceColor = '#FF2B4C7C'
  }
}
```

## Correspondance des noms

| Chemin de jeton | Membre ArkTS |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

## La seule plateforme avec des annotations de type

ArkTS est fortement typé, donc chaque membre porte une annotation de type (`typeAnnotation()`) :

| Type de jeton | Annotation de type |
| --- | --- |
| color | `ResourceColor` |
| dimension | `Dimension \| number` |
| duration / number | `number` |
| shadow | `LhShadow` |
| cubicBezier | `number[]` |
| string | `string` |

Kotlin / Swift / C reposent tous sur l'inférence des littéraux ; ArkTS est la seule à annoter explicitement.

## Unités et littéraux

| Type de jeton | Littéral ArkTS |
| --- | --- |
| Couleur | `'#FF2B4C7C'` (ArkUI accepte les chaînes `#AARRGGBB`, via `toArgbHash`) |
| Dimension | Une valeur `vp` pure (`40`, sans unité) |
| Pourcentage | `0.500  // 50% (une fraction, convertie par rapport à la taille du conteneur)` |
| Durée | `200  // 200ms (millisecondes)` |
| Bézier | `[0.4, 0, 0.2, 1]  // Points de contrôle de Bézier, consommés côté composant via curves.cubicBezierCurve` |
| Ombre | `{ color: '#FF000000', radius: 8, offsetX: 0, offsetY: 2 }` |
| Nombre / chaîne | Tel quel / `JSON.stringify` |

## LhShadow.ets

ArkUI n'a pas non plus de type d'ombre composite ; il est porté par une **interface** (**modèle statique, sans contenu de jeton**) :

```ts
export interface LhShadow {
  color: ResourceColor
  /** Rayon de flou */
  radius: number
  offsetX: number
  offsetY: number
}
```

Par rapport au `struct LhShadow` d'iOS : ArkTS utilise une interface, SwiftUI une structure — chacun selon les idiomes de son langage.

## Mode sombre

Un `export class LhDarkTokens` indépendant, de structure identique au mode clair :

```ts
export class LhDarkTokens {
  class Color {
    static readonly focus: ResourceColor = '#FF7FA6D9'
    static readonly selected: ResourceColor = '#FFB1C1D8'
    // … les autres clés surchargées
  }
}
```

Les clés non surchargées conservent en mode sombre les valeurs de `LhTokens`.

## Mode d'emploi

Le dépôt HarmonyOS intègre `dist/harmony/` via une dépendance ohpm de type `file:` (liaison locale), ou consomme le paquet déjà publié ; `import { LhTokens } from '...'` et c'est utilisable.
