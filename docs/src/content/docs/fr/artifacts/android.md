---
title: "Artéfacts Android"
---

**Chemins** : `dist/android/top/lhgb/ui/tokens/LhTokens.kt` et `LhDarkTokens.kt`

**Nom du paquet** : `top.lhgb.ui.tokens` (convention du nom de domaine inverse, plan directeur D20)

## Structure

Les jetons sont organisés par hiérarchie de chemins en **`object` imbriqués**, dont les membres sont des `val` :

```kotlin
package top.lhgb.ui.tokens

import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.animation.core.CubicBezierEasing

object LhTokens {
  object Button {
    val borderRadius = 2.dp  // Le rayon du bouton suit le rayon global
    val borderWidth = 1.dp
    object FontSize {
      val large = 16.sp
      val medium = 14.sp
    }
    object Height {
      val medium = 40.dp  // Hauteur du bouton moyen (par défaut)
      val small = 32.dp  // Hauteur du petit bouton
    }
  }
  object Color {
    val focus = ComposeColor(0xFF2B4C7C)
  }
}
```

## Correspondance des noms

| Chemin de jeton | Membre Kotlin |
| --- | --- |
| `button.height.medium` | `LhTokens.Button.Height.medium` |
| `color.primary.default` | `LhTokens.Color.Primary.default` |
| `zIndex.modal` | `LhTokens.ZIndex.modal` |

Les noms de groupe suivent la convention `pascalCase` (seule la première lettre est majuscule), les noms de membres sont inchangés.

## Unités et littéraux

| Type de jeton | Littéral Kotlin |
| --- | --- |
| Couleur | `ComposeColor(0xFF2B4C7C)` (Int ARGB) |
| Dimension | `40.dp` ; **les jetons de taille de police (chemin contenant `fontsize`) utilisent `.sp`**, les autres `.dp` |
| Pourcentage | `0.50f  // 50% (une fraction, convertie par rapport à la taille du conteneur)` |
| Durée | `200  // 200ms (millisecondes)` (Int) |
| Bézier | `CubicBezierEasing(0.4f, 0f, 0.2f, 1f)` |
| Ombre | `Shadow(color = ..., offset = Offset(0f, 2f), blurRadius = 8f)` |
| Nombre / chaîne | Tel quel / `JSON.stringify` |

La décision dp/sp se trouve dans `usesSp()` de `format.ts` (`/fontsize/i`).

## Imports générés à la demande

La liste des imports est déterminée par les **types d'exécution réellement utilisés** (`importsFor(features)`) ; les types inutilisés ne sont pas importés :

| Fonctionnalité | import |
| --- | --- |
| Couleur | `androidx.compose.ui.graphics.Color as ComposeColor` |
| Dimension | `androidx.compose.ui.unit.dp` + `.sp` |
| Ombre | `androidx.compose.ui.graphics.Shadow` + `androidx.compose.ui.geometry.Offset` |
| Bézier | `androidx.compose.animation.core.CubicBezierEasing` |

## Mode sombre

Un `object LhDarkTokens` indépendant, **dont la structure d'espaces de noms est identique au mode clair** :

```kotlin
object LhDarkTokens {
  object Color {
    val focus = ComposeColor(0xFF7FA6D9)  // Couleur de l'anneau de focus clavier, suit par défaut la couleur principale
    val selected = ComposeColor(0xFFB1C1D8)  // Couleur du texte en état sélectionné, suit la variante pressée de la couleur principale
    object Background {
      ...
    }
  }
}
```

Le mode sombre ne contient que les clés surchargées (actuellement uniquement `color.*`) ; les clés non surchargées conservent en mode sombre les valeurs de `LhTokens`.

## Mode d'emploi

Le dépôt Android intègre le répertoire `dist/android/` comme source Gradle ou comme dépendance maven locale ; `import top.lhgb.ui.tokens.LhTokens` et c'est utilisable. Voir [Liaison locale](../guide/local-linking).
