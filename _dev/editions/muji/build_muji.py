"""POAD（pocket advisor。旧 VIM for MUJI staff / MUJI Store Assistant。Claude 上で動くページ）を組み立てる：python3 _dev/editions/muji/build_muji.py 出力先.html
VIM 本体（index.html）をもとに、ロゴ・オープニング・テーマ・選択画面・無印良品の商品検索・オーダーカーテン見積・素材知識を重ねる。VIM 本体は変えない。"""
import json, os, re, subprocess, sys, tempfile
E = os.path.dirname(os.path.abspath(__file__)); D = os.path.dirname(os.path.dirname(E)); ROOT = os.path.dirname(D)
# 0) ロゴの部品（poad/make_poad.py で作る）
subprocess.run([sys.executable, os.path.join(E, "poad", "make_poad.py")], check=True, capture_output=True)
P = json.load(open(os.path.join(E, "poad", "poad.json")))
BRAND = "#670215"   # アイコン・オープニングの地色（ロゴ画像と同じワイン色）
# 1) VIM の Claude 版（ベータと同じ下ごしらえ）
tmp = os.path.join(tempfile.gettempdir(), "vim-base.html")
subprocess.run([sys.executable, os.path.join(D, "make_beta.py"), tmp], check=True, capture_output=True)
s = open(tmp, encoding="utf-8").read()
s = s.replace('<title>VIM Beta</title>', '<title>POAD</title>', 1)
s = s.replace('<div class="betatag" aria-hidden="true">BETA</div>', '', 1)
s = s.replace('<meta name="apple-mobile-web-app-title" content="VIM"><meta name="application-name" content="VIM">', '<meta name="apple-mobile-web-app-title" content="POAD"><meta name="application-name" content="POAD">', 1)
s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="POAD（pocket advisor）：無印良品の店舗スタッフ向け。部屋に家具を置く・オーダーカーテンの見積り・素材知識">', s, count=1)
s = s.replace('aria-label="VIM visual × interior × modeling"', 'aria-label="POAD pocket advisor"')
# 2) ロゴを POAD に（画面・見積書・PDF で使う VIM_W / VIM_T を差し替える。枠は VIM と同じ）
s, n = re.subn(r"VIM_W='[^']*'", lambda m: "VIM_W='%s'" % P["WORD"], s, count=1); assert n == 1
s, n = re.subn(r"VIM_T='<path fill-rule=\"evenodd\" d=\"[^\"]*\"/>'", lambda m: "VIM_T='<path d=\"%s\"/>'" % P["TAG"], s, count=1); assert n == 1
# 3) オープニング：POAD の文字が並び、D のポケットのふたが開いて閉じる
a = s.index('<div id="opening"'); b = s.index('<script>(function(){var o=document.getElementById("opening")', a)
x0, y0, xm = P["HINGE"]
OP = ('<style>#opening{background:%s!important}#opening .po-sup{position:absolute;left:0;right:0;bottom:calc(22px + env(safe-area-inset-bottom,0px));text-align:center;color:#fff;font:600 11px/1 Poppins,"Hiragino Sans",system-ui,sans-serif;letter-spacing:.18em;opacity:0;animation:poFade .6s ease 2.5s both}'
      '#opening .po-svg{width:min(84vw,560px);height:auto;overflow:visible}'
      '#opening .po-l{animation:poUp .55s cubic-bezier(.2,.8,.2,1) both}#opening .po-l1{animation-delay:.15s}#opening .po-l2{animation-delay:.27s}#opening .po-l3{animation-delay:.39s}'
      '#opening .po-d{animation:poPop .55s cubic-bezier(.2,.8,.2,1) .52s both;transform-box:view-box;transform-origin:%.1fpx %.1fpx}'
      '#opening .po-flap{animation:poFlap 1.5s cubic-bezier(.5,0,.3,1) 1.05s both;transform-box:view-box;transform-origin:%.1fpx %.1fpx}'
      '#opening .po-body{animation:poBump .35s ease-out 2.42s both;transform-box:view-box;transform-origin:%.1fpx %.1fpx}'
      '#opening .po-tag{animation:poFade .6s ease 2.2s both}'
      '@keyframes poUp{from{opacity:0;transform:translateY(26px)}}@keyframes poPop{from{opacity:0;transform:scale(.86)}}@keyframes poFade{from{opacity:0;transform:translateY(8px)}}'
      '@keyframes poFlap{0%%{transform:scaleY(1)}32%%{transform:scaleY(-1.04)}40%%{transform:scaleY(-.98)}66%%{transform:scaleY(-1)}92%%{transform:scaleY(1.04)}100%%{transform:scaleY(1)}}'
      '@keyframes poBump{0%%{transform:scaleY(1)}40%%{transform:scaleY(.94)}100%%{transform:scaleY(1)}}'
      '#opening.op-rm *{animation:none!important}</style>'
      '<div id="opening" translate="no" aria-hidden="true"><svg class="po-svg" viewBox="195 300 880 560" aria-hidden="true"><g fill="#fff">'
      '<path class="po-l po-l1" d="%s"/><path class="po-l po-l2" d="%s"/><path class="po-l po-l3" d="%s"/>'
      '<g class="po-d"><path d="%s" fill="#3d0010"/><path class="po-body" d="%s"/><g class="po-flap"><path fill-rule="evenodd" d="%s"/></g></g>'
      '<path class="po-tag" d="%s"/></g></svg><div class="po-sup">supported by VIM</div></div>') % (
      BRAND, (x0 + xm) / 2, y0 + P["D"][3] / 2, (x0 + xm) / 2, y0, (x0 + xm) / 2, y0 + P["D"][3], P["LET"][0], P["LET"][1], P["LET"][2], P["DIN"], P["DBODY"], P["DFLAP"], P["TAG"])
