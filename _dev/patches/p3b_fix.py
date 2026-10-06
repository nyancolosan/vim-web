"""p3b: 同期を始めたら今の内容をすぐクラウドへ、復元コードのある端末でははじめの画面を出さない、計測名の重複を解消。"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)
rep('else pjWhere();try{ev("cloud_on")}catch(e){}})}', 'else pjWhere();if(hasContent())cloudAuto();try{ev("cloud_on")}catch(e){}})}')
rep('if(!started&&!hasContent()&&!/^#b=/.test(location.hash||""))setTimeout(stmOpen,300)',
    'if(!started&&!hasContent()&&!/^#b=/.test(location.hash||"")&&!(typeof billLid==="function"&&billLid(false)))setTimeout(stmOpen,300)')
rep('try{ev("plan_open",{need:t||""})}catch(e){}', 'try{ev("pricing_open",{need:t||""})}catch(e){}')
rep('try{ev("paywall",{need:t,why:msg})}catch(e){}', 'try{ev("paywall",{need:t,why:String(msg).slice(0,24)})}catch(e){}')
open(P,"w",encoding="utf-8").write(s);print("p3b OK")
