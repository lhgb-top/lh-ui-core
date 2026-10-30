---
title: "Fusion du mode sombre"
---

## Les surcharges incrémentales

Les fichiers sombres (`"$dark": true`) **ne déclarent que les clés qui diffèrent du mode clair** ; les clés non surchargées conservent la valeur du mode clair :

```json
// color-dark.json
{
  "$namespace": "color",
  "$dark": true,
  "$description": "Ne déclare que les clés qui diffèrent du mode clair ; les clés non surchargées conservent celles de color.json",
  "primary": { "default": { "value": "#3D649E" } }
}
```

Les clés `color.primary.hover`, `.active`, etc., qui ne sont pas listées, conservent la valeur du mode clair. Le principe de l'élagage est une **comparaison clé par clé** : toute clé dont la valeur est strictement identique à celle du mode clair est supprimée (par exemple `onPrimary` vaut `#FFFFFF` dans les deux thèmes, et les `disabled.*` sont dans les deux thèmes les mêmes refs ; c'est pourquoi ni les uns ni les autres n'apparaissent dans le fichier sombre).

## L'espace de noms doit être aligné

Le fichier sombre doit déclarer **le même `$namespace`** que le fichier clair (`color-dark.json` porte explicitement `"$namespace": "color"`), afin que les clés de surcharge retombent sur le même chemin.

## La résolution au plus proche des refs sombres

Les `ref` d'un fichier sombre sont résolus par `resolveDarkRef`, dont les règles diffèrent de celles du mode clair :

1. La cible est **dans l'espace de noms sombre** et c'est un ref → on suit la chaîne récursivement au sein du sombre (un ref sombre vers un sombre est la prise de valeur d'un même thème)
2. La cible est dans l'espace de noms sombre et c'est une valeur littérale → retourne la valeur sombre
3. La cible **n'est pas** dans l'espace de noms sombre → **repli sur l'espace de noms clair** pour prendre la valeur

```json
// Un sombre qui référence un sombre : on prend la valeur sombre de primary.active
"selectedDark": { "ref": "color.primary.active" }
```

Les refs sombres font également l'objet d'une détection de cycles (`Cycle de références de jetons sombres détecté`), et la cible doit exister dans le jeu clair ou dans le jeu sombre, à défaut de quoi l'erreur `La référence du jeton sombre X n’existe pas` est levée.

## Le précalcul des color-mix

Le mode sombre de la lignée web utilise massivement des `color-mix()`, **une capacité que les cibles natives n'ont pas à l'exécution** ; c'est pourquoi ils sont **précalculés à la compilation en valeurs de couleurs aplaties**, et le raisonnement du calcul est inscrit dans la description :

```json
"selected": {
  "value": "#B1C1D8",
  "description": "Précalculé à partir de color-mix(primary 40%, #fff), contraste 5.2:1 sur le panneau sombre"
},
"primary": {
  "bg": {
    "value": "rgba(61, 100, 158, 0.25)",
    "description": "Précalculé à partir de color-mix(primary 25%, transparent)"
  }
}
```

## La forme des artéfacts

`resolveTokens` produit `TokenSet.dark` : une `Map<path, TokenValue>` aplatie, qui ne contient que les clés surchargées. Chaque cible décide ensuite comment l'émettre :

| Plateforme | Mécanisme du mode sombre |
| --- | --- |
| Android | Un `object LhDarkTokens` indépendant |
| iOS | Un `public enum LhDarkTokens` indépendant |
| HarmonyOS | Une `export class LhDarkTokens` indépendante |
| **C** | **La redéfinition de macros de même nom** — le fichier d'en-tête sombre est inclus après le clair et écrase directement les `#define` homonymes |

## Les chemins sombres orphelins

Deux types d'anomalies sont consignés dans `orphanDarkPaths` (**ils n'interrompent pas le codegen**, ils sont signalés par `pnpm verify:tokens`) :

- Une clé sombre **sans type** (ni type propre, et le jeu clair n'a pas non plus de clé de même nom dont hériter) → la clé est sautée et n'est pas écrite dans la table des surcharges
- Une clé sombre **inexistante dans le jeu clair** (orpheline) → tout de même écrite dans la table des surcharges, mais signalée dans le rapport

## L'étendue des surcharges sombres

Actuellement, le mode sombre ne surcharge que l'espace de noms `color.*` (le nombre exact de clés varie selon les versions, voir la colonne sombre de la page [Référence des jetons](./reference)). Les espaces de noms non colorés (espacement, rayons, tailles de police, etc.) conservent les valeurs du mode clair — c'est également la raison pour laquelle, dans `dist/docs/tokens.md`, les lignes non colorées ont `—` dans la colonne sombre.

La page [Référence des jetons](./reference) permet de voir simultanément la valeur claire et la valeur sombre de chaque jeton.
