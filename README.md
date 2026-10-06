# BIMini Web版（Netlify）サブスク設定手順

このフォルダは、アプリ本体と課金サーバー（`netlify/functions/api.mjs`）を1つにまとめたものです。
Claudeに「Netlify」を接続すると、公開（デプロイ）はClaudeが行えます。キーの入力だけはご自身でお願いします。

| 場所 | 中身 |
|---|---|
| `index.html` ほか | アプリ本体 |
| `netlify/functions/api.mjs` | 課金サーバー（申し込み・通知・契約確認・解約ページ） |
| `netlify.toml` / `package.json` | Netlifyの設定 |

## 1. 公開
- Claudeが、このフォルダの中身でNetlifyのサイトを作って公開します。
- 公開URL（例：`https://bimini.netlify.app/`）を控えます。
- この時点では課金は止まっていて、「PRO」ボタンで自由に切り替えられます。

## 2. Stripe（テスト環境）
- 商品「BIMini PRO」（毎月 1,000円）と価格は、接続済みのStripeでClaudeが作れます。
- 制限付きキー（rk_test_…）はご自身で作ります。開発者 → APIキー →「制限付きのキーを作成」で、次の権限を付けます。ほかはすべて「なし」にします。
  - Checkout Sessions：書き込み
  - Customer portal：書き込み
  - Subscriptions：読み取り
- 設定 → Billing → カスタマーポータルで、「キャンセル」と「支払い方法の更新」をオンにします。

## 3. キーの入力（ご自身で・チャットには貼らない）
Netlify → サイト →「Site configuration」→「Environment variables」→「Add a variable」

| 名前 | 値 | 備考 |
|---|---|---|
| `STRIPE_KEY` | rk_test_… | 「Contains secret values」にチェック |
| `STRIPE_WEBHOOK_SECRET` | whsec_… | 4で作ったもの。「Contains secret values」にチェック |
| `PRICE_PRO` | price_… | Claudeが作った価格ID |

入力したら、Claudeに「もう一度公開して」と伝えてください。値は次の公開から効きます。

## 4. Webhook
Stripe → 開発者 → Webhook → 送信先を追加
- URL：`https://（公開URL）/api/webhook`
- イベント：`checkout.session.completed` `checkout.session.async_payment_succeeded` `customer.subscription.created` `customer.subscription.updated` `customer.subscription.deleted` `customer.subscription.paused` `customer.subscription.resumed` `invoice.paid` `invoice.payment_failed`
- 署名シークレット（whsec_…）を、3の `STRIPE_WEBHOOK_SECRET` に入れます。

## 5. テスト
- 「PRO」→「申し込む」で、テストカード `4242 4242 4242 4242` を使って申し込みます。
- PROが有効になること、解約、別のブラウザで「復元コード」が使えることを確かめます。

## 6. 本番へ
- `tokushoho.html` の【　】を書き換えてから、もう一度公開します。
- Stripeを本番に切り替えて、2と4を作り直し、Netlifyの値を本番のものに差し替えて、もう一度公開します。

## 注意
- NetlifyのDrop（ドラッグ＆ドロップでの公開）では、課金サーバーが動きません。公開はClaude（Netlify接続）か、GitHub連携で行ってください。
- キーが漏れたかもしれないときは、Stripeですぐにキーをロール（作り直し）してください。
