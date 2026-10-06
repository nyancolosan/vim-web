/**
 * BIMini 課金サーバー（Cloudflare Pages の _worker.js として、アプリと一緒にアップロード）
 * - POST /api/checkout  … 申し込みページ（Stripe Checkout）を作る
 * - POST /api/webhook   … Stripeからの通知を受けて、契約状態をKVに保存（署名を必ず検証）
 * - GET  /api/license   … アプリが契約状態を確認する
 * - POST /api/portal    … 解約・カード変更のページ（カスタマーポータル）を開く
 * - それ以外のURL       … アプリのファイルをそのまま返す
 *
 * 必要な設定（Pagesのプロジェクト → 設定 → 変数とシークレット）
 *   STRIPE_KEY            制限付きAPIキー（rk_…）※シークレットとして登録
 *   STRIPE_WEBHOOK_SECRET Webhookの署名シークレット（whsec_…）※シークレット
 *   PRICE_PRO             PROプラン（月額）の価格ID（price_…）
 * バインド：KV名前空間を変数名「LIC」で紐づける
 * STRIPE_KEY が未設定のあいだは課金は止まり、アプリは「PRO」ボタンで自由に切り替えられます。
 */
const API = "https://api.stripe.com/v1/";
const STRIPE_VERSION = "2026-08-26.dahlia";
const ACTIVE = ["active", "trialing", "past_due"]; // past_due は再請求中の猶予期間

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS ? env.ASSETS.fetch(req) : new Response("not found", { status: 404 });
    url.pathname = url.pathname.slice(4);
    env = Object.assign({}, env, { APP_URL: env.APP_URL || new URL(req.url).origin + "/" });
    const cors = corsHeaders(req, env);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (!env.STRIPE_KEY || !env.LIC) return json({ disabled: true }, 200, cors);
    try {
      if (url.pathname === "/webhook" && req.method === "POST") return await webhook(req, env);
      if (url.pathname === "/checkout" && req.method === "POST") return json(await checkout(await req.json(), env), 200, cors);
      if (url.pathname === "/license" && req.method === "GET") return json(await license(url.searchParams.get("lid"), env), 200, cors);
      if (url.pathname === "/portal" && req.method === "POST") return json(await portal(await req.json(), env), 200, cors);
      return json({ error: "not_found" }, 404, cors);
    } catch (e) {
      // キーや個人情報はログに出さない
      console.error("error", e && e.code ? e.code : "unknown", url.pathname);
      return json({ error: e && e.code ? e.code : "server_error" }, e && e.status ? e.status : 500, cors);
    }
  },
};

/* ---------- アプリから呼ばれるもの ---------- */
const LID_RE = /^[a-f0-9]{32}$/;
function fail(code, status) { const e = new Error(code); e.code = code; e.status = status || 400; return e; }

async function checkout(body, env) {
  const lid = String(body && body.lid || ""), plan = "pro";
  if (!LID_RE.test(lid)) throw fail("bad_request");
  const price = env.PRICE_PRO;
  if (!price) throw fail("not_configured", 500);
  const app = env.APP_URL;
  const s = await stripe(env, "POST", "checkout/sessions", {
    mode: "subscription",
    // payment_method_types は指定しない（Stripeが最適な支払い方法を自動で表示）
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    client_reference_id: lid,
    "metadata[lid]": lid,
    "metadata[plan]": plan,
    "subscription_data[metadata][lid]": lid,
    "subscription_data[metadata][plan]": plan,
    allow_promotion_codes: "true",
    locale: "ja",
    success_url: app + (app.includes("?") ? "&" : "?") + "paid={CHECKOUT_SESSION_ID}",
    cancel_url: app,
    integration_identifier: "bimini_web_" + randLetters(8),
  });
  return { url: s.url };
}

async function license(lid, env) {
  if (!LID_RE.test(String(lid || ""))) throw fail("bad_request");
  const r = await env.LIC.get("lic:" + lid, "json");
  if (!r) return { active: false, plan: null, status: "none" };
  return { active: ACTIVE.includes(r.status), plan: r.plan, status: r.status, end: r.end || null, cancelAt: r.cancelAt || null };
}

