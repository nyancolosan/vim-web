"""idea（旧 POAD / MUJI Store Assistant / VIM for MUJI staff。Claude 上で動くページ）を組み立てる：python3 _dev/editions/muji/build_muji.py 出力先.html
VIM 本体（index.html）をもとに、ロゴ・オープニング・テーマ・選択画面・無印良品の商品検索・オーダーカーテン見積・素材知識を重ねる。VIM 本体は変えない。"""
import json, os, re, subprocess, sys, tempfile
E = os.path.dirname(os.path.abspath(__file__)); D = os.path.dirname(os.path.dirname(E)); ROOT = os.path.dirname(D)
# 0) ロゴの部品（idea/make_idea.py で作る）
subprocess.run([sys.executable, os.path.join(E, "idea", "make_idea.py")], check=True, capture_output=True)
L = json.load(open(os.path.join(E, "idea", "idea.json")))
BRAND = L["BRAND"]   # アイコン・オープニングの地色（ロゴ画像と同じ）
# 1) VIM の Claude 版（ベータと同じ下ごしらえ）
tmp = os.path.join(tempfile.gettempdir(), "vim-base.html")
subprocess.run([sys.executable, os.path.join(D, "make_beta.py"), tmp], check=True, capture_output=True)
s = open(tmp, encoding="utf-8").read()
s = s.replace('<title>VIM Beta</title>', '<title>idea</title>', 1)
s = s.replace('<div class="betatag" aria-hidden="true">BETA</div>', '', 1)
s = s.replace('<meta name="apple-mobile-web-app-title" content="VIM"><meta name="application-name" content="VIM">', '<meta name="apple-mobile-web-app-title" content="idea"><meta name="application-name" content="idea">', 1)
s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="idea：無印良品の店舗スタッフ向け。部屋に家具を置く・オーダーカーテンの見積り・素材知識">', s, count=1)
s = s.replace('aria-label="VIM visual × interior × modeling"', 'aria-label="idea"')
# 2) ロゴを idea に（画面・見積書・PDF で使う VIM_W を差し替え、下の英字 VIM_T はなし。枠は VIM と同じ）
s, n = re.subn(r"VIM_W='[^']*'", lambda m: "VIM_W='%s'" % L["WORD"], s, count=1); assert n == 1
s, n = re.subn(r"VIM_T='<path fill-rule=\"evenodd\" d=\"[^\"]*\"/>'", "VIM_T=''", s, count=1); assert n == 1
# 3) オープニング：暗がりで懐中電灯の「i」が立ち上がり、カチッと光が3本はじけて「dea」が照らされる
a = s.index('<div id="opening"'); b = s.index('<script>(function(){var o=document.getElementById("opening")', a)
cx, ity = L["ITOP"]; ry = L["RAYTOP"]; base = L["BASE"]
OP = ('<style>#opening{background:%(B)s!important}'
      '#opening .id-svg{width:min(62vw,340px);height:auto;overflow:visible}'
      '#opening .id-sup{position:absolute;left:0;right:0;bottom:calc(22px + env(safe-area-inset-bottom,0px));text-align:center;color:#fff;font:600 11px/1 Poppins,"Hiragino Sans",system-ui,sans-serif;letter-spacing:.18em;animation:idFade .6s ease 2.1s both}'
      '#opening .id-i{animation:idRise .7s cubic-bezier(.2,.8,.2,1) .1s both,idClick .22s ease-in-out .95s both;transform-box:view-box;transform-origin:%(cx).1fpx %(base).1fpx}'
      '#opening .id-r{transform-box:view-box;transform-origin:%(cx).1fpx %(ity).1fpx;animation:idRay .45s cubic-bezier(.2,1.4,.4,1) both,idPulse .5s ease-in-out 1.85s}'
      '#opening .id-r1{animation-delay:1.05s,1.85s}#opening .id-r2{animation-delay:1.15s,1.9s}#opening .id-r3{animation-delay:1.25s,1.95s}'
      '#opening .id-glow{transform-box:view-box;transform-origin:%(cx).1fpx %(ity).1fpx;animation:idGlow 1.1s ease-out 1.0s both}'
      '#opening .id-l{opacity:.18;animation:idLit .5s ease both}#opening .id-l1{animation-delay:1.2s}#opening .id-l2{animation-delay:1.3s}#opening .id-l3{animation-delay:1.4s}'
      '@keyframes idRise{from{opacity:0;transform:translateY(60px)}}@keyframes idClick{50%%{transform:scaleY(.93)}}'
      '@keyframes idRay{from{opacity:0;transform:scale(.4)}}@keyframes idPulse{50%%{transform:scale(1.12)}}'
      '@keyframes idGlow{0%%{opacity:0;transform:scale(.3)}35%%{opacity:.9}100%%{opacity:0;transform:scale(1.6)}}'
      '@keyframes idLit{from{opacity:.18}to{opacity:1}}@keyframes idFade{from{opacity:0;transform:translateY(8px)}}'
      '#opening.op-rm *{animation:none!important;opacity:1!important}#opening.op-rm .id-glow{opacity:0!important}</style>'
      '<div id="opening" translate="no" aria-hidden="true"><svg class="id-svg" viewBox="320 360 605 420" aria-hidden="true">'
      '<defs><radialGradient id="idgl" gradientUnits="userSpaceOnUse" cx="%(cx).1f" cy="%(ity).1f" r="230"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".4" stop-color="#ffe9c4" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>'
      '<circle class="id-glow" cx="%(cx).1f" cy="%(ity).1f" r="230" fill="url(#idgl)"/><g fill="#fff">'
      '<path class="id-l id-l1" d="%(D0)s"/><path class="id-l id-l2" d="%(D1)s"/><path class="id-l id-l3" d="%(D2)s"/>'
      '<path class="id-r id-r1" d="%(R0)s"/><path class="id-r id-r2" d="%(R1)s"/><path class="id-r id-r3" d="%(R2)s"/>'
      '<path class="id-i" d="%(I)s"/></g></svg><div class="id-sup">supported by VIM</div></div>') % dict(
      B=BRAND, cx=cx, ity=ity, base=base, I=L["I"], D0=L["DEA"][0], D1=L["DEA"][1], D2=L["DEA"][2], R0=L["RAYS"][0], R1=L["RAYS"][1], R2=L["RAYS"][2])
