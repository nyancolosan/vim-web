/**
 * VIM サーバー（Netlify Functions 版）
 * - POST /api/checkout  … 申し込みページ（Stripe Checkout）を作る（plan: plus_m / plus_y / plus_pass / pro）
 * - POST /api/webhook   … Stripeからの通知を受けて、契約状態を保存（署名を必ず検証）
 * - GET  /api/license   … アプリが契約状態（free / plus / pro）を確認する
 * - POST /api/portal    … 解約・カード変更のページ（カスタマーポータル）を開く
 * - POST /api/db        … クラウド同期（Plus・Pro）。復元コードごとに保存
 * - POST /api/ev        … 匿名の利用状況（どの画面で止まったか、など）
 * - GET  /api/stats     … 利用状況の集計（STATS_KEY が必要）
 *
 * 必要な設定（Netlify → サイト設定 → Environment variables）※値はチャットに貼らないこと
 *   STRIPE_KEY            制限付きAPIキー（rk_…）  … 「Secret」にチェック
 *   STRIPE_WEBHOOK_SECRET Webhookの署名シークレット（whsec_…） … 「Secret」にチェック
 *   PRICE_PLUS_M          Plus 月額の価格ID（price_…）
 *   PRICE_PLUS_Y          Plus 年額の価格ID
 *   PRICE_PLUS_PASS       Plus 30日パス（1回払い）の価格ID
 *   PRICE_PRO             Pro 月額の価格ID
 *   PRICE_PRO_LEGACY      （任意）これまでの PRO 月額1,000円の価格ID。カンマ区切りで複数可。Pro として扱います
 *   OWNER_LIDS            （任意）支払いなしでProにする復元コード。カンマ区切りで複数可
 *   STATS_KEY             （任意）/api/stats を見るための合言葉（16文字以上）
 * 契約状態は Netlify Blobs（bimini-lic）、同期データは bimini-sync、利用状況は bimini-ev に保存します。
 * STRIPE_KEY が未設定のあいだは課金は止まり、アプリは「プラン」ボタンで自由に切り替えられます（利用状況の記録は動きます）。
 * Plus の価格に当てはまらない契約は、すべて Pro として扱います（これまでの PRO 契約者を守るため）。
 */
import { getStore } from "@netlify/blobs";
const API = "https://api.stripe.com/v1/";
const STRIPE_VERSION = "2026-08-26.dahlia";
const ACTIVE = ["active", "trialing", "past_due"]; // past_due は再請求中の猶予期間
const PASS_DAYS = 30;

/* Cloudflare版と同じ書き方（get/put）で使えるようにした保存場所 */
function licStore() {
  const s = getStore({ name: "bimini-lic", consistency: "strong" });
  return {
    async get(k, type) { return type === "json" ? await s.get(k, { type: "json" }) : await s.get(k); },
    async put(k, v) { await s.set(k, v); },
  };
}

export default async (req, context) => {
  const url = new URL(req.url);
  url.pathname = url.pathname.replace(/^\/api/, "");
  const E = (k) => (globalThis.Netlify && Netlify.env.get(k)) || (typeof process !== "undefined" && process.env[k]) || "";
  const env = {
    STRIPE_KEY: E("STRIPE_KEY"), STRIPE_WEBHOOK_SECRET: E("STRIPE_WEBHOOK_SECRET"),
    PRICE_PLUS_M: E("PRICE_PLUS_M"), PRICE_PLUS_Y: E("PRICE_PLUS_Y"), PRICE_PLUS_PASS: E("PRICE_PLUS_PASS"),
    PRICE_PRO: E("PRICE_PRO"), PRICE_PRO_LEGACY: E("PRICE_PRO_LEGACY"),
    OWNER_LIDS: E("OWNER_LIDS"), STATS_KEY: E("STATS_KEY"), APP_URL: E("APP_URL") || new URL(req.url).origin + "/",
  };
  const cors = corsHeaders(req, env);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  try {
    // 利用状況は課金の設定と関係なく受け付ける
    if (url.pathname === "/ev" && req.method === "POST") return json(await evPut(await req.text()), 200, cors);
    if (url.pathname === "/stats" && req.method === "GET") return json(await stats(url, env), 200, cors);
    if (!env.STRIPE_KEY) return json({ disabled: true }, 200, cors);
    env.LIC = globalThis.__BIMINI_LIC || licStore();
    if (url.pathname === "/webhook" && req.method === "POST") return await webhook(req, env);
    if (url.pathname === "/checkout" && req.method === "POST") return json(await checkout(await req.json(), env), 200, cors);
    if (url.pathname === "/license" && req.method === "GET") return json(await license(url.searchParams.get("lid"), env), 200, cors);
    if (url.pathname === "/portal" && req.method === "POST") return json(await portal(await req.json(), env), 200, cors);
    if (url.pathname === "/db" && req.method === "POST") return json(await db(await req.text(), env), 200, cors);
    return json({ error: "not_found" }, 404, cors);
  } catch (e) {
    // キーや個人情報はログに出さない
    console.error("error", e && e.code ? e.code : "unknown", url.pathname);
    return json({ error: e && e.code ? e.code : "server_error", detail: e && e.detail ? e.detail : (e && !e.code ? String(e.message || "").replace(/(rk|sk|pk|whsec)_[A-Za-z0-9_*]+/g, "***").slice(0, 160) : undefined) }, e && e.status ? e.status : 500, cors);
  }
};
export const config = { path: "/api/*" };

