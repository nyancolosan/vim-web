// IA モードの「売った商品」検索に使う商品一覧をつくる：node build_items.cjs > items.json
// アプリに入っているネットストアの商品（家具・新商品・売れ筋・オーダーカーテン・H&B）を JAN でまとめる。
// 1件 = [JAN, 商品名, 分類, 価格（いちばん安い価格）]
const fs = require("fs"), path = require("path");
const M = path.join(__dirname, "..");
const out = new Map();
const put = (jan, name, cat, price) => { if (!/^\d{13}$/.test(jan || "") || out.has(jan)) return; out.set(jan, [jan, String(name).normalize("NFKC"), cat, Math.round(price || 0)]); };
// 家具（catalog.json）
JSON.parse(fs.readFileSync(path.join(M, "catalog.json"), "utf8")).forEach(p => put(p.jan, p.name, p.cat === "rug" ? "インテリア用品" : "家具", p.price));
// 新商品（news.json）
const N = JSON.parse(fs.readFileSync(path.join(M, "news", "news.json"), "utf8")), NC = Object.fromEntries(N.cats.map(c => [c[0], c[1]]));
N.items.forEach(i => put(i.jan, i.name, i.cat === "furniture" ? "家具" : NC[i.cat] || "生活雑貨", i.price));
// 売れ筋（trend.json：家具・収納・家電）
JSON.parse(fs.readFileSync(path.join(__dirname, "trend.json"), "utf8")).cats.forEach(c => c.items.forEach(i => put(i.jan, i.name, ({furniture: "家具", storage: "収納", appliance: "照明・家電"})[c.key] || "生活雑貨", i.price)));
// オーダーカーテン（curtain.src.html の価格データを読み込む）
{ const s = fs.readFileSync(path.join(M, "curtain", "curtain.src.html"), "utf8");
  const a = s.indexOf("/* ===== 価格データ"), b = s.indexOf("/* ===== 画面");
  const js = s.slice(s.indexOf("(function(){", a), b).replace(/<\/script>[\s\S]*$/, "");
  const window = {}; new Function("window", js)(window);
  const C = window.MUJI_CURTAIN, SN = Object.fromEntries(C.styles.map(x => [x.k, x.n]));
  C.fabrics.forEach(f => f.col.forEach(c => {
    const add = (jans, lined) => Object.keys(jans || {}).forEach(st => { const k = C.tierKey(f, c[0], st, lined); const t = k && C.tables[k];
      put(jans[st], "オーダー " + f.n + " " + SN[st] + "カーテン" + (lined ? "（遮光裏地付）" : "") + "／" + c[0], "オーダーカーテン", t ? t.v[0][0] : 0); });
    add(c[2], false); add(c[3], true); })); }
// H&B（hb.src.html の商品表）
{ const s = fs.readFileSync(path.join(M, "hb", "hb.src.html"), "utf8");
  const a = s.indexOf("var P={"), b = s.indexOf("};", a) + 1;
  const P = new Function("return " + s.slice(a + 6, b))();
  Object.values(P).forEach(p => put(p[1], p[0], "H&B", p[2])); }
process.stdout.write(JSON.stringify([...out.values()]));
