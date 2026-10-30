---
title: "Espaces de noms et chemins pointillés"
---

## La règle

**Le chemin pointillé global d'un jeton = `$namespace` + le chemin imbriqué à l'intérieur du fichier.**

```
tokens/color.json        "$namespace": "color"
                         primary.default.value = "#2B4C7C"
                         → Le chemin complet : color.primary.default

tokens/z-index.json      "$namespace": "zIndex"
                         modal.value = 1050
                         → Le chemin complet : zIndex.modal
```

Toutes les références trans-fichiers (`ref`, les `tokenRefs` des specs, les `then.tokens` des cas) **doivent être écrites en chemins complets**.

## Les trois cas de figure des espaces de noms

### 1. Par défaut : déduction à partir du nom du fichier

En l'absence de déclaration de `$namespace`, l'espace de noms est déduit du nom du fichier, découpé selon les `-` (`namespaceFromFileName`) : la première partie est conservée telle quelle, et chaque partie suivante voit sa première lettre mise en majuscule.

| Nom du fichier | Résultat de la déduction |
| --- | --- |
| `color.json` | `color` |
| `z-index.json` | `zIndex` |
| `typography.json` | `typography` |
| `color-dark.json` | `colorDark` (**la valeur déduite, mais en pratique inutilisée**) |

La déduction n'est qu'un **repli** — les fichiers sombres déclareront toujours explicitement un `$namespace` aligné avec celui du fichier clair (voir ci-dessous).

### 2. La déclaration explicite

`$namespace` est écrit directement :

```json
{ "$namespace": "zIndex", "modal": { "value": 1050 } }
```

**Le fichier sombre doit déclarer explicitement le même `$namespace` que le fichier clair**, sinon les clés de surcharge ne retomberaient pas sur le même chemin :

```json
// color-dark.json
{ "$namespace": "color", "$dark": true, "primary": { "default": { "value": "#3D649E" } } }
```

C'est ainsi que la surcharge sombre de `color.primary.default` peut être fusionnée correctement sur le même chemin que la clé claire.

### 3. La chaîne vide : les clés de premier niveau sont les espaces de noms

`components.json` déclare `"$namespace": ""`, si bien que **les clés de premier niveau sont les espaces de noms des composants**, et les chemins complets sont directement `button.height.medium`, `input.borderRadius` :

```json
{
  "$namespace": "",
  "$type": "dimension",
  "button": {
    "height": { "medium": { "value": "40px" } }
  }
}
```

## Les effets concrets des espaces de noms

- **`dist/docs/tokens.md`** est découpé en sections `##` par espaces de noms de premier niveau (button / color / motion / zIndex …)
- **L'étape resolve** fait la détection des doublons sur les chemins complets : un même chemin apparaissant dans deux fichiers clairs lève directement une erreur
- **La fusion du mode sombre** fait correspondre les clés de surcharge sur les chemins complets
- **Chaque cible** construit la structure imbriquée en découpant le chemin en segments (Android `object Color`, Swift `enum Color`, C `LH_COLOR_*`)

## Un exemple complet

```
color.primary.active          ← color.json
button.height.medium          ← components.json (l'espace de noms est la chaîne vide)
typography.fontSize.base      ← typography.json
zIndex.modal                  ← z-index.json (explicite)
motion.easing.easeInOut       ← motion.json (imbrication de groupes)
```

La page [Référence des jetons](./reference) permet de parcourir tous les jetons par espace de noms.
