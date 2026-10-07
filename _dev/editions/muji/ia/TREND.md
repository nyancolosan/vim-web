# 売れ筋（生活雑貨）データの更新（毎週の自動更新で使う手順）

`ia/trend.json` は、IA モードの「売れ筋」に出るデータです。build_muji.py がページに埋め込みます。

## 集め方
次の6つのページ（人気順）を WebFetch で開き、先頭から8件の商品名・商品ページURLの13桁（JAN）・価格を、表示順のまま取る。

| key | 名前 | URL |
|---|---|---|
| kitchen | キッチン | https://www.muji.com/jp/ja/store/cmdty/section/D00005?sort=ranking |
| tableware | 食器・テーブル用品 | https://www.muji.com/jp/ja/store/cmdty/section/D00046?sort=ranking |
| bath | タオル・バス・トイレ | https://www.muji.com/jp/ja/store/cmdty/section/D00033?sort=ranking |
| clean | 掃除・洗濯 | https://www.muji.com/jp/ja/store/cmdty/section/D00034?sort=ranking |
| stationery | 文房具 | https://www.muji.com/jp/ja/store/cmdty/section/D00026?sort=ranking |
| aroma | アロマ・ルームフレグランス | https://www.muji.com/jp/ja/store/cmdty/section/D00045?sort=ranking |

## 書き方
- `cats` を新しい順位で書き直す（各 `items` は rank・name・jan・price・from）。全角英数は半角に。
- `top` は算出し直す：各カテゴリの順位を点数（1位=8点〜8位=1点）にし、同じ JAN の点数を合計して上位10件（同点は商品名順）。各要素は name・jan・price・from・cats（入っていたカテゴリ名の配列）・score。
- 書き直す前の `top` の順位を `history` の先頭に `{"at": 前の at, "top": [JAN, …]}` として足す（最大12週分）。
- `at` は集めた日。`source` と `method` は変えない。JAN がわからない商品は入れない。
- 1カテゴリも取れなかったときは、前の trend.json を残す。
