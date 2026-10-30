---
title: "Lignes rouges et conventions de nommage"
---

## Les six lignes rouges

### 1. Seuls des squelettes, jamais d'implémentations

Le codegen ne produit que des **liaisons de jetons**, des énumérations et des types de props, ainsi que des constantes de valeurs par défaut. **Il est interdit de générer la moindre implémentation d'UI** — pas de corps de Composable, pas de corps de SwiftUI View, pas de corps de composant ArkUI, pas de corps de fonction de composant C. Toutes les implémentations d'UI restent écrites à la main dans chaque dépôt natif.

Cette ligne rouge est inscrite dans le commentaire d'en-tête de `codegen/src/index.ts` : c'est l'auto-déclaration de la chaîne d'outils.

### 2. L'unique source des jetons est `tokens/*.json`

Aucune plateforme, aucun composant ne peut contourner ce dépôt pour définir ses propres valeurs de jetons. Les dépôts natifs ne peuvent consommer que les artéfacts de `dist/` ou les paquets déjà publiés de la plateforme correspondante ; **il est interdit d'écrire à la main des couleurs / des espacements / des tailles de police**.

### 3. Zéro JS à l'exécution

Le code TS de ce dépôt n'existe que dans la chaîne d'outils de compilation ; **aucun JavaScript ne doit apparaître dans les artéfacts**.

### 4. Il est interdit de dépendre de `lh-ui-share`

Les deux lignées sont mutuellement indépendantes et ne doivent rien importer l'une de l'autre. Les valeurs initiales des jetons ont été transportées manuellement en une seule fois, comme un germe ; aucune dépendance automatique n'a été établie.

### 5. Les JSON ne doivent contenir aucune syntaxe propre à une plateforme

Les valeurs des jetons n'acceptent que des expressions neutres : une couleur hexadécimale / un `rgba()` / une valeur numérique pure avec le type `number` / une **chaîne avec unité** pour `dimension` / `duration` / `shadow` (`"12px"` / `"50%"` / `"200ms"`, imposé par `assertTypedValue`, voir [Format des jetons](../tokens/token-format)). Sont interdits : `var()`, `rem`, `sp`, `dp` et toute autre unité ou référence propre à une plateforme. **La conversion des unités de chaque plateforme est prise en charge par les modèles de chaque cible** (la décision dp/sp d'Android, la conversion en secondes d'iOS, etc.).

### 6. Il est interdit de modifier `dist/` à la main

Toute modification se fait dans `tokens/` / `specs/` / `cases/` ou dans les modèles, puis on relance `pnpm codegen`. `dist/` est dans `.gitignore` et chaque exécution de codegen commence par supprimer avant de reconstruire.

## Les conventions de nommage (plan directeur D20)

### Les noms de paquets / identifiants de plateforme

Les noms de paquets de plateforme suivent tous le nom de domaine inverse `top.lhgb.ui` :

| Plateforme | Nom de paquet / identifiant |
| --- | --- |
| Android | `package top.lhgb.ui.tokens`, répertoire d'artéfacts `dist/android/top/lhgb/ui/tokens/` |
| iOS | `Sources/LhUITokens/` (convention de répertoires SwiftPM) |
| HarmonyOS | `tokens/` (à l'intérieur du module ohpm) |
| C | `include/lh_ui/` |

### Le préfixe des constantes / classes / énumérations propres

Toujours le préfixe **LH**, avec la casse selon les conventions de chaque langage :

| Langage | Convention | Exemples |
| --- | --- | --- |
| Kotlin | `Lh*` (PascalCase) | `object LhTokens`, `object LhDarkTokens` |
| Swift | `Lh*` (PascalCase) | `public enum LhTokens`, `struct LhShadow` |
| ArkTS | `Lh*` (PascalCase) | `export class LhTokens`, `interface LhShadow` |
| C | `LH_*` (MAJUSCULES avec tirets bas) | `LH_COLOR_PRIMARY_DEFAULT`, `LH_Z_INDEX_MODAL` |

Le scope `@lh-ui/*` de npm / ohpm n'est pas concerné (npm n'utilise pas le nom de domaine inverse).

### La règle de nommage des macros C

`zIndex.modal` → `LH_Z_INDEX_MODAL` : d'abord les `.` sont convertis en tirets bas, puis un tiret bas est ajouté devant chaque lettre majuscule, et enfin tout est passé en majuscules. Voir [Artéfacts C](../artifacts/c).

## Les contraintes de nommage JSON

Les schémas de chaque couche imposent le nommage par des expressions régulières :

| Couche | Champ | Règle |
| --- | --- | --- |
| spec | `name` | kebab-case : `^[a-z][a-z0-9-]*$` |
| spec | `component` | PascalCase avec préfixe Lh : `^Lh[A-Z][a-zA-Z0-9]*$` |
| spec | nom de prop | camelCase : `^[a-z][a-zA-Z0-9]*$` |
| spec | nom d'événement | `^on[A-Z][a-zA-Z0-9]*$` |
| case | `id` | kebab-case |
| case | `component` | Doit être identique au `name` du spec du même nom |

## La langue des commentaires et de la documentation

Les commentaires, la documentation et les messages de commit sont obligatoirement en **chinois** (une exigence du plan directeur de la famille).
