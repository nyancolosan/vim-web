# 売れ筋（家具・収納・家電）データの更新（毎週の自動更新で使う手順）

`ia/trend.json` は、IA モードの「売れ筋」に出るデータです。build_muji.py がページに埋め込みます。

## 集め方
次の3つのページ（人気順）を WebFetch で開き、先頭から10件の商品名（ページの日本語表記のまま）・商品ページURLの13桁（JAN）・価格を、表示順のまま取る。

| key | 名前 | URL |
|---|---|---|
| furniture | 家具 | https://www.muji.com/jp/ja/store/cmdty/section/D00019?sort=ranking |
| storage | 収納 | https://www.muji.com/jp/ja/store/cmdty/section/D00016?sort=ranking |
| appliance | 家電・照明・時計 | https://www.muji.com/jp/ja/store/cmdty/section/D00021?sort=ranking |

## 書き方
- `cats` を新しい順位で書き直す（各 `items` は rank・name・jan・price・from）。全角英数は半角に。価格に幅がある商品は、いちばん安い価格を price に入れて from を true に。
- `top` は算出し直す：各カテゴリの順位を点数（1位=10点〜10位=1点）にし、同じ JAN の点数を合計して上位10件（同点は商品名順）。各要素は name・jan・price・from・cats（入っていたカテゴリ名の配列）・score。
- 書き直す前の `top` の順位を `history` の先頭に `{"at": 前の at, "top": [JAN, …]}` として足す（最大12週分）。
- `at` は集めた日。`label`・`source`・`method` は変えない。JAN がわからない商品は入れない。
- 1カテゴリも取れなかったときは、前の trend.json を残す。
