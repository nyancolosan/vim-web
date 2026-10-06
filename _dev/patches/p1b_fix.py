"""p1b: 保存タブを下のバーに出す、旧「使う人」による初期表示をやめる、家具追加ボタンの強弱。"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)
rep('#t4,#t6{display:none!important}', '#t6{display:none!important}')
rep('try{document.body.classList.add(localStorage.getItem("bimini-role")==="biz"?"biz":"gen")}catch(e){document.body.classList.add("gen")}',
    'try{document.body.classList.add(localStorage.getItem("bimini-tier")==="pro"?"biz":"gen")}catch(e){document.body.classList.add("gen")}')
rep('.tuban{margin-top:0}', '.tuban{margin-top:0}\n.addbox #add{background:var(--card)!important;color:var(--ink)!important;border:1.5px solid var(--line)!important;margin:10px 0 0!important;box-shadow:none!important}')
open(P, "w", encoding="utf-8").write(s); print("p1b OK")
