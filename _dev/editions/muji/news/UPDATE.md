# 新商品データの更新（毎週の自動更新で使う手順）

`news/news.json` は、はじめの画面の「新商品」に出るデータです。build_muji.py がページに埋め込みます。

## 集め方
次の6つのページを WebFetch で開き、「NEW」または「販売前商品」の表記がある商品だけを集める。
商品名・商品ページURLの13桁（JAN）・価格を、ページ中のリンクから正確に取る。

| cat | 名前 | URL |
|---|---|---|
| furniture | 家具 | https://www.muji.com/jp/ja/store/cmdty/section/D00019?sort=new |
| storage | 収納 | https://www.muji.com/jp/ja/store/cmdty/section/D00016?sort=new |
| bedding | 寝具 | https://www.muji.com/jp/ja/store/cmdty/section/D00041?sort=new |
| interior | インテリア用品 | https://www.muji.com/jp/ja/store/cmdty/section/D00020?sort=new |
| light | 照明・家電 | https://www.muji.com/jp/ja/store/cmdty/section/D00021?sort=new |
| kitchen | キッチン | https://www.muji.com/jp/ja/store/cmdty/section/D00005?sort=new |

## 書き方
- 全角英数は半角に、商品名先頭の【カバー】などの括弧書きは外す。
- 価格に幅がある商品（S～D など）は、いちばん安い価格を `price` に入れ、`"from": true`。
- `at` は集めた日（YYYY-MM-DD）。`cats` と `source` は変えない。
- JAN がわからない商品は入れない（推測で作らない）。
- 1カテゴリも取れなかったときは、前の news.json を残して更新しない。
