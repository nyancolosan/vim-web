# AGENTS.md（Codex 向け）— idea（無印良品スタッフ向けアプリ）

Claude と Codex の分担：Codex は「決まった実装」を、Claude は「設計・確認・公開」を担当する。受け渡しは GitHub のブランチ／プルリクで行う。

## 作業のしかた
- ブランチは `codex/<短い名前>` を作る。`muji-edition` に直接 push しない。
- 作業が終わったらプルリクを作る（ベース: `muji-edition`）。本文に「変えたファイル」「確認したこと」「未確認のこと」を書く。
- アプリの公開（Artifact への publish）はしない。Claude が確認したあとに行う。

## ビルドと確認
- ビルド: `python3 _dev/editions/muji/build_muji.py <出力先>/index.html`（出力先の隣に curtain.html などもできる）
- 構文確認: ビルド後の index.html の `<script>` を `new Function` で読み込めること。
- 生成物（`__pycache__`、ビルド出力）はコミットしない。

## ソースの場所（`_dev/editions/muji/`）
- `muji.js` … メニュー・商品検索・はじめの画面 / `muji2.js` … 商品の比較・接客メモ
- `mujim.js` … 3D家具の形（`F4.<名前>`）と、商品名→形の対応 `mjShape`
- `catalog.json` … ネットストアの家具・観葉植物 / `muji.css` … 追加の見た目
- `curtain/` `knowledge/` `hb/` `idee/` … 別ページ（`*.src.html` を `build_*.py` で組み立てる）
- `ia/` … IAモード（売上管理）

## 守ること
- `catalog.json` の価格・サイズは、出典のない推測で書かない。分からない値は空欄にして、プルリクに書く。
- 観葉植物は フィカス・パキラ・エバーフレッシュ・モンステラ の4種のみ。
- お客さまの個人情報（住所・電話番号など）を扱う機能は、事前に相談する。
- 画面は スマホ・iPad・PC の幅で崩れないこと（420 / 820 / 1366px）。
