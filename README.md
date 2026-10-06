# VIM Web版（Netlify）

公開URL：https://vim-interior.netlify.app/ （旧URL bimini-ihae.netlify.app は `_dev/bridge` の引っ越しページを別サイトで公開し、データを引き継いで転送）

置ける？ 通れる？ いくら？ が、その場でわかる。実寸で確かめるインテリア・売場プランナーです。
アプリ本体とサーバー（`netlify/functions/api.mjs`）を1つにまとめています。

| 場所 | 中身 |
|---|---|
| `index.html` ほか | アプリ本体（`_dev/furniture-catalog.html` から組み立てたもの） |
| `netlify/functions/api.mjs` | サーバー（申し込み・通知・契約確認・解約ページ・クラウド同期・利用状況） |
| `config.js` | サーバーの場所と、申し込み画面に出す価格（表示用） |
| `_dev/` | 開発用の元ファイル（公開されません） |

## 3.0 で変わったこと
- はじめの画面で「room（部屋）／vmd（売場）」と広さ（畳・坪）を選び、そのまま「家具を置く」へ進む流れに
- 下のタブは「部屋・家具・保存・渡す」。平面図と3Dは「部屋」の中で切り替え
- 旧 Standard／Advisor は廃止。room／vmd はプロジェクトごとの種類（旧データの売場仕様は vmd として読み込み）
- プランは Free／Plus／Pro。基本の色・床材は無料、見積・お客さま表示・vmd は Pro
- Plus・Pro は復元コードでクラウド同期、Web版は匿名の利用状況を記録
- テーマカラー・フォント・画面レイアウト・β表示の設定は廃止（黒・白基調で固定）

## 3.1 で変わったこと
- 3Dの家具をなめらかな角丸に作り直し（パーツごとの色・素材はそのまま）。色の扱いを正しく（sRGB）し、光と影をやわらかく
- 選んだ家具の上に回転ハンドル（平面図はつかんで回す、3Dは「回転」を左右にドラッグ）。30°の近くで吸い付く
- 戻す・やり直しをヘッダーへ、3Dの視点ボタンを「全体・真上・歩く・その他」に整理
- Pro を月額1,480円に

## 3.2 で変わったこと
- 「家具を選ぶ」に「観葉植物」を追加。Poly Haven のスキャンしたモデル（CC0・商用可・クレジット不要）を使う
- モデルは公開のたびに Netlify が `_dev/fetch-models.mjs` で取ってきて `models/` に置く（リポジトリには入れない）。取れなかったものは手作りの植物で表示

## アプリを直すとき
1. `_dev/furniture-catalog.html` を直す（`_dev/patches/` に 3.0 の変更内容があります）
2. `python3 _dev/build.py 3.0.1` で `index.html` と `sw.js` を更新（番号は毎回上げる）
3. push すると Netlify が公開します

## プランと Stripe の設定
Stripe に次の価格を作り、価格IDを Netlify の Environment variables に入れます（値はチャットに貼らないこと）。

| 名前 | 中身 |
|---|---|
| `PRICE_PLUS_M` | Plus 月額 480円（継続・毎月） |
| `PRICE_PLUS_Y` | Plus 年額 3,800円（継続・毎年） |
| `PRICE_PLUS_PASS` | Plus 30日パス 600円（1回払い） |
| `PRICE_PRO` | Pro 月額 1,480円（継続・毎月） |
| `PRICE_PRO_LEGACY` | これまでの PRO 月額1,000円の価格ID（今の契約者を Pro のまま守る） |
| `STRIPE_KEY` | 制限付きキー（Checkout Sessions：書き込み／Customer portal：書き込み／Subscriptions：読み取り） |
| `STRIPE_WEBHOOK_SECRET` | Webhook の署名シークレット |
| `OWNER_LIDS` | （任意）支払いなしで Pro にする復元コード |
| `STATS_KEY` | （任意）利用状況を見るための合言葉（16文字以上） |

- Plus の価格に当てはまらない契約は Pro として扱います。`PRICE_PRO_LEGACY` を入れなくても今の契約者は Pro のままです。
- カスタマーポータルで「キャンセル」「支払い方法の更新」に加えて「プランの変更」をオンにし、Plus 月額・年額と Pro を切り替え先に入れます（Plus → Pro の変更はここで行います）。
- Webhook のイベント：`checkout.session.completed` `checkout.session.async_payment_succeeded` `customer.subscription.created` `customer.subscription.updated` `customer.subscription.deleted` `customer.subscription.paused` `customer.subscription.resumed` `invoice.paid` `invoice.payment_failed`
- `config.js` の `prices` は表示用です。Stripe の価格と合わせてください。

## 利用状況を見る
`https://（公開URL）/api/stats?key=（STATS_KEY）&days=7`
はじめの流れ（開いた → 広さを選んだ → 家具を置いた → 3Dを見た → 保存 → 渡す → 申し込み画面 → 申し込み）の端末数と、操作ごとの回数が出ます。

## 本番の前に
- `tokushoho.html` の事業者名・所在地・電話番号を記入してください（いまは「請求があった場合は開示」）。
- `privacy.html` の内容（クラウド同期・利用状況の記録）を確認してください。

## 注意
- Netlify の Drop（ドラッグ＆ドロップでの公開）ではサーバーが動きません。GitHub 連携で公開してください。
- キーが漏れたかもしれないときは、Stripe ですぐにキーをロール（作り直し）してください。

## 言語（v4〜）
- 画面は日本語で作り、表示時に `_dev/src/i18n.js` が英語・韓国語に置きかえます（設定 →「言語」、初回は端末の言語）。
- 訳の辞書は `_dev/i18n-dict.json`（日本語 → [英語, 韓国語]）。直したら `python3 _dev/i18n_build.py && python3 _dev/sync_src.py && python3 _dev/build.py 版`。
- 新しい日本語の文言を足したら、辞書にも追加してください（無い文言は部分ごとに訳されます）。
