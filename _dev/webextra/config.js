/* VIM Web版の設定ファイル
 * サーバーは netlify/functions/api.mjs です。
 * Netlify側でStripeの設定（STRIPE_KEYなど）を入れるまでは、課金は止まっていて、
 * 画面上部の「プラン」ボタンで Free → Plus → Pro を自由に切り替えられます。
 * prices は表示用です。Stripeで作った価格と合わせてください。 */
window.BIMINI_BILLING = {
  api: "/api",
  price: "月額 1,480円（税込）",
  prices: {
    plus_m: "月額 480円（税込）",
    plus_y: "3,800円・月あたり約317円",
    plus_pass: "600円",
    pro: "月額 1,480円（税込）"
  },
  tokushoho: "tokushoho.html"
};
