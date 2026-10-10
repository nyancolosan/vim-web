"""idea（旧 POAD / MUJI Store Assistant / VIM for MUJI staff。Claude 上で動くページ）を組み立てる：python3 _dev/editions/muji/build_muji.py 出力先.html
VIM 本体（index.html）をもとに、ロゴ・オープニング・テーマ・選択画面・無印良品の商品検索・オーダーカーテン見積・素材図鑑を重ねる。VIM 本体は変えない。"""
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
s = s.replace('<title>VIM Beta</title>', '<title>MUJI STORE app</title>', 1)
s = s.replace('<div class="betatag" aria-hidden="true">BETA</div>', '', 1)
s = s.replace('<meta name="apple-mobile-web-app-title" content="VIM"><meta name="application-name" content="VIM">', '<meta name="apple-mobile-web-app-title" content="MUJI STORE app"><meta name="application-name" content="MUJI STORE app">', 1)
s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="MUJI STORE app：無印良品の店舗スタッフ向け。H&B・住空間（部屋に家具を置く・オーダーカーテンの見積り）・素材図鑑">', s, count=1)
s = s.replace('aria-label="VIM visual × interior × modeling"', 'aria-label="MUJI STORE app"')
WORD_TXT = ('<text x="622" y="618" text-anchor="middle" font-family="Helvetica Neue,Arial,Hiragino Sans,sans-serif" font-weight="800" font-size="150" textLength="740" lengthAdjust="spacingAndGlyphs">MUJI STORE</text>'
            '<text x="622" y="708" text-anchor="middle" font-family="Helvetica Neue,Arial,Hiragino Sans,sans-serif" font-weight="700" font-size="86" textLength="250" lengthAdjust="spacingAndGlyphs">app</text>')
# 2) ロゴ（仮：テキスト。ロゴが決まったら差し替える）（画面・見積書・PDF で使う VIM_W を差し替え、下の英字 VIM_T はなし。枠は VIM と同じ）
s, n = re.subn(r"VIM_W='[^']*'", lambda m: "VIM_W='%s'" % WORD_TXT, s, count=1); assert n == 1
s, n = re.subn(r"VIM_T='<path fill-rule=\"evenodd\" d=\"[^\"]*\"/>'", "VIM_T=''", s, count=1); assert n == 1
# 3) オープニング：暗がりで懐中電灯の「i」が立ち上がり、カチッと光が3本はじけて「dea」が照らされる
a = s.index('<div id="opening"'); b = s.index('<script>(function(){var o=document.getElementById("opening")', a)
OP = ('<style>#opening{background:%s!important}'
      '#opening .id-tx{display:flex;flex-direction:column;align-items:center;gap:6px;color:#fff;font-family:"Helvetica Neue",Arial,"Hiragino Sans",sans-serif;animation:idFade .8s cubic-bezier(.2,.8,.2,1) .1s both}'
      '#opening .id-tx b{font-size:clamp(30px,9vw,52px);font-weight:800;letter-spacing:.06em;line-height:1.1}'
      '#opening .id-tx span{font-size:clamp(18px,5.4vw,28px);font-weight:700;letter-spacing:.18em}'
      '#opening .id-sup{position:absolute;left:0;right:0;bottom:calc(22px + env(safe-area-inset-bottom,0px));text-align:center;color:#fff;font:600 11px/1 Poppins,"Hiragino Sans",system-ui,sans-serif;letter-spacing:.14em;opacity:.8}'
      '@keyframes idFade{from{opacity:0;transform:translateY(8px)}}'
      '#opening.op-rm *{animation:none!important;opacity:1!important}</style>'
      '<div id="opening" translate="no" aria-hidden="true"><div class="id-tx"><b>MUJI STORE</b><span>app</span></div><div class="id-sup">supported by VIM</div></div>') % BRAND
s = s[:a] + OP + s[b:]
s = s.replace('it.f4?(F4OPT[it.f4]||[])', 'it.f4?((typeof F4OPT!=="undefined"&&F4OPT||{})[it.f4]||[])', 1)
s = s.replace('T=rm?600:3400', 'T=rm?600:3100', 1)
s = s.replace('<meta name="theme-color" content="#141414">', '<meta name="theme-color" content="%s">' % BRAND)
s = s.replace('try{seen=sessionStorage.getItem("vim-op")==="1";sessionStorage.setItem("vim-op","1")}', 'try{seen=sessionStorage.getItem("idea-op")==="1";sessionStorage.setItem("idea-op","1")}', 1)
# 5) 追加分
cat = json.load(open(os.path.join(E, "catalog.json"), encoding="utf-8"))
add = '<style>' + open(os.path.join(E, "muji.css"), encoding="utf-8").read() + open(os.path.join(E, "ia", "ia.css"), encoding="utf-8").read() + '</style><script>window.MUJI_CATALOG=' + json.dumps(cat, ensure_ascii=False, separators=(",", ":")) + ';window.MUJI_CATALOG_AT="2026年10月8日";window.IDEA_NEWS=' + json.dumps(json.load(open(os.path.join(E, "news", "news.json"), encoding="utf-8")), ensure_ascii=False, separators=(",", ":")) + ';window.IDEA_TREND=' + json.dumps(json.load(open(os.path.join(E, "ia", "trend.json"), encoding="utf-8")), ensure_ascii=False, separators=(",", ":")) + ';window.IA_ITEMS=' + subprocess.run(["node", os.path.join(E, "ia", "build_items.cjs")], check=True, capture_output=True, text=True).stdout + ';</script><script>' + open(os.path.join(E, "mujim.js"), encoding="utf-8").read() + '</script><script>' + open(os.path.join(E, "muji.js"), encoding="utf-8").read() + '</script><script>' + open(os.path.join(E, "muji2.js"), encoding="utf-8").read() + '</script><script>' + open(os.path.join(E, "ia", "ia.js"), encoding="utf-8").read() + '</script>'
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
# 素材図鑑（同じフォルダの knowledge.html として一緒に公開する）
sys.path.insert(0, os.path.join(E, "knowledge"))
from build_knowledge import build as build_knowledge
open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "knowledge.html"), "w", encoding="utf-8").write(build_knowledge())
# H&B（同じフォルダの hb.html として一緒に公開する）
sys.path.insert(0, os.path.join(E, "hb"))
from build_hb import build as build_hb
open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "hb.html"), "w", encoding="utf-8").write(build_hb())
# IDEE（同じフォルダの idee.html として一緒に公開する）
sys.path.insert(0, os.path.join(E, "idee"))
from build_idee import build as build_idee
open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "idee.html"), "w", encoding="utf-8").write(build_idee())
# 衣服（モック。同じフォルダの clothing.html として一緒に公開する）
sys.path.insert(0, os.path.join(E, "clothing"))
from build_clothing import build as build_clothing
open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "clothing.html"), "w", encoding="utf-8").write(build_clothing())
# オーダー収納の見積り（同じフォルダの shelf.html として一緒に公開する）
sys.path.insert(0, os.path.join(E, "shelf"))
from build_shelf import build as build_shelf
open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "shelf.html"), "w", encoding="utf-8").write(build_shelf())
# アイコンは idea/make_idea.py が idea/idea-icon.svg に書き出す
print("ok", len(s.encode()) // 1024, "KB,", len(cat), "items")
# 店舗マップ（試験運用。同じフォルダの map.html として一緒に公開する）
sys.path.insert(0, os.path.join(E, "map"))
from build_map import build as build_map
open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "map.html"), "w", encoding="utf-8").write(build_map())
