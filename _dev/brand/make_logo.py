"""VIM ロゴ（2026-10 版：I がペンダントライトのワードマーク）を SVG で作る：python3 _dev/brand/make_logo.py
参考の絵：vim-reference-2.png。下の英字（visual × interior × modeling）は Poppins Bold を輪郭にしたもの。"""
import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
B=os.path.dirname(os.path.abspath(__file__))
# ---- 文字 V・M とライト（座標は 1254 角の参考画像に合わせる）
V='M241 487Q238 478 248 478H344Q352 478 355 486L381 572L407 486Q410 478 418 478H514Q524 478 521 487L421 712Q418 720 409 720H353Q344 720 341 712Z'
M='M710 486Q710 478 718 478H792Q800 478 805 485L860 563L915 485Q920 478 928 478H1002Q1010 478 1010 486V712Q1010 720 1002 720H940Q932 720 932 712V612L873 687Q867 694 860 694Q853 694 847 687L788 612V712Q788 720 780 720H718Q710 720 710 712Z'
LAMP='M579 465H592V596H598V612L668 700Q674 712 662 712H508Q496 712 502 700L572 612V596H579Z'
WORD='<path d="%s"/><path d="%s"/><path d="%s"/>'%(V,LAMP,M)
# ---- 下の英字を輪郭に
f=TTFont('/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf');gs=f.getGlyphSet();cmap=f.getBestCmap();upm=f['head'].unitsPerEm
def textpath(t,x0,base,size,track=0):
    s=size/upm;x=x0;out=[]
    for ch in t:
        gn=cmap.get(ord(ch));
        if not gn: continue
        pen=SVGPathPen(gs);g=gs[gn];g.draw(TransformPen(pen,(s,0,0,-s,x,base)));d=pen.getCommands()
        if d: out.append(d)
        x+=g.width*s+track
    return ' '.join(out),x-x0-track
txt="visual × interior × modeling"
_,w=textpath(txt,0,0,72)
size=72*(1055-215)/w;TAG,_=textpath(txt,215,812,size)
open(os.path.join(B,'vim-word.svg'),'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="230 455 790 275"><g fill="#fff">'+WORD+'</g></svg>')
open(os.path.join(B,'vim-logo.svg'),'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="200 440 870 410"><g fill="#fff">'+WORD+'<path d="'+TAG+'"/></g></svg>')
open(os.path.join(B,'vim-parts.json'),'w').write(__import__('json').dumps({"V":V,"M":M,"LAMP":LAMP,"TAG":TAG}))
icon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254" width="1024" height="1024"><rect width="1254" height="1254" fill="#0a0a0a"/><g fill="#fff" transform="translate(627 640) scale(1.08) translate(-635 -645)">'+WORD+'<path d="'+TAG+'"/></g></svg>'
open(os.path.join(B,'icon.svg'),'w').write(icon)
print("ok",round(size,1))
