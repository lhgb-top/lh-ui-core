---
title: "Introduction"
---

> lh-ui-core est le centre de construction de la **lignée native** de la famille lh-ui.

## Ce qu'est ce dépôt

`@lh-ui/core` est le foyer de la **source unique de vérité** des jetons de conception, des contrats de composants et des cas dorés, accompagné d'une chaîne d'outils codegen qui génère les squelettes de langage des quatre cibles natives à partir de jetons neutres.

Il **n'est pas une dépendance d'exécution**. Il ne fonctionne qu'à la compilation : les jetons JSON et les contrats de composants, indépendants de toute plateforme, sont transformés en artéfacts pour Android (Kotlin) / iOS (Swift) / HarmonyOS (ArkTS) / C, quatre cibles natives, et chaque bibliothèque d'UI native écrit ses implémentations à la main. **Zéro JavaScript à l'exécution native.**

## L'architecture à deux lignées

La famille compte deux lignées, mutuellement indépendantes, qu'il est interdit de coupler :

```
La famille lh-ui
├── lignée web : lh-ui-share (le noyau TS + l'unique source de styles SCSS) → plus / vue2 / react / uniapp
└── lignée native : ce dépôt (jetons JSON + contrats + codegen) → android / ios / harmony / windows
```

Ce dépôt et `lh-ui-share` **n'ont entre eux aucune dépendance de code** ; chaque dépôt boucle sa propre boucle et publie ses releases indépendamment. L'unité de la marque et du visuel repose sur un mécanisme d'alignement manuel dans le dépôt de documentation de la famille (`docs/设计语言基线.md`), et non sur une synchronisation automatique.

## Les trois couches de contrats

Le contenu de ce dépôt est constitué de trois couches de contrats JSON, indépendantes l'une de l'autre mais se référençant mutuellement :

| Couche | Emplacement | La question à laquelle elle répond |
| --- | --- | --- |
| **Jetons** | `tokens/*.json` | « À quoi ressemble l'interface » — couleurs, espacement, tailles de police, rayons, ombres, animation, élévation, dimensions de niveau composant |
| **Contrats** | `specs/*.json` | « De quelles capacités dispose un composant » — props / énumérations / valeurs par défaut / événements / slots / comportements |
| **Cas** | `cases/*.json` | « Comment tester le composant » — des assertions comportementales given/when/then traduisibles d'une plateforme à l'autre |

Le codegen ne consomme que les **jetons** pour générer les squelettes des quatre cibles ; les **contrats** et les **cas** sont actuellement consommés manuellement par chaque cible native (à l'avenir, il pourraient alimenter la génération automatique de squelettes de types et de modèles de tests).

## Les jetons de départ

Les valeurs initiales des `tokens/*.json` de ce dépôt ont été, en une seule fois, un germe extrait manuellement et aligné avec `lh-ui-share/styles/theme/common/variables.scss` et `var-dark.scss` (2026-10-10 ; voir le document familial `docs/设计语言基线.md`). Depuis, les deux dépôs évoluent chacun de leur côté, **sans plus aucune synchronisation**. Toute modification des jetons de niveau marque (les palettes de couleurs, les échelles d'espacement) doit être enregistrée dans ce document de référence.

## Qui devrait lire cette documentation

- **Les développeurs des cibles natives** (android / ios / harmony / windows) : pour comprendre les conventions de nommage, les conversions d'unités et le mécanisme du mode sombre des artéfacts de `dist/`, savoir d'où viennent les jetons et comment leurs valeurs sont calculées.
- **Les mainteneurs de ce dépôt** : pour comprendre les responsabilités et les fonctions de chaque module du pipeline codegen, et être capable de modifier les modèles, d'ajouter des jetons et d'ajouter des composants.

## La suite

- [Démarrage](./quickstart) — cloner, installer, lancer une fois le codegen
- [Structure des répertoires](./structure) — la responsabilité de chaque répertoire
- [Format des jetons](../tokens/token-format) — les contraintes de champs du JSON des jetons
- [Aperçu du pipeline](../codegen/pipeline) — le flux complet des données du codegen
