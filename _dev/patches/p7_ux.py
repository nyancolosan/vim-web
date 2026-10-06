"""p7: 操作をより直感的に。
- 戻す／やり直しを画面下の浮いたボタンから、ヘッダーへ（内容に重ならない）
- 3Dの視点ボタンは「全体・真上・歩く」だけを出し、ほかは「その他」にまとめる
- 3Dの操作説明は最初の3回だけ表示
- 置いた家具の説明を短く"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)

rep('<div class="icobar" id="vb"><button id="cvb" class="ib biz-only" data-ic="person">お客さま表示</button><button id="v3all" class="ib" data-ic="iso">全体</button><button data-v="1" class="ib" data-ic="top">真上</button><button data-v="2" class="ib" data-ic="front">正面</button><button data-v="3" class="ib" data-ic="side">右から</button><button data-v="0" class="ib" data-ic="cube">斜め</button><i class="vsep"></i><button id="vwk" class="ib" data-ic="person">歩く</button><button id="zi" class="ib" data-ic="zin">拡大</button><button id="zo" class="ib" data-ic="zout">縮小</button><button id="vws0" class="ib" data-ic="cam">視点を保存</button><button id="sv3" class="ib" data-ic="image" hidden>画像保存</button></div>',
    '<div class="icobar" id="vb"><button id="v3all" class="ib" data-ic="iso">全体</button><button data-v="1" class="ib" data-ic="top">真上</button><button id="vwk" class="ib" data-ic="person">歩く</button><button id="cvb" class="ib biz-only" data-ic="person">お客さま表示</button><button id="vmore" class="ib" data-ic="grid" aria-expanded="false">その他</button>'
    '<i class="vsep vx"></i><button data-v="2" class="ib vx" data-ic="front">正面</button><button data-v="3" class="ib vx" data-ic="side">右から</button><button data-v="0" class="ib vx" data-ic="cube">斜め</button><button id="zi" class="ib vx" data-ic="zin">拡大</button><button id="zo" class="ib vx" data-ic="zout">縮小</button><button id="vws0" class="ib vx" data-ic="cam">視点を保存</button><button id="sv3" class="ib vx" data-ic="image" hidden>画像保存</button></div>')
rep('<p class="lead hint">1本指で回す・2本指で拡大／移動・家具をタップで選択（そのままドラッグで移動）・ダブルタップで寄る</p>',
    '<p class="lead hint" id="hint3">1本指で回す・2本指で拡大／移動・家具をタップで選んでドラッグで移動</p>')
rep('<div class="sect" id="chipst">置いた家具<small>押すと、もう1つ部屋の中央に置きます（右下＝置いた数／数量）</small></div>',
    '<div class="sect" id="chipst">置いた家具<small>タップでもう1つ置けます</small></div>')
rep('<button id="undo" aria-label="元に戻す" disabled>↶ 戻す</button><button id="redo" aria-label="やり直す" disabled>↷</button>',
    '<button id="undo" aria-label="元に戻す" title="元に戻す" disabled>↶</button><button id="redo" aria-label="やり直す" title="やり直す" disabled>↷</button>')
rep('#ur button:disabled{opacity:.35}',
    '#ur button:disabled{opacity:.35}\n'
    'h1 #ur{position:static;display:flex;gap:4px;margin-right:6px;box-shadow:none}\n'
    'h1 #ur button{min-width:36px;min-height:34px;padding:0 8px;border:1.5px solid rgba(255,255,255,.5);background:transparent;color:var(--headink);box-shadow:none;font-size:1.05rem;line-height:1;border-radius:999px}\n'
    'h1 #ur button:disabled{opacity:.3}\n'
    '#vb:not(.open) .vx{display:none!important}#vmore[aria-expanded="true"]{background:var(--acc);color:var(--accink)}')
rep('/* 起動時は「部屋」を開く */',
    '/* 戻す・やり直しはヘッダーに置く／3Dの「その他」／3Dの操作説明は最初の3回だけ */\n'
    '(function(){var ur=document.getElementById("ur"),hb=document.querySelector("h1 .hbt");if(ur&&hb)hb.insertBefore(ur,hb.firstChild);\n'
    ' var vm=document.getElementById("vmore"),vb=document.getElementById("vb");if(vm)vm.onclick=function(){var o=!vb.classList.contains("open");vb.classList.toggle("open",o);vm.setAttribute("aria-expanded",String(o))};\n'
    ' var n=0;try{n=+localStorage.getItem("bimini-hint3")||0}catch(e){}var h=document.getElementById("hint3");if(h&&n>=3)h.hidden=true;\n'
    ' var _t=tab;tab=function(k){_t(k);if(k===3&&h&&!h.hidden){try{localStorage.setItem("bimini-hint3",String(++n))}catch(e){}if(n>3)h.hidden=true}}})();\n'
    '/* 起動時は「部屋」を開く */')
open(P, "w", encoding="utf-8").write(s); print("p7 OK")
