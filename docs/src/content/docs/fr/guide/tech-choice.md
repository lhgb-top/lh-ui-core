---
title: "Choix technique du site de documentation"
---

Cette page consigne les conclusions d'une étude menée le 2026-10-12 sur les principaux frameworks de documentation statique, ainsi que la décision finale concernant le framework du site de documentation de ce dépôt.

## La décision

| Date | Décision | Raison |
| --- | --- | --- |
| 2026-10-12 (jour de l'étude) | **Adopter Astro Starlight, migrer depuis VitePress** | Starlight est par défaut sans le moindre JavaScript côté client, indépendant de tout framework, ce qui correspond le mieux à la philosophie de ce dépôt de « zéro JS à l'exécution » ; une fois les trois pages de référence pilotées par les données réécrites en composants Astro purs, les trois dépendances vue / vitepress / vite sont totalement supprimées ; le seuil de Node ≥ 22.12 est acceptable |
| 2026-10-12 (jour de l'étude, jugement préalable) | Conserver VitePress | À ce moment-là, le bénéfice de la migration ne couvrait pas son coût — les sept sites de la famille étaient tous sur VitePress, et le site de documentation de ce dépôt était déjà entièrement en place. **Cette conclusion a été remplacée le même jour par la décision de migrer ; elle est conservée ci-dessous à titre de trace historique** |

La migration a été réalisée en une seule fois (la structure Astro construite et toutes les pages déplacées au cours d'un seul commit, afin d'éviter un état intermédiaire non constructible). Les autres sites de la famille utilisent toujours VitePress ; **ce dépôt n'exige pas l'uniformité de la famille**. Si la famille décide un jour d'unifier les frameworks, la pratique Starlight de ce dépôt constituera une référence prête à l'emploi.

## Les conclusions de l'étude (traces historiques, à partir des données du 2026-10-12)

- **Si l'on partait de zéro aujourd'hui, sans la contrainte d'homogénéité familiale**, la meilleure alternative serait **Astro Starlight** — performance, indépendance vis-à-vis des frameworks, zéro JavaScript côté client par défaut : ce qui correspond le mieux à la philosophie de ce dépôt « zéro JS à l'exécution ». (Ce jugement a finalement conduit à la décision de migration ci-dessus.)
- **VuePress est réellement à l'arrêt ; son adoption est déconseillée pour tout nouveau projet** (le dernier push du dépôt remonte au 2024-08-07, et la v2 est toujours en rc).
- Avant la migration, la seule chose qui méritait une observation à long terme était **VitePress 2.0** (à l'époque, le tag `next` pointait sur 2.0.0-alpha.20, en phase alpha).

## Les chiffres d'activité

> Date de collecte des données : 2026-10-12. Les chiffres GitHub proviennent d'api.github.com, les téléchargements npm sont les statistiques hebdomadaires du 2026-10-04 au 2026-10-10, et les numéros de version proviennent des dist-tags de registry.npmjs.org. Le nombre de stars augmente avec le temps ; veuillez prêter attention à la fraîcheur de ces données lorsque vous les citez.

| Framework | Stack technique | Étoiles GitHub | Dernier push du dépôt | Téléchargements hebdomadaires npm | Dernière version stable |
| --- | --- | --- | --- | --- | --- |
| **VitePress** | Vue 3 + Vite | 18,4k | 2026-10-11 | 1 305 159 | 1.6.4 (next : 2.0.0-alpha.20) |
| **Docusaurus** | React + MDX | 66,5k | 2026-10-10 | 1 504 459 | 3.10.2 |
| **Astro Starlight** | Astro (indépendant des frameworks) | 9,4k | 2026-10-09 | 1 431 284 (astro lui-même : 7,22 M) | astro 7.3.8 / starlight 0.42.6 |
| **docsify** | Rendu JS à l'exécution | 31,5k | 2026-10-11 | 80 727 | 5.0.0 |
| **Nextra** | Next.js + React | 13,9k | 2026-07-31 | 238 757 | 4.6.1 |
| **Fumadocs** | Next.js + React | 13,3k | 2026-10-09 | — | — |
| **MkDocs Material** | Python | 27,6k | 2026-10-02 | PyPI, non applicable | — |
| **Sphinx** | Python / RST | 8,1k | 2026-10-05 | PyPI, non applicable | — |
| **VuePress** | Vue + Webpack | 22,7k | ⚠️ **2024-08-07** | 71 177 | 1.9.10 (la v2 bloquée à 2.0.0-rc.31) |
| **Dumi** | Umi + React | 3,8k | 2026-09-14 | 20 163 | 2.4.50 |
| **Rspress** | Rspack + React | 2,3k | 2026-10-10 | 19 631 | 1.47.2 (2.0 beta.21) |

Les chiffres clés : VitePress et Docusaurus sont les deux seuls acteurs de premier plan à dépasser le million de téléchargements mensuels ; Starlight profite d'Astro lui-même (7,22 millions) pour s'élever, c'est le troisième pôle ; VuePress, malgré 23 000 étoiles, n'a plus reçu de commit depuis plus de deux ans et **a été de facto remplacé par VitePress**.

## Les avantages et inconvénients par tranche

### La première tranche : VitePress / Docusaurus / Astro Starlight

**VitePress** (utilisé par ce dépôt avant la migration ; toujours utilisé par les autres sites de la famille)

- Avantages : les composants monofichiers de Vue peuvent s'écrire directement dans le markdown (c'est précisément ce sur quoi reposent les trois pages de référence de ce dépôt : la référence des jetons / les contrats de composants / les cas dorés) ; les **chargeurs de données à la compilation** (`*.data.ts`) conviennent naturellement à la lecture des sources JSON, avec mise à jour à chaud en dev grâce au glob `watch` ; le dev de Vite est extrêmement rapide ; le thème par défaut est utilisable aussitôt, avec une configuration quasi nulle ; la communauté et la documentation chinoises sont riches.
- Inconvénients : le support MDX est faible (ce n'est pas l'écosystème MDX) ; les capacités de niveau entreprise comme le versionnement de la documentation et l'i18n doivent être construites soi-même ou trouvées sous forme de plugin ; la profondeur de personnalisation du thème est inférieure à celle de Docusaurus ; la recherche est un index local, décevante sur les grands sites.

**Docusaurus** (produit par Meta, l'écosystème le plus vaste)

- Avantages : le **plugin de versionnement de la documentation** (la coexistence de plusieurs versions) et l'**i18n** sont les plus mûrs de tous les frameworks ; l'écosystème MDX, le système de plugins et l'injection de thème (swizzle) sont aboutis ; soutenu par Meta, la maintenance à long terme est garantie.
- Inconvénients : la dépendance à tout l'écosystème React est lourde, et le volume du JS produit est important ; de nombreuses options de configuration, avec une forte charge mentale ; sa chaîne de données (le cycle de vie `loadContent`) est plus sinueuse à brancher sur des sources JSON que le chargeur de VitePress ; aucun précédent dans la famille.

**Astro Starlight** (indépendant des frameworks, la référence en matière de performance ; **utilisé actuellement par ce dépôt**)

- Avantages : **zéro JavaScript côté client par défaut**, ce qui correspond le mieux à la philosophie de ce dépôt « zéro JS à l'exécution » ; les collections de contenus (Content Collections) fournissent une couche de données typée ; les composants peuvent être mélangés entre Vue / React / Svelte ; l'artéfact produit est le plus léger ; l'expérience de documentation du thème Starlight est excellente (barre latérale, navigation par ancres, i18n intégré).
- Inconvénients : Starlight est encore en 0.x (0.42.6), et son API peut connaître des changements cassants ; les collections de contenus sont conçues pour des **contenus de type fichier** (md / mdx), et la lecture d'un JSON externe comme `tokens/*.json` demande de contourner les collections et de l'importer directement dans une page `.astro` (ce dépôt a résolu la question en appelant directement les modules du codegen depuis le frontmatter) ; aucun précédent dans la famille, et il a fallu défricher seul les conventions de déploiement / nginx / barre latérale (**ce dépôt l'a fait, voir [Déploiement](../deployment)**).

### La deuxième tranche : Nextra / Rspress / Fumadocs / Dumi

- **Nextra** : l'écosystème Next.js, un MDX puissant, une documentation élégante ; mais un couplage fort à Next.js + React, un modèle de déploiement (SSG / SSR / Edge) différent de l'hébergement statique nginx de la famille, et des conventions de répertoire de contenu en v4 très différentes de celles de VitePress. Aucune motivation à migrer.
- **Rspress** (produit par le team web-infra-dev de ByteDance) : **la construction la plus rapide** (Rspack), nettement meilleure que VitePress sur les grands sites de documentation de plusieurs milliers de pages ; une communauté de mainteneurs chinoise accueillante. Mais l'écosystème / les plugins sont les moins nombreux (20 000 téléchargements hebdomadaires) et le chargeur de données n'a pas de paradigme standard — ce dépôt ne compte qu'une trentaine de pages, et le coût d'apprentissage à payer pour la vitesse est inutile.
- **Fumadocs** : la jeune pousse à la croissance la plus rapide de ces deux dernières années (13,3k étoiles, seulement 2 issues ouvertes), Next.js + un système de conception moderne, une bonne expérience de recherche / de bascule de vue. Là encore un couplage fort à Next.js, et la documentation chinoise est rare. À garder de côté, mais déconseillé à l'introduction maintenant.
- **Dumi** : pensé pour les **démonstrations de bibliothèques de composants** (démos en direct, génération automatique des tables de propriétés). Ce dépôt est un dépôt de jetons de construction, **qui n'a aucune UI d'exécution à démontrer** : l'argument de vente central est inutilisable, avec de surcroît un couplage fort à Umi / React. Exclu sans hésitation.

### La troisième tranche et les cas particuliers

- **MkDocs Material / Sphinx** (l'écosystème Python) : une qualité de documentation extrêmement élevée, mais ils exigent la chaîne d'outils Python, qui **n'est pas dans le même écosystème** que la chaîne Node ≥ 20 + pnpm + TS de ce dépôt, et ne peuvent pas réutiliser les types TS et les fonctions de chargement du codegen. Exclus.
- **docsify** (rendu à l'exécution) : pas de compilation, on le récupère via le CDN et il est prêt à servir, adapté aux petites documentiques « une page en ligne en un éclair ». Mais il **ne génère pas le HTML à la compilation** (SEO faible, première page lente) et ne peut pas non plus faire tourner de chargeur de données à la compilation pour valider le schéma (c'est précisément la capacité dont dépendent les pages de référence de ce dépôt). Exclu.

## La correspondance point par point avec les contraintes de ce dépôt

| Contrainte / besoin du dépôt | VitePress | Docusaurus | Starlight | Les autres |
| --- | --- | --- | --- | --- |
| Les sept sites de la famille dans le même système (préfixe nginx / barre latérale / déploiement) | ✅ Les autres sites de la famille l'utilisent | ❌ Il faudrait tout défricher | ✅ Ce dépôt l'a fait (les trois contrats nginx restent valables, voir [Déploiement](../deployment)) | ❌ |
| Lire les sources JSON à la compilation pour rendre les pages de référence | ✅ Chargeur natif, déjà implémenté | ⚠️ Nécessite un plugin personnalisé | ✅ Déjà implémenté (les pages `.astro` appellent directement le load / resolve du codegen depuis leur frontmatter) | ⚠️ Plus laborieux |
| Une seule langue, le chinois, pas de besoin d'i18n | ✅ | L'avantage est inutilisable | ✅ | — |
| Du texte, des tableaux et du code, sans démonstration interactive | ✅ | ✅ | ✅ | ✅ |
| L'esprit « zéro JS à l'exécution » | ⚠️ Du JS à l'exécution (uniquement pour le site, hors du champ des lignes rouges) | ❌ Du JS lourd | ✅ Zéro JS par défaut | — |
| La réutilisation des modules TS du codegen (types / validation) | ✅ Vérifié (depuis vite ^5.4.21, le SSR prend en charge `import.meta.dirname`) | ✅ | ✅ Vérifié (astro 7 embarque vite 8, le SSR prend en charge `import.meta.dirname`) | ✅ |

Deux compléments de jugement :

- La ligne rouge « zéro JS à l'exécution » concerne **les artéfacts `dist/` du codegen**, pas le site de documentation. Que le site de documentation fasse tourner le runtime d'un framework ne viole aucune ligne rouge — il est totalement étanche à `dist/`, et les artéfacts de construction entrent dans `.gitignore`. Ceci dit, après la migration vers Starlight, le site lui-même est également devenu, par défaut, sans JavaScript côté client (seuls quelques rares éléments interactifs, comme la recherche ou la bascule de thème, sont chargés à la demande), ce qui est plus en accord avec l'esprit des lignes rouges.
- Les avantages de Docusaurus en matière de versionnement de documentation et d'i18n sont **inutilisables** pour ce dépôt : une seule langue, le chinois, une seule version, un contenu qui suit le codegen, et aucun scénario de « coexistence des documentations de versions antérieures ».

## Les éléments à suivre

1. **Starlight 1.0** : ce dépôt est actuellement verrouillé sur `^0.42.6`. En phase 0.x, des changements cassants restent possibles ; une fois la 1.0 stable publiée, il faudra évaluer le chemin de mise à jour (le guide de migration de Starlight listera les points de changement).
2. **VitePress 2.0** : à évaluer lorsqu'il passera en bêta. Les autres sites de la famille sont toujours sur VitePress ; l'enjeu principal est la performance de construction et le suivi de Vite 7.
3. **Les signaux qui déclencheraient une révision** : Starlight longtemps sans maintenance, ou une décision au niveau de la famille d'unifier les frameworks de documentation (auquel cas la pratique Starlight de ce dépôt constituerait une référence prête à l'emploi).
