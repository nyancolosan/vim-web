# VIM iOSアプリ リリース手順

このフォルダは、VIMをiPhone・iPadアプリにするための一式です。
3D・PDF・QRの部品はすべてアプリの中に入っているので、圏外でも動きます。
PRO（月額1,000円）は、Appleのアプリ内課金（RevenueCat経由）で販売します。

| 場所 | 中身 |
|---|---|
| `www/` | アプリ本体（`index.html`・部品・`ios-config.js`・`privacy.html`） |
| `package.json` / `capacitor.config.json` | iOSアプリにするための設定（Capacitor） |
| `scripts/ios-setup.sh` | 写真・カメラを使う理由などを書き込むスクリプト（審査で必須） |
| `resources/icon.png` / `splash.png` | アプリのアイコン（1024px）と起動画面 |
| `codemagic.yaml` | Macがない場合に、クラウドでビルドするための設定 |

---

## 0. 最初に決めること
- **アプリのID（バンドルID）**：例 `jp.あなたの名前.bimini`。半角英数字とドットで決め、あとから変えられないので慎重に選びます。
  - `capacitor.config.json` の `appId` と、`codemagic.yaml` の `bundle_identifier` を、この値に書き換えます（2か所とも）。

## 1. Apple Developer Program に登録する
1. https://developer.apple.com/programs/ からApple アカウントで登録します（年99ドル）。
2. 承認まで数日かかることがあります。数日たっても進まないときは、Appleに問い合わせると早く進むことがあります。

## 2. App Store Connect でアプリを作る
1. https://appstoreconnect.apple.com →「アプリ」→「＋」→「新規App」を開きます。
   - プラットフォームはiOS、名前は「VIM」、言語は日本語、バンドルIDは0で決めたものを選びます。
   - バンドルIDが一覧にない場合は、先にDeveloperサイトの「Identifiers」で登録します。
2. **サブスクリプション**を作ります（アプリ →「サブスクリプション」）。
   - サブスクリプショングループ：`VIM PRO`
   - 製品ID：`bimini_pro_monthly`、期間：1か月
   - 価格：1,000円（その価格がない場合は、いちばん近い価格を選びます）
   - 表示名・説明・審査用のスクリーンショットも入れます。
3. **有料Appの契約**（ビジネス → 契約）に同意し、口座と税金の情報を登録します。これをしないと課金が動きません。
4. 小規模事業者向けの手数料プログラム（App Store Small Business Program）への申し込みも検討してください。

## 3. RevenueCat を準備する（購入の確認を任せるサービス）
1. https://www.revenuecat.com で無料登録し、プロジェクトを作って「App Store」のアプリを追加します（バンドルIDを入力）。
2. App Store Connectの「アプリ内課金キー」を作り、RevenueCatに登録します。登録方法はRevenueCatの画面の案内に従ってください。
3. **Entitlement（権利）**を `pro` という名前で作り、`bimini_pro_monthly` を紐づけます。
4. **Offering**（default）に、Monthlyのパッケージとして `bimini_pro_monthly` を入れます。
5. 「APIキー」画面の**公開SDKキー（appl_…）**をコピーします。

## 4. 設定ファイルを書き換える（`www/ios-config.js`）
- `revenuecatKey`：3-5の `appl_…`（アプリに入れて大丈夫な、公開用のキーです）
- `webUrl`：Web版のURL（QRのプレゼンボードで使います）
- `privacy`：公開したプライバシーポリシーのURL
  - Web版のzipに `privacy.html` が入っています。【　】を書き換えて公開してください。

## 5-A. Macがある場合
1. Mac App StoreからXcodeを、https://nodejs.org からNode.js（LTS）を入れます。
2. ターミナルでこのフォルダに移動して、次を実行します。
   ```
   npm install
   npm run setup
   npm run open
   ```
3. Xcodeが開いたら、次を設定します。
   - 「Signing & Capabilities」で自分のチームを選びます。
   - 「＋Capability」から「In-App Purchase」を追加します。
4. 実機（iPhone）をつないで実行し、動作を確認します。購入はサンドボックスのテスト用アカウントで試せます。
5. メニュー「Product → Archive」→「Distribute App」→「App Store Connect」でアップロードします。

## 5-B. Macがない場合（Codemagicでクラウドビルド）
1. GitHubにアカウントを作り、このフォルダの中身を新しいリポジトリ（非公開）にアップロードします。ブラウザからでもアップロードできます。
2. App Store Connect →「ユーザとアクセス」→「統合」→「App Store Connect API」で、キーを作ります。
   - 権限は「App Manager」にします。
   - Issuer ID・キーID・.p8ファイルを控えます。
3. https://codemagic.io にGitHubで登録し、リポジトリを追加します。
   - 「Teams → Integrations → Developer Portal」に、2のキーを `VIM ASC` という名前で登録します。
4. 「Start new build」→ ワークフロー「VIM iOS」を選ぶと、ビルドしてTestFlightまで自動で送ります。

## 6. TestFlightで確認する
1. iPhoneに「TestFlight」アプリを入れます。
2. App Store Connectの「TestFlight」で自分をテスターに追加して、配信されたVIMを入れます。
3. 次の点を確かめます。
   - 3D・保存（共有シート）・PDF・QRが動く
   - PROを購入するとPROが有効になる
   - 「購入を復元」で戻る
   - 機内モードでも動く

## 7. 審査に出す
App Store Connectのアプリのページで、次を入れてから「審査に提出」します。
- **スクリーンショット**：6.9インチ（iPhone）と13インチ（iPad）が必要です。
- **説明文**：前に作った紹介文が使えます。
- **キーワード**・**サポートURL**・**プライバシーポリシーURL**
- **Appのプライバシー**：「購入履歴」と「その他のID（匿名）」を「ユーザーに紐づかない／追跡なし」で申告します（RevenueCatの利用分）。
- **サブスクリプション**：審査用の情報を入れて、アプリと一緒に提出します。
- **審査メモ**に、次のように書いておくと通りやすくなります。
  > 家具の配置を平面図と3Dで検討するアプリです。データは端末内に保存され、ログインは不要です。PROはアプリ内課金で購入でき、「PRO」ボタンから購入・購入の復元ができます。

### 審査でよく止まる点
- **Webサイトを包んだだけに見える**：このアプリは3D描画・保存・共有・課金をアプリの中で行うので、そう説明します。
- **購入の復元ボタンがない**：PRO画面に「購入を復元」を入れてあります。
- **サブスクの説明不足**：価格・期間・自動更新・利用規約・プライバシーポリシーへのリンクを、PRO画面に表示してあります。

---

## 更新するとき
1. 新しい `www/index.html` に差し替えます。
2. `npm run sync`（Mac）を実行するか、Codemagicで再ビルドします。
3. App Store Connectで新しいバージョンを作り、審査に出します。

## Web版との関係
- iOS版の課金はAppleのアプリ内課金、Web版はStripeです。今は別々なので、iPhoneで買ったPROはWeb版では使えません。
- まとめたくなったら、RevenueCatのWeb課金機能などで1つにできます。
