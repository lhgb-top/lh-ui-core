---
title: "Artéfacts Windows"
---

**Chemins** : `dist/windows/Tokens/LhTokens.cs` et `LhDarkTokens.cs` ; `LhShadow.cs` est en outre généré lorsque des jetons d'ombre existent, et `LhEasing.cs` lorsque des jetons de Bézier existent

**Espace de noms** : `Top.Lhgb.Ui.Tokens` (nom de domaine inverse, plan directeur D20)

## Structure

Des `public static class` imbriquées expriment la hiérarchie des jetons, avec des membres `public static readonly` :

```csharp
public static class LhTokens {
  public static class Button {
    public static readonly double BorderRadius = 2.0;  // Le rayon du bouton suit le rayon global
    public static class Height {
      public static readonly double Large = 48.0;  // Hauteur du grand bouton
      public static readonly double Medium = 40.0;  // Hauteur du bouton moyen (par défaut)
      public static readonly double Small = 32.0;  // Hauteur du petit bouton
    }
    // ...
  }
  public static class Color {
    public static class Primary {
      public static readonly Windows.UI.Color Default = Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C);
    }
  }
}
```

## Règles de nommage des membres

`csMemberName(name)` : convertit en **PascalCase** (`default → Default`, `extraLarge → ExtraLarge`), ce qui évite au passage les mots-clés contextuels C# que sont `default` / `base`. Les noms de groupe suivent également la convention PascalCase.

## Unités et littéraux

| Type de jeton | Littéral C# | Type du champ |
| --- | --- | --- |
| Couleur | `Windows.UI.Color.FromArgb(0xFF, 0x2B, 0x4C, 0x7C)` | `Windows.UI.Color` |
| Dimension (entière) | `40.0` | `double` |
| Dimension (décimale) | `0.5` | `double` |
| Pourcentage | `0.5  // 50% (une fraction, convertie par rapport à la taille du conteneur)` | `double` |
| Durée | `200  // 200ms (millisecondes)` | `int` |
| Bézier | `new LhEasing(0.4, 0, 0.2, 1)` | `LhEasing` |
| Ombre | `new LhShadow(0xFF..., 0.0, 2.0, 8.0)` | `LhShadow` |
| Chaîne | `"'Source Code Pro', ..."` | `string` |

Conventions d'unités : **les dimensions sont en epx (pixels logiques, les valeurs sont directement utilisables)**, **les durées en millisecondes** (côté composant `TimeSpan.FromMilliseconds(...)`), **les couleurs en ARGB**.

### Pourquoi Windows.UI.Color

Windows App SDK 1.6 et versions antérieures **n'ont pas** de structure `Microsoft.UI.Color` ; les propriétés de la table des couleurs `Microsoft.UI.Colors` retournent elles aussi des `Windows.UI.Color`. C'est pourquoi les jetons utilisent tous `Windows.UI.Color` — qui fournit la fabrique `FromArgb` et dont le type correspond à celui de la table Colors. Côté composant, pour référencer la table Colors, il faut `using Microsoft.UI;` (Colors) + `using Windows.UI;` (Color).

## Mode sombre : un objet parallèle

`LhDarkTokens` est un objet indépendant, parallèle à `LhTokens`, et **ne contient que la sous-classe `Color`** :

```csharp
public static class LhDarkTokens {
  public static class Color {
    public static readonly Windows.UI.Color Focus = Windows.UI.Color.FromArgb(0xFF, 0x7F, 0xA6, 0xD9);
    // ...
  }
}
```

Le mode sombre ne surcharge que les couleurs — **les dimensions / le mouvement / les rayons sont inchangés en mode sombre** : un composant qui a besoin d'une dimension en mode sombre prend la valeur de l'objet clair. La forme est strictement identique à celle des cibles android / ios / harmony.

## Structures supports

`LhShadow.cs` et `LhEasing.cs` sont tous deux des `readonly record struct` (WinUI n'a pas d'équivalent direct pour les ombres composites ni pour les Bézier) :

```csharp
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
public readonly record struct LhEasing(double X1, double Y1, double X2, double Y2);
```

Le `spread` (l'étalement) des ombres est ignoré sur toutes les cibles et fait l'objet d'un commentaire explicatif (WinUI DropShadow ne le prend pas en charge), par exemple `// Étalement 0px : non pris en charge par WinUI DropShadow, ignoré`.

## Mode d'emploi

La commande `pnpm link:tokens` du dépôt Windows (`lh-ui-windows`) copie toute l'arborescence de `dist/windows/` dans `src/Tokens/` (le point de chute est le sous-répertoire `Tokens/` à la racine source) ; côté composant, `using Top.Lhgb.Ui.Tokens;` pointe vers ce répertoire. Le garde-fou d'existence à trois niveaux (dist local → paquet npm `@lh-ui/core` → erreur) est décrit dans [Liaison locale](../guide/local-linking).