async function portal(body, env) {
  const lid = String(body && body.lid || "");
  if (!LID_RE.test(lid)) throw fail("bad_request");
  const r = await env.LIC.get("lic:" + lid, "json");
  if (!r || !r.customer) throw fail("no_subscription", 404);
  const s = await stripe(env, "POST", "billing_portal/sessions", { customer: r.customer, return_url: env.APP_URL });
  return { url: s.url };
}

/* ---------- Stripeからの通知 ---------- */
async function webhook(req, env) {
  const payload = await req.text();
  const ok = await verifySig(payload, req.headers.get("stripe-signature") || "", env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return new Response("bad signature", { status: 400 });
  const ev = JSON.parse(payload);
  // 同じ通知が2回来ても1回だけ処理する
  if (await env.LIC.get("ev:" + ev.id)) return new Response("dup", { status: 200 });
  const o = ev.data && ev.data.object || {};
  switch (ev.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      if (o.mode === "subscription" && (o.payment_status === "paid" || o.payment_status === "no_payment_required") && o.subscription) {
        const lid = o.client_reference_id || (o.metadata && o.metadata.lid);
        await syncSub(env, o.subscription, lid);
      }
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      await saveSub(env, o, null);
      break;
    case "invoice.paid":
    case "invoice.payment_failed": {
      const sid = (o.parent && o.parent.subscription_details && o.parent.subscription_details.subscription) || o.subscription;
      if (sid) await syncSub(env, typeof sid === "string" ? sid : sid.id, null);
      break;
    }
  }
  await env.LIC.put("ev:" + ev.id, "1", { expirationTtl: 60 * 60 * 24 * 7 });
  return new Response("ok", { status: 200 });
}

async function syncSub(env, subId, lid) {
  const sub = await stripe(env, "GET", "subscriptions/" + encodeURIComponent(subId));
  await saveSub(env, sub, lid);
}

async function saveSub(env, sub, lidHint) {
  const lid = lidHint || (sub.metadata && sub.metadata.lid) || (await env.LIC.get("sub:" + sub.id));
  if (!lid || !LID_RE.test(lid)) return;
  const item = sub.items && sub.items.data && sub.items.data[0];
  const priceId = item && item.price && item.price.id;
  const plan = "pro";
  const end = (item && item.current_period_end) || sub.current_period_end || null;
  const rec = {
    plan, status: sub.status, sub: sub.id,
    customer: typeof sub.customer === "string" ? sub.customer : sub.customer && sub.customer.id,
    end, cancelAt: sub.cancel_at || null, at: Date.now(),
  };
  await env.LIC.put("lic:" + lid, JSON.stringify(rec));
  await env.LIC.put("sub:" + sub.id, lid);
}

/* ---------- 共通 ---------- */
async function stripe(env, method, path, params) {
  const init = { method, headers: { Authorization: "Bearer " + env.STRIPE_KEY, "Stripe-Version": STRIPE_VERSION } };
  if (params) { init.headers["Content-Type"] = "application/x-www-form-urlencoded"; init.body = new URLSearchParams(params).toString(); }
  const r = await fetch(API + path, init);
  const d = await r.json();
  if (!r.ok) { const e = new Error("stripe_error"); e.code = "stripe_" + (d.error && d.error.type || r.status); e.status = 502; throw e; }
  return d;
}

async function verifySig(payload, header, secret) {
  if (!secret || !header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => { const i = kv.indexOf("="); return [kv.slice(0, i).trim(), kv.slice(i + 1)]; }).filter((p) => p[0] !== "v1"));
  const sigs = header.split(",").filter((kv) => kv.trim().startsWith("v1=")).map((kv) => kv.trim().slice(3));
  const t = Number(parts.t);
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > 300) return false; // 5分より古い通知は拒否
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(t + "." + payload)));
  const hex = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
  return sigs.some((s) => timingSafeEqual(s, hex));
}
function timingSafeEqual(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
function randLetters(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, (v) => String.fromCharCode(97 + (v % 26))).join(""); }
function corsHeaders(req, env) {
  const origin = req.headers.get("origin") || "", allow = env.APP_URL ? new URL(env.APP_URL).origin : "";
  return { "Access-Control-Allow-Origin": origin === allow ? origin : allow, "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" };
}
function json(d, status, headers) { return new Response(JSON.stringify(d), { status, headers: Object.assign({ "Content-Type": "application/json" }, headers || {}) }); }