/* ---------- アプリから呼ばれるもの ---------- */
const LID_RE = /^[a-f0-9]{32}$/;
function fail(code, status) { const e = new Error(code); e.code = code; e.status = status || 400; return e; }
function ids(v) { return String(v || "").split(",").map((x) => x.trim()).filter(Boolean); }

/* 価格IDから、どのプランか（plus／pro）を決める */
function tierOfPrice(env, priceId) {
  if (priceId && [env.PRICE_PLUS_M, env.PRICE_PLUS_Y, env.PRICE_PLUS_PASS].filter(Boolean).includes(priceId)) return "plus";
  return "pro";
}

const PLANS = {
  plus_m: { price: "PRICE_PLUS_M", mode: "subscription", tier: "plus" },
  plus_y: { price: "PRICE_PLUS_Y", mode: "subscription", tier: "plus" },
  plus_pass: { price: "PRICE_PLUS_PASS", mode: "payment", tier: "plus" },
  pro: { price: "PRICE_PRO", mode: "subscription", tier: "pro" },
};

async function checkout(body, env) {
  const lid = String(body && body.lid || "");
  const key = PLANS[body && body.plan] ? body.plan : "pro";
  if (!LID_RE.test(lid)) throw fail("bad_request");
  const P = PLANS[key], price = env[P.price];
  if (!price) throw fail("not_configured", 500);
  const app = env.APP_URL;
  const params = {
    mode: P.mode,
    // payment_method_types は指定しない（Stripeが最適な支払い方法を自動で表示）
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    client_reference_id: lid,
    "metadata[lid]": lid,
    "metadata[plan]": key,
    allow_promotion_codes: "true",
    locale: "ja",
    success_url: app + (app.includes("?") ? "&" : "?") + "paid={CHECKOUT_SESSION_ID}",
    cancel_url: app,
    integration_identifier: "bimini_web_" + randLetters(8),
  };
  if (P.mode === "subscription") { params["subscription_data[metadata][lid]"] = lid; params["subscription_data[metadata][plan]"] = key; }
  else { params["payment_intent_data[metadata][lid]"] = lid; params["payment_intent_data[metadata][plan]"] = key; }
  const s = await stripe(env, "POST", "checkout/sessions", params);
  return { url: s.url };
}

function licView(r) {
  const now = Date.now() / 1000;
  const subOn = !!(r && r.sub && ACTIVE.includes(r.status));
  const passOn = !!(r && r.passEnd && r.passEnd > now);
  if (subOn) return { active: true, tier: r.plan === "plus" ? "plus" : "pro", plan: r.plan === "plus" ? "plus" : "pro", status: r.status, end: r.end || null, cancelAt: r.cancelAt || null, passEnd: passOn ? r.passEnd : null };
  if (passOn) return { active: true, tier: "plus", plan: "plus", status: "pass", end: r.passEnd, cancelAt: null, passEnd: r.passEnd };
  return { active: false, tier: "free", plan: null, status: r ? (r.status || "none") : "none" };
}

async function license(lid, env) {
  if (!LID_RE.test(String(lid || ""))) throw fail("bad_request");
  // 管理者（運営者）用：環境変数 OWNER_LIDS に入れた復元コードは、支払いなしでPro扱い
  if (ids(String(env.OWNER_LIDS || "").toLowerCase()).includes(lid)) return { active: true, tier: "pro", plan: "pro", status: "owner", end: null, cancelAt: null };
  return licView(await env.LIC.get("lic:" + lid, "json"));
}

