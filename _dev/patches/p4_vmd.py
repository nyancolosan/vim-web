"""p4: vmd 用の什器テンプレート、利用状況をページを閉じるときにも送る。"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)
rep('var NEWT=[\n',
    'var NEWT=[\n'
    ' {g:"什器",name:"平台A",w:1800,d:900,h:700,fs:"table",tt:"m",tex:"oak"},\n'
    ' {g:"什器",name:"平台B（低め）",w:1200,d:900,h:450,fs:"table",tt:"l",tex:"oak"},\n'
    ' {g:"什器",name:"ネストテーブル",w:900,d:600,h:600,fs:"table",tt:"b",tex:"beech"},\n'
    ' {g:"什器",name:"ゴンドラ什器",w:900,d:450,h:1500,fs:"shelf",st:"u",tiers:4,col:"#e4e4e2"},\n'
    ' {g:"什器",name:"壁面棚",w:1800,d:400,h:2100,fs:"shelf",st:"x",tiers:5,tex:"oak"},\n'
    ' {g:"什器",name:"レジカウンター",w:1500,d:600,h:1000,fs:"b",col:"#d9d4c8"},\n')
rep('document.addEventListener("visibilitychange",function(){if(document.hidden)evFlush()});',
    'document.addEventListener("visibilitychange",function(){if(document.hidden)evFlush()});window.addEventListener("pagehide",evFlush);')
open(P,"w",encoding="utf-8").write(s);print("p4 OK")
