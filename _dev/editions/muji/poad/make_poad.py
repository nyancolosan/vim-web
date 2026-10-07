"""POAD（pocket advisor）のロゴを作る：python3 make_poad.py
P・O・A は Poppins Bold の輪郭、D はポケット（ふた・ボタン付き）として計算で描く。
座標は VIM のロゴと同じ枠（文字だけ：viewBox 235 455 775 275、英字つき：195 450 880 395）に収める。
出力：poad.json（画面・見積書・アイコン・オープニングで使う部品）"""
import json, math, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
H_ = os.path.dirname(os.path.abspath(__file__))
FD = '/usr/share/fonts/truetype/google-fonts/'

def glyphs(font, text, size, x0, base, track=0.0):
    f = TTFont(FD + font); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    sc = size / upm; x = x0; out = []
    for ch in text:
        g = gs[cmap[ord(ch)]]; pen = SVGPathPen(gs); g.draw(TransformPen(pen, (sc, 0, 0, -sc, x, base))); d = pen.getCommands()
        if d: out.append(d)
        x += g.width * sc + track * size
    return ' '.join(out), x - x0 - track * size

def f1(v): return ('%.1f' % v).rstrip('0').rstrip('.')
def poly(pts): return 'M' + ' L'.join(f1(x) + ' ' + f1(y) for x, y in pts) + 'Z'
def circle(cx, cy, r, n=48): return poly([(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)])

# --- 大きさ：4文字の幅が 743、高さ（キャップ）が H ---
CAP = 705 / 1000          # Poppins の大文字の高さ（em あたり）
H = 184.0; TOP = 455 + (275 - H) / 2; BASE = TOP + H
size = H / CAP
_, wPOA = glyphs('Poppins-Bold.ttf', 'POA', size, 0, 0, -0.01)
GAP = 0.07 * H; WD = 0.98 * H
total = wPOA + GAP + WD; X0 = 235 + (775 - total) / 2
POA, _ = glyphs('Poppins-Bold.ttf', 'POA', size, X0, BASE, -0.01)
# オープニングで1文字ずつ動かすため、P・O・A を別々にも持つ
LET = []; _x = X0
for _ch in 'POA':
    _d, _w = glyphs('Poppins-Bold.ttf', _ch, size, _x, BASE, 0); LET.append(_d); _x += _w - 0.01 * size

# --- D（ポケット）---
x0 = X0 + wPOA + GAP; y0 = TOP; y1 = BASE; r = H / 2; xc = x0 + WD - r; yc = (y0 + y1) / 2; xm = x0 + WD
cr = 0.05 * H   # 左の角の丸み
def top(x):
    if x < x0 + cr: return y0 + cr - math.sqrt(max(0, cr * cr - (x0 + cr - x) ** 2))
    if x <= xc: return y0
    return yc - math.sqrt(max(0, r * r - (x - xc) ** 2))
def bot(x): return 2 * yc - top(x)
# ふたの線（V）：左右の端から真ん中下へ。底は丸く
VL, VB = y0 + 0.17 * H, y0 + 0.46 * H; XB = x0 + 0.47 * WD; G = 0.075 * H
def vv(x):
    """ふたの線：左右の端から真ん中下へ直線で下り、底の近く（t<k）だけ放物線でなめらかにつなぐ"""
    t = (x - XB) / (xm - XB) if x >= XB else (XB - x) / (XB - x0)
    t = min(1, max(0, t)); k = 0.30; s = (VB - VL) / (1 - k / 2)   # 直線部の傾き（つながるように）
    return VB - s * t * t / (2 * k) if t <= k else VB - s * (k / 2) - s * (t - k)
xs = [x0 + (xm - x0) * i / 400 for i in range(401)]
def piece(lo, hi):
    up, dn = [], []
    for x in xs:
        a, b = lo(x), hi(x)
        if b - a > 0.2: up.append((x, a)); dn.append((x, b))
    return up + dn[::-1]
FLAP = piece(top, lambda x: min(vv(x) - G / 2, bot(x)))
BODY = piece(lambda x: max(vv(x) + G / 2, top(x)), bot)
INSIDE = piece(top, lambda x: min(vv(x), bot(x)))    # 開いたときに見えるポケットの中
# ボタン
BX, BY = x0 + 0.47 * WD, y0 + 0.285 * H; R1, R2, RD = 0.105 * H, 0.072 * H, 0.016 * H
btn = circle(BX, BY, R1) + circle(BX, BY, R2) + ''.join(circle(BX + dx * 0.026 * H, BY + dy * 0.026 * H, RD, 16) for dx in (-1, 1) for dy in (-1, 1))
dflap = poly(FLAP) + btn; dbody = poly(BODY); dinside = poly(INSIDE)
WORD = '<path d="%s"/><path fill-rule="evenodd" d="%s"/><path d="%s"/>' % (POA, dflap, dbody)
# 英字（pocket advisor）：字間を広めに、幅 560
txt = 'pocket advisor'; tr = 0.12
_, w1 = glyphs('Poppins-Medium.ttf', txt, 70, 0, 0, tr); ts = 70 * 560 / w1; _, w2 = glyphs('Poppins-Medium.ttf', txt, ts, 0, 0, tr)
TAG, _ = glyphs('Poppins-Medium.ttf', txt, ts, 622 - w2 / 2, 790, tr)
out = dict(LET=LET, POA=POA, DFLAP=dflap, DBODY=dbody, DIN=dinside, TAG=TAG, WORD=WORD,
           HINGE=[round(x0, 1), round(y0, 1), round(xm, 1)], BTN=[round(BX, 1), round(BY, 1)], D=[round(x0, 1), round(y0, 1), round(WD, 1), round(H, 1)])
json.dump(out, open(os.path.join(H_, 'poad.json'), 'w'))
icon = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254"><rect width="1254" height="1254" fill="#670215"/>'
        '<g fill="#fff" transform="translate(627 640) scale(1.12) translate(-622 -640)">%s<path d="%s"/></g></svg>') % (WORD, TAG)
open(os.path.join(H_, 'poad-icon.svg'), 'w').write(icon)
print('ok', round(total), 'x', H)