async function portal(body, env) {
  const lid = String(body && body.lid || "");
  if (!LID_RE.test(lid)) throw fail("bad_request");
  const r = await env.LIC.get("lic:" + lid, "json");
  if (!r || !r.customer) throw fail("no_subscription", 404);
  const s = await stripe(env, "POST", "billing_portal/sessions", { customer: r.customer, return_url: env.APP_URL });
  return { url: s.url };
}

/* ---------- クラウド同期（Plus・Pro） ----------
 * アプリの保存の仕組み（doc の get/set/delete と、kind での一覧）をそのまま受ける。
 * 鍵は復元コード（32文字）。有効な契約がないコードは使えない。 */
const DOC_RE = /^[A-Za-z0-9_\-]{1,80}$/;
const DOC_MAX = 256 * 1024;      // 1つの保存単位（アプリ側で約9万文字ずつに分けて送る）
const USER_MAX_DOCS = 3000;
async function db(text, env) {
  if (text.length > DOC_MAX + 2048) throw fail("too_large", 413);
  let b; try { b = JSON.parse(text); } catch (e) { throw fail("bad_request"); }
  const lid = String(b.lid || ""), op = String(b.op || "");
  if (!LID_RE.test(lid)) throw fail("bad_request");
  const lic = await license(lid, env);
  if (!lic.active) throw fail("plan_required", 403);
  const S = getStore({ name: "bimini-sync", consistency: "strong" });
  const key = (id) => { if (!DOC_RE.test(String(id || ""))) throw fail("bad_request"); return lid + "/" + id; };
  if (op === "get") { const d = await S.get(key(b.id), { type: "json" }); return { exists: d !== null && d !== undefined, data: d }; }
  if (op === "set") {
    const k = key(b.id), s = JSON.stringify(b.data === undefined ? null : b.data);
    if (s.length > DOC_MAX) throw fail("too_large", 413);
    const cur = await S.get(k);
    if (cur === null) { const n = (await S.list({ prefix: lid + "/" })).blobs.length; if (n >= USER_MAX_DOCS) throw fail("quota_exceeded", 413); }
    await S.set(k, s); return { ok: true };
  }
  if (op === "del") { await S.delete(key(b.id)); return { ok: true }; }
  if (op === "list") {
    const kind = String(b.kind || "");
    const L = (await S.list({ prefix: lid + "/m_" })).blobs;
    const docs = [];
    for (const x of L) { const d = await S.get(x.key, { type: "json" }); if (d && (!kind || d.kind === kind)) docs.push({ id: x.key.slice(lid.length + 1), data: d }); }
    return { docs };
  }
  throw fail("bad_request");
}

/* ---------- 利用状況（匿名） ----------
 * 端末ごとのランダムな番号と、操作の名前だけ。名前・メール・保存内容は受け取らない。 */
const EV_RE = /^[a-z][a-z0-9_]{0,31}$/, DID_RE = /^[a-f0-9]{16,32}$/;
async function evPut(text) {
  if (text.length > 8000) throw fail("too_large", 413);
  let b; try { b = JSON.parse(text); } catch (e) { throw fail("bad_request"); }
  const L = Array.isArray(b.l) ? b.l.slice(0, 20) : [b];
  const S = getStore({ name: "bimini-ev" });
  const day = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); // 日本時間の日付
  let n = 0;
  for (const x of L) {
    if (!x || !EV_RE.test(String(x.e || "")) || !DID_RE.test(String(x.d || ""))) continue;
    const p = x.p && typeof x.p === "object" ? JSON.stringify(x.p).slice(0, 300) : "";
    const rec = { e: x.e, d: x.d, t: ["free", "plus", "pro"].includes(x.t) ? x.t : "", w: x.w === "pc" || x.w === "tab" ? x.w : "sp", p, at: Date.now() };
    await S.set("ev/" + day + "/" + Date.now().toString(36) + "-" + randLetters(6), JSON.stringify(rec));
    n++;
  }
  return { ok: true, n };
}

