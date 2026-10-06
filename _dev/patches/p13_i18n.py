"""p13: 言語（日本語・English・한국어）。辞書は src/i18nd.js（i18n_build.py で作る）、仕組みは src/i18n.js"""
import os
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=os.path.join(D,"furniture-catalog.html")
s=open(P,encoding="utf-8").read()
def R(a,b):
    global s
    assert s.count(a)==1,a[:80]; s=s.replace(a,b)
R('<script>\n','<script>\n/*@@BEGIN i18nd@@*/\n/*@@END i18nd@@*/\n/*@@BEGIN i18n@@*/\n/*@@END i18n@@*/\n')
LS='<div class="seg langseg" translate="no"><button data-lang="ja">日本語</button><button data-lang="en">English</button><button data-lang="ko">한국어</button></div>'
R('<div class="setg"><b>操作パッドの位置</b>','<div class="setg"><b translate="no">言語 / Language / 언어</b>'+LS+'</div>\n<div class="setg"><b>操作パッドの位置</b>')
R('<div class="seg rvseg" id="stmk">',LS.replace('class="seg langseg"','class="seg langseg stmlang"')+'<div class="seg rvseg" id="stmk">')
R('\n.seg button.on{background:var(--acc)','\n.stmlang{margin:0 0 12px}.stmlang button{min-height:34px;font-size:.8rem}\n.seg button.on{background:var(--acc)')
R('(r.it.name||"名称未入力")).slice(0,22),250,y+rh/2-14)','(r.it.name||"名称未入力")).slice(0,I18N.lang==="ja"?22:40),250,y+rh/2-14)')
open(P,"w",encoding="utf-8").write(s);print("ok")
