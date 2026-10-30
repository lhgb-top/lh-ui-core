---
title: "docs 生成物"
---

**パス**：`dist/docs/`

これは codegen の 5 番目の target（`docsTarget`）であり、**handlebars テンプレートを使わない唯一の target**です——コードで直接文字列を組み立てます。

## 3 つの生成物

### `tokens.md` —— トークン早見表

**トップレベルの名前空間**ごとに `##` の節（button / cell / checkbox / color / dialog / icon / input / loading / motion / navbar / picker / radio / radius / shadow / spacing / switch / tag / textarea / toast / typography / zIndex）を分け、各節が 5 列の表です：

```markdown
## button

| トークン | 型 | ライト | ダーク | 説明 |
| --- | --- | --- | --- | --- |
| `button.borderRadius` | dimension | 2px | — | ボタンの角丸はグローバルの角丸に追随 |
| `button.height.medium` | dimension | 40px | — | ネイティブ追加。中サイズのボタンの高さ（デフォルト） |
| `color.primary.default` | color | #2B4C7C → #2b4c7c | #3D649E → #3d649e | 主色（藍 — 青花瓷（ceramic blue）の青） |
```

特徴：

- トークン列は**フルのドットパス**
- 色の列は「元の値 → 正規化した小文字」の 2 つを表示
- `nativeOnly` の項目は説明列に「ネイティブ追加」と注記
- ダーク列にオーバーライドがなければ `—` を入れる（現在ダークがオーバーライドするのは `color.*` のみ）

### `tokens.light.json` —— ライトのフラットスナップショット

```json
{
  "button.borderRadius": "2px",
  "button.fontWeight": 400,
  "button.height.medium": "40px",
  "color.primary.default": "#2B4C7C"
}
```

`{ path -> ベイク後の値 }` のフラットなマッピングで、機械的な消費に使います。

### `tokens.dark.json` —— ダークオーバーライド表

```json
{
  "color.focus": "#7FA6D9",
  "color.selected": "#B1C1D8",
  …
}
```

**オーバーライドされたキーだけ**を含み（すべて `color.*` で、正確な件数はバージョンによって変わります）、path 順にソートされています。

## 消費側

| 消費側 | 何を使うか |
| --- | --- |
| **本ドキュメントサイト** | `dist/docs/` を直接消費しません——[トークンリファレンス](../tokens/reference) ページは `.astro` ページが**同じ** `loadTokenFiles` + `resolveTokens` パイプラインを通してリアルタイムにレンダリングし、ソースと同期します |
| ファミリーのドキュメントサイト | `tokens.md` をトークン早見表として埋め込む |
| 各端の位置合わせ | `tokens.light.json` / `tokens.dark.json` をビルド期の比較に使う |
| ベースラインドキュメントのフィルタ | `nativeOnly` の注記を「ネイティブ新規トークン」の一覧に使う |

## 先頭のガード

`tokens.md` の先頭：

```html
<!-- このファイルは @lh-ui/core が自動生成したものです。手で変更しないでください。源：@lh-ui/core tokens -->
```

各端の生成物の「手で変更しないでください」バナーと同じ理屈です（レッドライン 6）。

## ドキュメントサイトのリファレンスページとの違い

| | `dist/docs/tokens.md` | ドキュメントサイトのトークンリファレンスページ |
| --- | --- | --- |
| 生成のタイミング | `pnpm codegen` | `pnpm docs:build` / `docs:dev` |
| データソース | codegen のメモリ上にある `tokenSet` | `.astro` ページの frontmatter が `loadTokenFiles` + `resolveTokens` を再実行 |
| 形態 | 静的な markdown の表 | インタラクティブな Astro の表（フィルタ、色見本プレビュー） |
| 場所 | `dist/`（gitignore 対象で、リポジトリには入らない） | サイトのページ（ビルド成果物は `docs/dist/`） |

両者は**同じ解決パイプラインを通る**ため、値は常に一致します。違いは提示の形態とビルドの入口だけです。