async function stats(url, env) {
  const k = url.searchParams.get("key") || "";
  if (!env.STATS_KEY || env.STATS_KEY.length < 16 || !timingSafeEqual(k, env.STATS_KEY)) throw fail("forbidden", 403);
  const days = Math.max(1, Math.min(31, +url.searchParams.get("days") || 7));
  const S = getStore({ name: "bimini-ev" });
  const out = {}, devs = {}, tiers = {};
  let read = 0;
  for (let i = 0; i < days; i++) {
    const day = new Date(Date.now() + 9 * 3600e3 - i * 864e5).toISOString().slice(0, 10);
    const L = (await S.list({ prefix: "ev/" + day + "/" })).blobs;
    for (const x of L) {
      if (read >= 5000) break;
      const r = await S.get(x.key, { type: "json" }); read++;
      if (!r) continue;
      out[r.e] = (out[r.e] || 0) + 1;
      (devs[r.e] = devs[r.e] || new Set()).add(r.d);
      if (r.e === "open") tiers[r.t || "?"] = (tiers[r.t || "?"] || 0) + 1;
    }
  }
  const ev = Object.keys(out).sort((a, b) => out[b] - out[a]).map((e) => ({ e, count: out[e], devices: devs[e].size }));
  // はじめの流れ：開いた → 広さを選んだ → 家具を置いた → 3Dを見た → 保存 → 渡す → 課金画面
  const f = (e) => (devs[e] ? devs[e].size : 0);
  const funnel = [["open", f("open")], ["start_size", f("start_size")], ["place", f("place")], ["view_3d", f("view_3d")], ["save", f("save")], ["share_open", f("share_open")], ["paywall", f("paywall")], ["checkout", f("checkout")]];
  return { days, read, truncated: read >= 5000, funnel, events: ev, opensByTier: tiers };
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
    case "checkout.session.async_payment_succeeded": {
      const lid = o.client_reference_id || (o.metadata && o.metadata.lid);
      if (o.mode === "subscription" && (o.payment_status === "paid" || o.payment_status === "no_payment_required") && o.subscription) {
        await syncSub(env, o.subscription, lid);
      } else if (o.mode === "payment" && o.payment_status === "paid" && o.metadata && o.metadata.plan === "plus_pass") {
        await addPass(env, lid, typeof o.customer === "string" ? o.customer : o.customer && o.customer.id);
      }
      break;
    }
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
  await env.LIC.put("ev:" + ev.id, "1");
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
  const plan = tierOfPrice(env, priceId);
  const end = (item && item.current_period_end) || sub.current_period_end || null;
  const prev = (await env.LIC.get("lic:" + lid, "json")) || {};
  const rec = {
    plan, status: sub.status, sub: sub.id,
    customer: typeof sub.customer === "string" ? sub.customer : sub.customer && sub.customer.id,
    end, cancelAt: sub.cancel_at || null, at: Date.now(),
  };
  if (prev.passEnd) rec.passEnd = prev.passEnd;
  await env.LIC.put("lic:" + lid, JSON.stringify(rec));
  await env.LIC.put("sub:" + sub.id, lid);
}

/* 30日パス：買った日から30日（残りがあれば、その後ろに足す） */
async function addPass(env, lid, customer) {
  if (!lid || !LID_RE.test(lid)) return;
  const prev = (await env.LIC.get("lic:" + lid, "json")) || {};
  const now = Math.floor(Date.now() / 1000), from = Math.max(now, prev.passEnd || 0);
  const rec = Object.assign({}, prev, { passEnd: from + PASS_DAYS * 86400, at: Date.now() });
  if (!rec.customer && customer) rec.customer = customer;
  if (!rec.status) rec.status = "pass";
  await env.LIC.put("lic:" + lid, JSON.stringify(rec));
}

/* ---------- 共通 ---------- */
async function stripe(env, method, path, params) {
  const init = { method, headers: { Authorization: "Bearer " + env.STRIPE_KEY, "Stripe-Version": STRIPE_VERSION } };
  if (params) { init.headers["Content-Type"] = "application/x-www-form-urlencoded"; init.body = new URLSearchParams(params).toString(); }
  const r = await fetch(API + path, init);
  const d = await r.json();
  if (!r.ok) { const e = new Error("stripe_error"); e.code = "stripe_" + (d.error && d.error.type || r.status); e.status = 502; e.detail = String(d.error && (d.error.code || d.error.message) || "").replace(/(rk|sk|pk|whsec)_[A-Za-z0-9_*]+/g, "***").slice(0, 160); throw e; }
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
