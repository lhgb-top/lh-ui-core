---
title: "Liste des modèles"
---

Le répertoire `codegen/templates/` contient au total **8 modèles Handlebars**, **sans aucun helper personnalisé enregistré** (ils n'utilisent que les `{{#each}}` intégrés et les triples accolades `{{{ }}}`).

## Modèle → artéfact → champs de données

| Modèle | Artéfacts rendus | Champs de données |
| --- | --- | --- |
| `android/LhTokens.kt.hbs` | `LhTokens.kt` **et** `LhDarkTokens.kt` (commun au clair et au sombre) | `{ version, source, package, imports[], body }` |
| `ios/LhTokens.swift.hbs` | `LhTokens.swift` et `LhDarkTokens.swift` | `{ version, source, body }` |
| `ios/LhShadow.swift.hbs` | `LhShadow.swift` (modèle statique, sans emplacement body) | `{ version, source }` |
| `harmony/LhTokens.ets.hbs` | `LhTokens.ets` et `LhDarkTokens.ets` | `{ version, source, body }` |
| `harmony/LhShadow.ets.hbs` | `LhShadow.ets` (modèle statique) | `{ version, source }` |
| `windows/LhTokens.cs.hbs` | `LhTokens.cs` et `LhDarkTokens.cs` | `{ version, source, namespace, body }` |
| `windows/LhShadow.cs.hbs` | `LhShadow.cs` (modèle statique) | `{ version, source, namespace }` |
| `windows/LhEasing.cs.hbs` | `LhEasing.cs` (modèle statique) | `{ version, source, namespace }` |

## La bannière d'en-tête unifiée

Tous les modèles portent en haut le même bloc de commentaires :

```
// =====================================================================================
// Ce fichier est généré automatiquement par @lh-ui/core (codegen de compilation). Ne le modifiez pas à la main.
// Source : {{{source}}} @ v{{{version}}}
// Pour le modifier, éditez les fichiers tokens/*.json du dépôt lh-ui-core, puis relancez pnpm codegen.
// =====================================================================================
```

C'est la déclaration au niveau du code que `dist/` ne doit pas être modifié à la main (ligne rouge 6).

## Les modèles communs au clair et au sombre

**Les artéfacts clairs et sombres d'android / ios / harmony / windows partagent un même modèle** ; la différence ne porte que sur le `body` fourni (le nom de l'objet / enum / class racine diffère).

## Les modèles statiques (structures supports)

`ios/LhShadow.swift.hbs`, `harmony/LhShadow.ets.hbs`, `windows/LhShadow.cs.hbs` et `windows/LhEasing.cs.hbs` **n'ont pas d'emplacement body** ; leur contenu est entièrement statique :

```handlebars
{{!-- harmony/LhShadow.ets.hbs --}}
/// Structure des jetons d'ombre
export interface LhShadow {
  color: ResourceColor
  /** Rayon de flou */
  radius: number
  offsetX: number
  offsetY: number
}
```

Parce que SwiftUI / ArkUI / WinUI n'ont pas d'équivalent direct pour une « ombre composite » ou une « Bézier », un support côté cible est nécessaire ; en revanche, l'ombre d'Android est une API de plateforme et ne nécessite pas de fichier supplémentaire. Les deux supports de Windows sont tous deux des `readonly record struct` :

```handlebars
{{!-- windows/LhShadow.cs.hbs --}}
public readonly record struct LhShadow(Windows.UI.Color Color, double OffsetX, double OffsetY, double BlurRadius);
```

## Un exemple de modèle

```handlebars
{{!-- android/LhTokens.kt.hbs --}}
// La bannière d'en-tête…

package {{{package}}}

{{#each imports}}
{{{this}}}
{{/each}}

{{{body}}}
```

```handlebars
{{!-- windows/LhTokens.cs.hbs --}}
// La bannière d'en-tête…

namespace {{{namespace}}};

{{{body}}}
```

## Principes de conception

- **Des modèles minces** : ils ne sont responsables que du squelette du fichier (commentaires d'en-tête, `package` / `namespace`, ouverture / fermeture des gardes) ; la mise en forme littérale de chaque jeton se fait entièrement dans le TS de la cible, puis est fournie au modèle via le `body`. Voir [Couche de rendu](./render).
- **`noEscape: true`** : les modèles contiennent des caractères `<` `>` `#` (`#ifndef`, `#define`, les chevrons des génériques), l'échappement HTML doit être désactivé.
- **Le cache de compilation** : le `loadTemplate` de `render.ts` met en cache le résultat de la compilation pour éviter de recompiler.

## Comment ajouter un modèle

1. Ajoutez un fichier `.hbs` dans `codegen/templates/<platform>/`
2. Assemblez les données dans la cible correspondante et appelez `render('<platform>/<name>.hbs', data)`
3. Lancez `pnpm codegen` pour voir les artéfacts, puis `pnpm test -- -u` pour mettre à jour les instantanés
