"""idea のロゴを作る：python3 make_idea.py
「i」は光を放つ懐中電灯（上が広く、くびれてから下へ）、上に3本の光。「dea」は Poppins Bold の輪郭。
座標は VIM のロゴと同じ枠（文字だけ：viewBox 235 455 775 275）に収める。
出力：idea.json（画面・見積書・アイコン・オープニングで使う部品）と idea-icon.svg"""
import json, math, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
H_ = os.path.dirname(os.path.abspath(__file__))
FONT = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
BRAND = "#70021a"   # ロゴ画像の地色

def glyph(ch, size, x, base):
    f = TTFont(FONT); gs = f.getGlyphSet(); g = gs[f.getBestCmap()[ord(ch)]]
    pen = SVGPathPen(gs); g.draw(TransformPen(pen, (size / 1000, 0, 0, -size / 1000, x, base))); return pen.getCommands(), g.width * size / 1000

def f1(v): return ('%.1f' % v).rstrip('0').rstrip('.')

# --- 大きさ：「d」の高さ 172、ベースライン 727。元の画像の座標を k 倍して写す ---
BASE = 727.0; DH = 172.0; size = DH / 0.740; k = DH / 250.0
TRACK = -0.035 * size
# 「dea」の幅（字間を詰める）
_, wd = glyph('d', size, 0, 0); _, we = glyph('e', size, 0, 0); _, wa = glyph('a', size, 0, 0)
I_HALF = 64 * k            # 「i」の上の広がりの半分
GAP = 10 * k
dea_w = wd + we + wa + 2 * TRACK - (62 + 0) * size / 1000   # 最後の a の右の余白は除く
total = 2 * I_HALF + GAP + dea_w - 28 * size / 1000
X0 = 235 + (775 - total) / 2
CX = X0 + I_HALF           # 「i」の中心
def T(x, y): return (CX + (x - 326) * k, BASE + (y - 785) * k)
def P(x, y): a, b = T(x, y); return f1(a) + ' ' + f1(b)
# 「i」：上の縁はゆるい山なり、くびれてから下へ少し広がり、下の角は丸い（元画像の座標で描く）
I = ('M' + P(270, 534) + ' Q' + P(326, 515) + ' ' + P(382, 534) + ' Q' + P(392, 537) + ' ' + P(389, 548) +
     ' L' + P(359, 636) + ' L' + P(371, 772) + ' Q' + P(373, 792) + ' ' + P(354, 792) +
     ' L' + P(302, 792) + ' Q' + P(283, 792) + ' ' + P(285, 772) +
     ' L' + P(295, 636) + ' L' + P(263, 548) + ' Q' + P(260, 537) + ' ' + P(270, 534) + 'Z')
# 光：角の丸い棒 3 本
def capsule(x1, y1, x2, y2, w, n=10):
    (a1, b1), (a2, b2) = T(x1, y1), T(x2, y2); r = w * k / 2
    ang = math.atan2(b2 - b1, a2 - a1); pts = []
    for i in range(n + 1):   # 先の端：進む向きを中心に半円
        t = ang - math.pi / 2 + math.pi * i / n; pts.append((a2 + r * math.cos(t), b2 + r * math.sin(t)))
    for i in range(n + 1):   # 根もとの端
        t = ang + math.pi / 2 + math.pi * i / n; pts.append((a1 + r * math.cos(t), b1 + r * math.sin(t)))
    return 'M' + ' L'.join(f1(x) + ' ' + f1(y) for x, y in pts) + 'Z'
RAYS = [capsule(244, 440, 278, 494, 25), capsule(329, 413, 329, 486, 26), capsule(414, 440, 380, 494, 25)]
# 「dea」
x = CX + I_HALF + GAP - 28 * size / 1000; DEA = []
for ch in 'dea':
    d, w = glyph(ch, size, x, BASE); DEA.append(d); x += w + TRACK
WORD = '<path d="%s"/>' % I + ''.join('<path d="%s"/>' % r for r in RAYS) + ''.join('<path d="%s"/>' % d for d in DEA)
top = T(329, 413)[1] - 13 * k
out = dict(I=I, RAYS=RAYS, DEA=DEA, WORD=WORD, ITOP=[round(CX, 1), round(T(0, 545)[1], 1)], RAYTOP=round(top, 1), BASE=BASE, BRAND=BRAND)
json.dump(out, open(os.path.join(H_, 'idea.json'), 'w'))
icon = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254"><rect width="1254" height="1254" fill="%s"/>'
        '<g fill="#fff" transform="translate(627 627) scale(1.6) translate(-622 -%s)">%s</g></svg>') % (BRAND, f1((top + BASE) / 2), WORD)
open(os.path.join(H_, 'idea-icon.svg'), 'w').write(icon)
print('ok width', round(total), 'height', round(BASE - top))
