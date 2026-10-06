/* VIM iOSアプリの設定（手順書の「4. RevenueCat」のあとに書き換えます） */
window.BIMINI_IOS = {
  revenuecatKey: "",            // RevenueCatの「公開SDKキー」（appl_… で始まる。アプリに入れて大丈夫な種類のキーです）
  entitlement: "pro",           // RevenueCatで作る「権利（Entitlement）」の名前
  webUrl: "",                   // Web版のURL（QRのプレゼンボード用）。例："https://vim-interior.netlify.app/"
  privacy: "https://vim-interior.netlify.app/privacy.html", // 公開したプライバシーポリシーのURL
  terms: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" // 利用規約（Appleの標準EULA）
};
