# 新商品データの更新（毎週の自動更新で使う手順）

`news/news.json` は、はじめの画面の「新商品」に出るデータです。build_muji.py がページに埋め込みます。

## 集め方
次の9つのページを WebFetch で開き、「NEW」または「販売前商品」の表記がある商品だけを集める。
商品名・商品ページURLの13桁（JAN）・価格を、ページ中のリンクから正確に取る。

| cat | 名前 | URL |
|---|---|---|
| furniture | 家具 | https://www.muji.com/jp/ja/store/cmdty/section/D00019?sort=new |
| storage | 収納 | https://www.muji.com/jp/ja/store/cmdty/section/D00016?sort=new |
| bedding | 寝具 | https://www.muji.com/jp/ja/store/cmdty/section/D00041?sort=new |
| interior | インテリア用品 | https://www.muji.com/jp/ja/store/cmdty/section/D00020?sort=new |
| light | 照明・家電 | https://www.muji.com/jp/ja/store/cmdty/section/D00021?sort=new |
| kitchen | キッチン | https://www.muji.com/jp/ja/store/cmdty/section/D00005?sort=new |
| apparel | 衣服（婦人） | https://www.muji.com/jp/ja/store/cmdty/section/D00001?sort=new |
| apparel | 衣服（こども） | https://www.muji.com/jp/ja/store/cmdty/section/D00002?sort=new |
| apparel | 衣服（紳士） | https://www.muji.com/jp/ja/store/cmdty/section/S1090201 |

衣服（apparel）はページのテキストに商品リンクが出ないため JAN を取れない。**衣服だけは JAN なしで入れてよい**。その代わり、商品ごとに `"url"` にその衣服ページのURL（上の表のURL）を入れる（`jan` は付けない）。商品名の先頭の「婦人」「紳士」「キッズ」「ベビー」は残す。サイズ表記（XS 〜 XXL など）は外す。販売前の商品は名前の末尾に（10月中旬発売予定）のように入れる。

## 書き方
- 全角英数は半角に、商品名先頭の【カバー】などの括弧書きは外す。
- 価格に幅がある商品（S～D など）は、いちばん安い価格を `price` に入れ、`"from": true`。
- `at` は集めた日（YYYY-MM-DD）。`cats` と `source` は変えない。
- JAN がわからない商品は入れない（推測で作らない）。ただし衣服は上の決まりのとおり JAN なしで入れる。
- 1カテゴリも取れなかったときは、前の news.json を残して更新しない。
