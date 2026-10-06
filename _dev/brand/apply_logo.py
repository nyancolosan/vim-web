"""ロゴ部品（brand/vim-parts.json：V・LAMP・M・TAG）を、アプリ・管理画面・アイコン・オープニングに反映する。
python3 _dev/brand/apply_logo.py → python3 _dev/sync_src.py → python3 _dev/build.py 版 → python3 _dev/brand/render_icons.py"""
import json, os, re
B = os.path.dirname(os.path.abspath(__file__)); D = os.path.dirname(B); ROOT = os.path.dirname(D)
P = json.load(open(os.path.join(B, 'vim-parts.json')))
V, L, M, T = P['V'], P['LAMP'], P['M'], P['TAG']
WORD = '<path d="%s"/><path d="%s"/><path d="%s"/>' % (V, L, M)
TAG = '<path fill-rule="evenodd" d="%s"/>' % T
WB, LB = "235 455 775 275", "195 450 880 395"   # 文字だけ／英字つき の表示範囲
# 1) ロゴの SVG ファイル
open(os.path.join(B, 'vim-word.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s"><g fill="#fff">%s</g></svg>' % (WB, WORD))
open(os.path.join(B, 'vim-logo.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s"><g fill="#fff">%s%s</g></svg>' % (LB, WORD, TAG))
open(os.path.join(B, 'icon.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254" width="1024" height="1024"><rect width="1254" height="1254" fill="#0a0a0a"/><g fill="#fff" transform="translate(627 640) scale(1.08) translate(-635 -645)">%s%s</g></svg>' % (WORD, TAG))
# 2) アプリ内のロゴ（src/vim.js）
wb = [int(x) for x in WB.split()]; lb = [int(x) for x in LB.split()]
js = open(os.path.join(D, 'src', 'vim.js'), encoding='utf-8').read()
js = re.sub(r"var VIMG=\{\},VIM_W='.*?',VIM_T='.*?';", lambda m: "var VIMG={},VIM_W='%s',VIM_T='%s';" % (WORD, TAG), js, count=1, flags=re.S)
js = re.sub(r'viewBox="\d+ \d+ \d+ \d+" aria-hidden="true"><g fill="\'\+\(c\|\|"currentColor"\)\+\'">\'\+VIM_W\+\'</g>', 'viewBox="%s" aria-hidden="true"><g fill="\'+(c||"currentColor")+\'">\'+VIM_W+\'</g>' % WB, js, count=1)
js = re.sub(r'viewBox="\d+ \d+ \d+ \d+" aria-hidden="true"><g fill="\'\+\(c\|\|"currentColor"\)\+\'">\'\+VIM_W\+VIM_T', 'viewBox="%s" aria-hidden="true"><g fill="\'+(c||"currentColor")+\'">\'+VIM_W+VIM_T' % LB, js, count=1)
js = re.sub(r'var VIMB=\{w:\[[^\]]*\],l:\[[^\]]*\]\};', 'var VIMB={w:[%s],l:[%s]};' % (','.join(map(str, wb)), ','.join(map(str, lb))), js, count=1)
open(os.path.join(D, 'src', 'vim.js'), 'w', encoding='utf-8').write(js)
# 3) 管理画面のヘッダー
ad = os.path.join(ROOT, 'admin.html'); s = open(ad, encoding='utf-8').read()
s = re.sub(r'<header><svg viewBox="[^"]*" aria-hidden="true" style="height:22px"><g fill="#fff">.*?</g></svg>', lambda m: '<header><svg viewBox="%s" aria-hidden="true" style="height:22px"><g fill="#fff">%s</g></svg>' % (WB, WORD), s, count=1, flags=re.S)
open(ad, 'w', encoding='utf-8').write(s)
# 4) オープニング（ライトの付け根と傘の位置は部品から求める）
nums = [float(x) for x in re.findall(r'-?\d+\.?\d*', L)]; xs, ys = nums[0::2], nums[1::2]
top = min(ys); bot = max(ys); cx = round((min(xs) + max(xs)) / 2, 1); x0 = min(xs); x1 = max(xs)
PV = "%s %s" % (cx, top)
rot = ';'.join(a + ' ' + PV for a in ['0', '-52', '44', '-32', '21', '-11', '5', '0'])
kt = '0;.15;.32;.48;.63;.77;.9;1'; ks = ';'.join(['.4 0 .6 1'] * 7)
swing = '<animateTransform attributeName="transform" type="rotate" values="%s" keyTimes="%s" calcMode="spline" keySplines="%s" begin="0.75s" dur="2.1s" fill="freeze"/>' % (rot, kt, ks)
drop = '<animateTransform attributeName="transform" type="translate" values="0 -560;0 18;0 0" keyTimes="0;.75;1" calcMode="spline" keySplines=".3 0 .6 1;.4 0 .6 1" dur="0.75s" fill="freeze"/>'
on = '<animate attributeName="opacity" values="0;1;.6;1" keyTimes="0;.4;.6;1" begin="0.72s" dur="0.3s" fill="freeze"/>'
CONE = 'M%s %s L%s %s L%s 1700 L%s 1700 Z' % (x0 + 6, bot - 8, x1 - 6, bot - 8, cx + 1420, cx - 1420)
svg = ('<svg viewBox="195 380 880 480" aria-hidden="true"><defs>'
 '<radialGradient id="opbm" gradientUnits="userSpaceOnUse" cx="%s" cy="%s" r="760"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
 '<radialGradient id="opbg" gradientUnits="userSpaceOnUse" cx="%s" cy="%s" r="620"><stop offset="0" stop-color="#fff1cf" stop-opacity=".42"/><stop offset="1" stop-color="#fff1cf" stop-opacity="0"/></radialGradient>'
 '<mask id="opmask" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000"><g>%s<g>%s<path d="%s" fill="url(#opbm)" opacity="0">%s</path></g></g></mask></defs>'
 '<g class="op-dim" fill="#1b1b1b"><path d="%s"/><path d="%s"/></g>'
 '<g class="op-lit" fill="#fff" mask="url(#opmask)"><path d="%s"/><path d="%s"/></g>'
 '<g class="op-full" fill="#fff"><path d="%s"/><path d="%s"/></g>'
 '<g>%s<g>%s<g class="op-beam"><path d="%s" fill="url(#opbg)" opacity="0">%s</path></g><path d="%s" fill="#fff"/></g></g>'
 '<path class="op-t" fill-rule="evenodd" d="%s" fill="#fff"/></svg>') % (cx, bot - 8, cx, bot - 8, drop, swing, CONE, on, V, M, V, M, V, M, drop, swing, CONE, on, L, T)
cat = os.path.join(D, 'furniture-catalog.html'); s = open(cat, encoding='utf-8').read()
a = s.index('<div id="opening" translate="no" aria-hidden="true">') + len('<div id="opening" translate="no" aria-hidden="true">'); b = s.index('</div>', a)
s = s[:a] + svg + s[b:]
open(cat, 'w', encoding='utf-8').write(s)
print("ok pivot", PV, "shade", x0, x1, bot)
