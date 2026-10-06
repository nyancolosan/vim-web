/* BIMini Web版の設定ファイル（ふつうは書き換え不要です）
 * 課金サーバーは netlify/functions/api.mjs です。
 * Netlify側でStripeの設定（STRIPE_KEYなど）を入れるまでは、課金は止まっていて、
 * これまでどおり「PRO」ボタンで自由に切り替えられます。 */
window.BIMINI_BILLING = {
  api: "/api",
  price: "月額 1,000円（税込）",   // 表示用。Stripeで作る価格と合わせてください
  tokushoho: "tokushoho.html"
};
