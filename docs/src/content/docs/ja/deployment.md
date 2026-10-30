---
title: "デプロイ手順"
---

本ドキュメントサイトはファミリーの約束に従い、`www.lhgb.top` の `/lhui/core/` プレフィックス配下にデプロイします（android / ios / harmony / windows の 4 サイトと同じ体系）。

サイトのフレームワークは **Astro Starlight** です（2026-10-12 に VitePress から移行。選定の記録は [ドキュメントサイトの技術選定](./guide/tech-choice) を参照）。

## ビルド

```bash
pnpm docs:build
```

生成物は `docs/dist/` にあります（`astro.config.mjs` で `outDir: 'docs/dist'` を明示し、**codegen のリポジトリルートの `dist/` を意図的に避けています**。レッドライン 6 を参照。`.gitignore` に追加済みで、バージョン管理には入りません）。

デプロイ関連の設定はすべて `docs/astro.config.mjs` にあります：

| 設定項目 | 値 | 説明 |
| --- | --- | --- |
| `site` | `https://www.lhgb.top` | sitemap と SEO のサイトオリジン |
| `base` | `/lhui/core/` | デプロイプレフィックス。先頭と末尾にスラッシュが必須 |
| `build.format` | `'file'` | `page/index.html` ではなく `page.html` を生成し、ファミリーの nginx 契約に揃える |
| `trailingSlash` | `'never'` | Starlight が引き受け、`format: 'file'` と組み合わせる |

<Aside type="tip" title="デプロイパスの変更はここ 1 か所だけ">
`base` は先頭と末尾にスラッシュが必須です。Astro の `base` はビルド成果物のアセットパス、sitemap、pagefind の検索インデックスに同時に作用するため、VitePress 時代のように `.env` ファイルを別途保守する必要はありません。
</Aside>

<Aside type="caution" title="base が効かない 2 種類のリンク">
`base` が作用するのは Astro / Starlight 自身が生成する部分だけです：ページのアセット、サイドバー、ページネーション、locale 切り替え、sitemap、pagefind インデックス。**次の 2 種類には base が自動で付きません**：

1. **frontmatter の `hero.actions[].link`**（`template: splash` のホームページの CTA ボタン）——Starlight 0.42.6 はこれをそのまま `href` にするため、`index.mdx` に完全なプレフィックスを書く必要があります。例：`/lhui/core/guide/quickstart`。
2. **markdown 本文の `/` で始まる絶対パスのリンク**——Astro 7 の markdown レンダリングは base を連結しません。

本リポジトリでは `astro.config.mjs` の `basePrefixPlugin` プラグインが、ビルド期に 2 番目の種類へ自動でプレフィックスを補うため、本文には `/tokens/reference` のような絶対パスをそのまま書けます。1 番目の種類は完全なプレフィックスを手で書く必要があります。`base` を変更するときは、ホームページの hero の 2 つのボタンも忘れずに合わせて変更してください。
</Aside>

## アップロード

`docs/dist/` の中身をサーバーのディレクトリ `/home/webuser/nginx/lh-ui/core/` へアップロードします。

## nginx 設定

```nginx
location ^~ /lhui/core/ {
    alias /home/webuser/nginx/lh-ui/core/;
    index index.html;
    try_files $uri $uri.html $uri/ /lhui/core/index.html;
}
```

ファミリーの 3 つの落とし穴契約（Starlight への移行後、1 つずつ確認したうえでなお適用されます）：

1. **`try_files` の fallback には base プレフィックスが必須**（`/lhui/core/index.html`）。ないと深いリンクの更新時に 404 になる
2. **`alias` の末尾スラッシュは省略不可**で、`location ^~ /lhui/core/` と対で使う
3. **`$uri.html` が必須**——本サイトは `build.format: 'file'` のため `page.html` の形態（URL は `/lhui/core/page`、末尾スラッシュなし）を生成し、nginx は `$uri.html` で実ファイルへフォールバックする。これを外すと深いリンクが 404 になる

## デプロイ後のセルフチェック

```bash
curl -I https://www.lhgb.top/lhui/core/guide/introduction
grep -c "lhui/core" docs/dist/index.html   # > 0 を期待
# 逆アサーション：生成物に base の欠けたサイト内リンクが存在してはならない（ヒット数は 0 であるべき）
grep -rcE 'href="/(guide|tokens|specs|cases|codegen|artifacts)/' docs/dist/ | grep -v ':0$' || echo OK
```

## ローカルプレビュー

```bash
pnpm docs:dev        # http://localhost:5185/lhui/core/
pnpm docs:preview    # 本番ビルドでプレビュー。同じく base プレフィックスが付く
```

Astro の `base` は dev サーバーでも同様に効きます（VitePress が `.env.development` で `DOCS_BASE=/` を切り替えていたのとは違います）。そのためローカルのパスにも **`/lhui/core/` プレフィックスが付きます**——ローカルと本番の URL 構造が完全に一致し、かつての「ローカルはプレフィックスなし、本番はあり」という認知負荷がむしろ解消されました。

## ポートの割り当て

| リポジトリ | dev ポート | base |
| --- | --- | --- |
| lh-ui-vue2 | 5177 | `/lhui/vue2/` |
| lh-ui-plus | 5178 | `/lhui/vue3/` |
| lh-ui-react | 5179 | `/lhui/react/` |
| lh-ui-uniapp | 5187 | `/lhui/uniapp/` |
| lh-ui-android | 5181 | `/lhui/android/` |
| lh-ui-ios | 5182 | `/lhui/ios/` |
| lh-ui-harmony | 5183 | `/lhui/harmony/` |
| lh-ui-windows | 5186 | `/lhui/windows/` |
| **lh-ui-core（本サイト）** | **5185** | **`/lhui/core/`** |

ファミリーのデプロイに関する権威ある参照は `lh-ui/docs` リポジトリの `部署/nginx-lhui.conf.md` にあります。本ドキュメントは本リポジトリに自前で置く操作マニュアルです。デプロイが有効になったら、ファミリーの一覧表も合わせて更新してください（今回の変更にリポジトリをまたぐ修正は含みません）。