s = s[:a] + OP + s[b:]
s = s.replace('T=rm?600:3400', 'T=rm?600:3100', 1)
s = s.replace('<meta name="theme-color" content="#141414">', '<meta name="theme-color" content="%s">' % BRAND)
s = s.replace('try{seen=sessionStorage.getItem("vim-op")==="1";sessionStorage.setItem("vim-op","1")}', 'try{seen=sessionStorage.getItem("idea-op")==="1";sessionStorage.setItem("idea-op","1")}', 1)
# 5) 追加分
cat = json.load(open(os.path.join(E, "catalog.json"), encoding="utf-8"))
add = '<style>' + open(os.path.join(E, "muji.css"), encoding="utf-8").read() + '</style><script>window.MUJI_CATALOG=' + json.dumps(cat, ensure_ascii=False, separators=(",", ":")) + ';window.MUJI_CATALOG_AT="2026年10月7日";window.IDEA_NEWS=' + json.dumps(json.load(open(os.path.join(E, "news", "news.json"), encoding="utf-8")), ensure_ascii=False, separators=(",", ":")) + ';</script><script>' + open(os.path.join(E, "mujim.js"), encoding="utf-8").read() + '</script><script>' + open(os.path.join(E, "muji.js"), encoding="utf-8").read() + '</script>'
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
# アイコンは idea/make_idea.py が idea/idea-icon.svg に書き出す
print("ok", len(s.encode()) // 1024, "KB,", len(cat), "items")
