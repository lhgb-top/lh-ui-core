---
title: "Liaison locale"
---

## Le problème

Lors du développement d'une cible native, chaque modification d'un jeton implique d'attendre la publication de core, puis de monter la version de la dépendance : la boucle de rétroaction est trop longue.

## Le mécanisme

Avec la disposition familiale (tous les dépôts sous un même répertoire parent), le développement local d'un dépôt natif se branche, via une **résolution locale dotée de gardes d'existence**, directement sur les artéfacts du répertoire `dist/` de ce dépôt : après avoir modifié un jeton, il suffit de relancer `pnpm codegen` dans ce dépôt pour que la modification soit immédiatement effective, **sans aucune publication**. Lorsque ce dépôt n'existe pas (par exemple lors d'un clonage unique d'un dépôt dans le CI), il y a repli automatique sur les paquets déjà publiés de chaque plateforme.

Le mécanisme de garde est isomorphe au `createLocalShareAliases` de la lignée web : on contrôle `existsSync(<coreRoot>/dist/android)` (l'artéfact android doit exister pour considérer que le codegen a déjà été lancé dans ce dépôt) ; en son absence, le chemin local n'est pas injecté.

## Le mode d'injection de chaque cible

Chaque dépôt natif l'implémente à sa guise ; ce dépôt ne l'impose pas :

| Plateforme | Mode d'injection |
| --- | --- |
| Android | Un répertoire maven local de Gradle |
| iOS | Une dépendance de chemin locale SPM |
| HarmonyOS | Une dépendance ohpm de type `file:` |
| C | Un `add_subdirectory` CMake ou un chemin d'en-têtes |

## Le flux de travail type

```
1. Modifier tokens/*.json dans ce dépôt
2. pnpm codegen          → dist/ est immédiatement mis à jour
3. Construire / exécuter directement dans le dépôt natif  → les nouveaux jetons sont effectifs
```

`scripts/resolve-local-tokens.mjs` est le script d'implémentation de ce mécanisme de garde.

## Points d'attention

- La liaison locale n'est disponible que dans la **disposition familiale** (tous les dépôts sous un même répertoire parent).
- La liaison lit `dist/`, donc après avoir modifié des jetons, **il faut d'abord lancer le codegen**.
- Après une release, les cibles natives devraient revenir aux versions officielles des dépendances, afin de ne pas dépendre durablement d'un chemin local.
