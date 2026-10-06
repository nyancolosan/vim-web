"""VIM for MUJI staff（Claude 上で動く1ファイル）を組み立てる：python3 _dev/editions/muji/build_muji.py 出力先.html
VIM 本体（index.html）をもとに、ロゴ・オープニング・テーマ・接客と売場の画面・無印良品の商品検索を重ねる。VIM 本体は変えない。"""
import json, os, re, subprocess, sys, tempfile
E = os.path.dirname(os.path.abspath(__file__)); D = os.path.dirname(os.path.dirname(E)); ROOT = os.path.dirname(D)
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
# 1) VIM の Claude 版（ベータと同じ下ごしらえ）
tmp = os.path.join(tempfile.gettempdir(), "vim-base.html")
subprocess.run([sys.executable, os.path.join(D, "make_beta.py"), tmp], check=True, capture_output=True)
s = open(tmp, encoding="utf-8").read()
s = s.replace('<title>VIM Beta</title>', '<title>VIM for MUJI</title>', 1)
s = s.replace('<div class="betatag" aria-hidden="true">BETA</div>', '', 1)
# 2) 下の英字を「interior planning × vmd」に（Poppins Bold を輪郭に）
f = TTFont('/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
def tp(t, size, x0, base):
    sc = size / upm; x = x0; out = []
    for ch in t:
        gn = cmap.get(ord(ch)); g = gs[gn]; pen = SVGPathPen(gs); g.draw(TransformPen(pen, (sc, 0, 0, -sc, x, base))); d = pen.getCommands()
        if d: out.append(d)
        x += g.width * sc
    return ' '.join(out), x - x0
txt = "interior planning × vmd"; _, w = tp(txt, 70, 0, 0); size = 70 * 700 / w; _, w2 = tp(txt, size, 0, 0)
TAG, _ = tp(txt, size, 622 - w2 / 2, 800)
s, n = re.subn(r"VIM_T='<path fill-rule=\"evenodd\" d=\"[^\"]*\"/>'", lambda m: "VIM_T='<path d=\"%s\"/>'" % TAG, s, count=1); assert n == 1
s, n = re.subn(r'<path class="op-t" fill-rule="evenodd" d="[^"]*"', lambda m: '<path class="op-t" d="%s"' % TAG, s, count=1); assert n == 1
# 3) オープニングを赤に
s = s.replace('#opening{position:fixed;inset:0;z-index:9999;background:#0a0a0a;', '#opening{position:fixed;inset:0;z-index:9999;background:#7f0019;', 1)
s = s.replace('<g class="op-dim" fill="#1b1b1b">', '<g class="op-dim" fill="#5e0013">', 1)
s = s.replace('<meta name="theme-color" content="#141414">', '<meta name="theme-color" content="#7f0019">')
s = s.replace('try{seen=sessionStorage.getItem("vim-op")==="1";sessionStorage.setItem("vim-op","1")}', 'try{seen=sessionStorage.getItem("vim-mj-op")==="1";sessionStorage.setItem("vim-mj-op","1")}', 1)
# 5) 追加分
cat = json.load(open(os.path.join(E, "catalog.json"), encoding="utf-8"))
add = '<style>' + open(os.path.join(E, "muji.css"), encoding="utf-8").read() + '</style><script>window.MUJI_CATALOG=' + json.dumps(cat, ensure_ascii=False, separators=(",", ":")) + ';window.MUJI_CATALOG_AT="2026年10月7日";</script><script>' + open(os.path.join(E, "muji.js"), encoding="utf-8").read() + '</script>'
s = s.rstrip() + "\n" + add + "\n"
open(sys.argv[1], "w", encoding="utf-8").write(s)
# 6) アイコン（赤の角丸に VIM と英字）
P = json.load(open(os.path.join(D, "brand", "vim-parts.json")))
icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254"><rect width="1254" height="1254" rx="260" fill="#7f0019"/><g fill="#fff" transform="translate(627 640) scale(1.05) translate(-622 -640)"><path d="%s"/><path d="%s"/><path d="%s"/><path d="%s"/></g></svg>' % (P["V"], P["LAMP"], P["M"], TAG)
open(os.path.join(E, "vim-muji-icon.svg"), "w").write(icon)
print("ok", len(s.encode()) // 1024, "KB,", len(cat), "items")