s = s[:a] + OP + s[b:]
s = s.replace('T=rm?600:3400', 'T=rm?600:3600', 1)
s = s.replace('<meta name="theme-color" content="#141414">', '<meta name="theme-color" content="%s">' % BRAND)
s = s.replace('try{seen=sessionStorage.getItem("vim-op")==="1";sessionStorage.setItem("vim-op","1")}', 'try{seen=sessionStorage.getItem("poad-op")==="1";sessionStorage.setItem("poad-op","1")}', 1)
# 5) 追加分
cat = json.load(open(os.path.join(E, "catalog.json"), encoding="utf-8"))
add = '<style>' + open(os.path.join(E, "muji.css"), encoding="utf-8").read() + '</style><script>window.MUJI_CATALOG=' + json.dumps(cat, ensure_ascii=False, separators=(",", ":")) + ';window.MUJI_CATALOG_AT="2026年10月7日";</script><script>' + open(os.path.join(E, "mujim.js"), encoding="utf-8").read() + '</script><script>' + open(os.path.join(E, "muji.js"), encoding="utf-8").read() + '</script>'
s = s.rstrip() + "\n" + add + "\n"
sys.path.insert(0, E)
from guard import guard
s, _ng = guard(s); print("guarded", _ng)
# VIM 本体のHTMLの閉じタグが1つ多く、3D の設定（写真のように仕上げる・照明・色・素材・表示設定）が全ページに出ていたのを直す
bad = '<button id="ppr">ここを戻す</button><button id="ppa">すべて戻す</button></div></div></div></div></div>'
if bad in s: s = s.replace(bad, '<button id="ppr">ここを戻す</button><button id="ppa">すべて戻す</button></div></div></div></div>', 1); print("fixed v3 div")
open(sys.argv[1], "w", encoding="utf-8").write(s)
import shutil; shutil.copy(os.path.join(ROOT, "bimini-pt.js"), os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "bimini-pt.js"))
# カーテン見積（同じフォルダの curtain.html として一緒に公開し、アプリの中で開く）
sys.path.insert(0, os.path.join(E, "curtain"))
from build_curtain import build as build_curtain
open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "curtain.html"), "w", encoding="utf-8").write(build_curtain(embed=True))
# 素材知識（同じフォルダの knowledge.html として一緒に公開する）
sys.path.insert(0, os.path.join(E, "knowledge"))
from build_knowledge import build as build_knowledge
open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "knowledge.html"), "w", encoding="utf-8").write(build_knowledge())
# アイコンは poad/make_poad.py が poad/poad-icon.svg に書き出す
print("ok", len(s.encode()) // 1024, "KB,", len(cat), "items")
