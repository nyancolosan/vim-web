"""p5b: 光の配分を決定（やわらかい補助光＋はっきりした主光、映り込みは控えめ）。扉の標準色を落ち着いた色に。"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)
rep('R3REAL?0xcfc6b8:0xb8b0a5,R3REAL?1.05:.75));', 'R3REAL?0xcfc6b8:0xb8b0a5,R3REAL?.4:.75));')
rep('var dl=new THREE.DirectionalLight(R3REAL?sunC:0xffffff,R3REAL?1.9:.8),', 'var dl=new THREE.DirectionalLight(R3REAL?sunC:0xffffff,R3REAL?2.8:.8),')
rep('function expo(){return(+plan.lb||1)*(R3REAL?1.05:1)}', 'function expo(){return(+plan.lb||1)*(R3REAL?.92:1)}')
rep('m.needsUpdate=true})})}', 'if(m.envMapIntensity!==undefined&&!m.userData.keep)m.envMapIntensity*=.45;m.needsUpdate=true})})}')
open(P,"w",encoding="utf-8").write(s);print("p5b OK")
