// 使い方: node guard.mjs in.js out.js tag  — 文ごとに try で包む（関数宣言・let/const/class はそのまま）
import fs from "fs"; import vm from "vm";
const [,, inp, outp, tag] = process.argv;
const lines = fs.readFileSync(inp, "utf8").split("\n");
const units = []; let cur = [];
for (const ln of lines) { if (cur.length && !/^[ \t]/.test(ln) && ln !== "") { units.push(cur.join("\n")); cur = []; } cur.push(ln); }
if (cur.length) units.push(cur.join("\n"));
const ok = s => { try { new vm.Script(s); return true } catch (e) { return false } };
const out = []; let acc = null, n = 0, i = 0;
for (const u of units) {
  acc = acc === null ? u : acc + "\n" + u;
  if (!ok(acc)) continue;
  const h = acc.trimStart();
  const keep = !h || /^(function\s|async\s+function\s|let\s|const\s|class\s)/.test(h) || /(^|\n)(let|const|class)\s/.test(acc)
    || (/(^|[;}\s])function\s+[A-Za-z_$]/.test(acc) && !h.startsWith("(")) || /^\/\*[\s\S]*\*\/\s*$/.test(h) && !/\*\/[\s\S]*\S/.test(h.replace(/^\/\*[\s\S]*?\*\//, ""));
  if (keep) out.push(acc); else { out.push("try{" + acc + "\n}catch(e){window.__vimErr&&__vimErr(e," + JSON.stringify(tag + "#" + (i)) + ")}"); n++; }
  acc = null; i++;
}
if (acc !== null) throw new Error("unterminated unit");
const res = out.join("\n");
if (!ok(res)) throw new Error("result invalid");
fs.writeFileSync(outp, res); console.log(n);
