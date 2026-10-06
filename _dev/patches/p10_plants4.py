"""p10: 観葉植物 v4（パキラ・エバーフレッシュ・モンステラ・フィカス）。Poly Haven の植物は外す。
中身は _dev/src/plants4.js（sync_src.py で差し込み）。"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)
# Poly Haven の植物を外し、新しい4種に
a = s.index(' {g:"観葉植物",name:"パキラ",kind:"p"')
b = s.index(' {g:"観葉植物",name:"アンスリウム"', a); b = s.index('\n', b) + 1
s = s[:a] + (' {g:"観葉植物",name:"フィカス",kind:"p",sp:"ficus",w:700,d:300,h:1500,pot:"grey"},\n'
             ' {g:"観葉植物",name:"パキラ",kind:"p",sp:"pachira",w:800,d:300,h:1600,pot:"white"},\n'
             ' {g:"観葉植物",name:"エバーフレッシュ",kind:"p",sp:"everfresh",w:850,d:300,h:1600,pot:"stone"},\n'
             ' {g:"観葉植物",name:"モンステラ",kind:"p",sp:"monstera",w:850,d:320,h:950,pot:"egg"},\n') + s[b:]
rep('var TPLF=["glb","col",', 'var TPLF=["sp","glb","col",')
# 目印（中身は sync_src.py で入る）
rep('function plant3d(sc,pc,it){\n',
    '/*@@BEGIN plants4@@*/\n/*@@END plants4@@*/\nfunction plant3d(sc,pc,it){\n'
    ' if(it.sp&&PL4.sp[it.sp]){var g4=plant4(it,pc.n+1);g4.position.set(pc.x/1000,0,pc.y/1000);g4.rotation.y=-(pc.r||0)*Math.PI/180;sc.add(g4);return}\n')
# 一覧のサムネイル
rep(' try{g=furnGroup({n:0,x:0,y:0,r:0},o);g.traverse(function(m){if(m.isLineSegments||m.isSprite)m.visible=false})}',
    ' try{g=o.sp&&PL4.sp[o.sp]?plant4(o,1):furnGroup({n:0,x:0,y:0,r:0},o);g.traverse(function(m){if(m.isLineSegments||m.isSprite)m.visible=false})}')
open(P, "w", encoding="utf-8").write(s); print("p10 OK")
