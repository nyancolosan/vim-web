/**
 * 公開（Netlifyのビルド）のときに、Poly Haven の観葉植物モデル（CC0）を取ってきて models/ に置く。
 * - 1K テクスチャの glTF と、一覧用のサムネイル（thumb.png）
 * - 取れなかったものは飛ばす（アプリは手作りの植物で表示を続ける）
 * 使い方：node _dev/fetch-models.mjs
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const IDS = ["pachira_aquatica_01", "potted_plant_01", "potted_plant_02", "potted_plant_04", "calathea_orbifolia_01", "anthurium_botany_01"];
const RES = "1k";
const OUT = path.join(process.cwd(), "models");
const UA = { "User-Agent": "BIMini/3.2 (https://bimini-ihae.netlify.app; build-time model fetch)" };

async function exists(p) { try { await access(p); return true; } catch { return false; } }
async function get(url) {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(url, { headers: UA }); if (r.ok) return Buffer.from(await r.arrayBuffer()); console.warn("HTTP", r.status, url); }
    catch (e) { console.warn("fetch failed", url, e.message); }
    await new Promise((res) => setTimeout(res, 800 * (i + 1)));
  }
  throw new Error("download failed: " + url);
}
async function save(file, buf) { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, buf); }

let ok = 0;
for (const id of IDS) {
  const dir = path.join(OUT, id);
  try {
    if (await exists(path.join(dir, id + ".gltf"))) { ok++; continue; }
    const files = JSON.parse((await get("https://api.polyhaven.com/files/" + id)).toString());
    const g = files.gltf && (files.gltf[RES] || files.gltf["2k"]);
    if (!g || !g.gltf) throw new Error("no gltf");
    const main = g.gltf;
    await save(path.join(dir, id + ".gltf"), await get(main.url));
    for (const [rel, f] of Object.entries(main.include || {})) {
      const safe = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");
      await save(path.join(dir, safe), await get(f.url));
    }
    try { await save(path.join(dir, "thumb.png"), await get("https://cdn.polyhaven.com/asset_img/thumbs/" + id + ".png?width=256&height=256")); }
    catch (e) { console.warn("thumb skipped", id); }
    ok++;
    console.log("model ok:", id);
  } catch (e) {
    console.warn("model skipped:", id, e.message);
  }
}
console.log("models ready:", ok + "/" + IDS.length);
