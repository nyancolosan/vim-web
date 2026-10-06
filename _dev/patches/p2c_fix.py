"""p2c: お客さま表示を全画面に、vmd の広さ表示を坪に。"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)
rep('var w=box.clientWidth||720,h=Math.round(w*.85);',
    'var w=box.clientWidth||720,h=document.body.classList.contains("cview")?(window.innerHeight||Math.round(w*.85)):Math.round(w*.85);')
rep('body.cview #cv3w{position:fixed;inset:0;z-index:50;background:#fff}',
    'body.cview #cv3w{position:fixed!important;inset:0;z-index:50;background:#fff}')
rep('el.textContent="寸法はmm（壁の内側）　約"+(ar/1.62).toFixed(1)+"畳（"+ar.toFixed(2)+"㎡）"',
    'el.textContent=store()?"寸法はmm　約"+(ar/3.305785).toFixed(1)+"坪（"+ar.toFixed(2)+"㎡）":"寸法はmm（壁の内側）　約"+(ar/1.62).toFixed(1)+"畳（"+ar.toFixed(2)+"㎡）"')
open(P,"w",encoding="utf-8").write(s);print("p2c OK")
