---
title: "Démarrage"
---

## Prérequis

- Node.js `>= 22.12` (le site de documentation utilise Astro 7, une exigence impérative)
- pnpm `10.x` (le dépôt verrouille `pnpm@10.34.5`)

## Installation

```bash
pnpm install
```

Ce dépôt **n'a aucune dépendance d'exécution** (les `dependencies` sont vides) ; tout ce qui est installé relève de la chaîne d'outils de compilation (tsx, ajv, handlebars, vitest, astro, etc.).

## Lancer le codegen une fois

```bash
pnpm codegen
```

Cette commande exécute `tsx codegen/src/index.ts` ; le flux complet est le suivant :

1. Lire le numéro de version du `package.json`
2. Charger et valider les `tokens/*.json` (validation structurelle Ajv)
3. Résoudre les refs et fusionner le mode sombre (validation sémantique : correspondance des types, intégrité référentielle, détection de cycles)
4. Charger et valider les `specs/*.json` et les `cases/*.json`
5. **Supprimer tout `dist/` et le reconstruire**
6. Exécuter à tour de rôle les 5 cibles (android → ios → harmony → c → docs)

La sortie se trouve dans `dist/` :

```
  [android] android/top/lhgb/ui/tokens/LhTokens.kt
  [android] android/top/lhgb/ui/tokens/LhDarkTokens.kt
  ...
codegen terminé : 5 cibles, N fichiers, version v0.0.1
```

Le nombre de fichiers varie selon le contenu des jetons (lorsque des jetons d'ombre existent, ios / harmony produisent chacun un fichier support d'ombre supplémentaire) ; la sortie réelle fait foi.

## Validation

```bash
pnpm verify          # = pnpm verify:tokens && pnpm verify:specs
```

- `verify:tokens` : le schéma des jetons + l'intégrité référentielle + **le contraste du texte clé sur sa couleur de fond ≥ 4.5:1 (WCAG AA)** + **l'inspection des syntaxes propres à une plateforme (`var()` / `rem` / `sp` / `dp`)**, ainsi que le signalement des **chemins sombres orphelins** (clés déclarées dans un fichier sombre mais inexistantes dans le jeu clair) et des clés sombres sans type.
- `verify:specs` : la cohérence entre specs et cas (les props / events référencés par les cas existent-ils bien dans le spec, etc.).

## Les tests

```bash
pnpm test
```

Les tests par instantanés reflètent l'ensemble des artéfacts de `dist/`. Après avoir modifié des jetons ou des modèles, les instantanés échouent ; une fois le bien-fondé confirmé, mettez-les à jour avec `pnpm test -- -u`.

## Le site de documentation

```bash
pnpm docs:dev        # Prévisualisation locale http://localhost:5185/lhui/core/
pnpm docs:build      # Construction de production (base : /lhui/core/)
pnpm docs:preview    # Prévisualisation de la construction de production
```

Les trois pages de référence du site de documentation (jetons / contrats / cas) lisent à la compilation directement les sources que sont `tokens/`, `specs/` et `cases/` ; **il n'est pas nécessaire de lancer le codegen au préalable**.

## Les combinaisons usuelles

| Scénario | Commande |
| --- | --- |
| Des jetons modifiés, on veut les artéfacts | `pnpm codegen` |
| Des jetons modifiés, on veut artéfacts + validation | `pnpm build` (= codegen + verify) |
| Des modèles modifiés, on veut artéfacts + instantanés | `pnpm codegen && pnpm test -- -u` |
| Consulter uniquement le tableau de référence des jetons | Après `pnpm codegen`, consulter `dist/docs/tokens.md` |

## Où les artéfacts sont consommés

Chaque cible native consomme les artéfacts de sa plateforme dans `dist/` :

- Android : les fichiers Kotlin sous `dist/android/`
- iOS : les fichiers Swift sous `dist/ios/`
- HarmonyOS : les fichiers ArkTS sous `dist/harmony/`
- Windows : les fichiers C# sous `dist/windows/`

Le mécanisme de la liaison locale (des jetons modifiés effectifs immédiatement, sans release) est décrit dans [Liaison locale](./local-linking).
