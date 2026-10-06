"""p1: room/vmd、部屋から始まる導線、色の無料化、設定の整理、プラン段階（free/plus/pro）。
_dev/furniture-catalog.html をその場で書き換えます。各置換は出現回数を確認します。"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()

def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n:
        sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)

# ---------- 設定パネル：使う人・テーマ・フォント・レイアウト・β表示を外す ----------
a = s.index('<div class="setg"><b>使う人</b>')
b = s.index('<small class="ver">')
s = s[:a] + (
    '<div class="setg biz-only"><b>お客さま表示のロック</b>'
    '<small class="lead" style="display:block;margin:2px 0 6px;font-size:.74rem">お客さま表示を閉じるときに、4桁のパスコードを求めます（店頭の端末向け）。</small>'
    '<div id="rolelock" class="row" style="margin-top:8px;align-items:flex-end" hidden><label style="flex:1 1 140px"><span id="rolepl">パスコード（4桁）</span>'
    '<input type="password" id="rolepin" inputmode="numeric" maxlength="4" autocomplete="off"></label><button id="rolepok">決定</button></div>'
    '<label class="ck" style="margin-top:6px"><input type="checkbox" id="rolelk"> パスコードを使う</label></div>\n'
    '<div class="setg"><b>使い方</b><div class="row"><button id="setgd" data-ic="help">使い方を見る</button><button id="setdemo" data-ic="plus">お試しデータで始める</button></div></div>\n'
) + s[b:]
rep('<small class="ver">かんたんBIM風 インテリア・売場プランナー　v76</small>',
    '<small class="ver">置ける？ 通れる？ いくら？ が、その場でわかる。<br>インテリア・売場プランナー　v76</small>')

# ---------- タブ：部屋・家具・保存・渡す（3Dは部屋の中で切り替え、使い方はヘッダー） ----------
rep('<div class="tabs"><button id="t1" class="on">カタログ</button><button id="t2">平面図</button><button id="t3">3D</button><button id="t4">保存</button><button id="t5">提案・共有</button><button id="t6">使い方</button></div>',
    '<div class="tabs"><button id="t2" class="on">部屋</button><button id="t1">家具</button><button id="t4">保存</button><button id="t5">渡す</button><button id="t3" hidden>3D</button><button id="t6" hidden>使い方</button></div>')
rep('<div id="v1">\n<p class="lead">家具を番号ごとに登録します。テンプレートを選ぶと形と寸法がすぐ入ります（自動で保存）。</p>',
    '<div id="v1" hidden>\n<p class="lead">部屋に置く家具の一覧です。サイズ・価格・数量を確かめたり、写真を付けたりできます（自動で保存）。</p>')
rep('<button class="add" id="add" data-ic="plus">空の番号を追加</button>\n<button id="tplb" class="tplbtn" data-ic="grid"><b class="lb">テンプレートから選ぶ</b><small>3Dの形を見ながら選べます</small></button>',
    '<button id="tplb" class="tplbtn" data-ic="grid"><b class="lb">家具を追加</b><small>3Dの形を見ながら選べます</small></button>\n<button class="add" id="add" data-ic="plus">自分で入力して追加</button>')

# ---------- 部屋（平面図） ----------
DD2 = '<div class="seg ddseg"><button data-dd="2" class="on">平面図</button><button data-dd="3">3D</button></div>\n'
DD3 = '<div class="seg ddseg"><button data-dd="2">平面図</button><button data-dd="3" class="on">3D</button></div>\n'
rep('<div id="v2" hidden>\n<details class="fold roomf" id="roomf"><summary><span>部屋の設定</span><small id="roomsum"></small></summary>\n<div class="seg biz-only"><button id="mroom" class="on">部屋仕様</button><button id="mstore">売場仕様</button></div>',
    '<div id="v2">\n' + DD2 + '<details class="fold roomf" id="roomf"><summary><span>広さ・形</span><small id="roomsum"></small></summary>\n'
    '<div class="seg rvseg"><button id="mroom" class="on">room<small>部屋</small></button><button id="mstore">vmd<small>売場</small></button></div>')
rep('<label style="flex:1 1 auto">広さテンプレート（接客用）<select id="rfmt" style="width:100%"><option value="">選ぶ…</option><option value="2700x3000">5畳（2700×3000）</option><option value="2700x3600">6畳（2700×3600）</option><option value="3150x3600">7畳（3150×3600）</option><option value="3600x3600">8畳（3600×3600）</option><option value="3600x4050">9畳（3600×4050）</option><option value="3600x4500">10畳（3600×4500）</option></select></label>',
    '<label style="flex:1 1 auto"><span id="rfmtl">広さから選ぶ</span><select id="rfmt" style="width:100%"></select></label>')
rep('<div class="sect">置く<small>押すと部屋の中央に置きます（右下＝置いた数／数量）</small></div>\n<div class="chips" id="chips"></div>',
    '<button id="plb" class="pri plb" data-ic="plus"><span class="lb">家具を置く</span></button>\n'
    '<div class="sect" id="chipst">置いた家具<small>押すと、もう1つ部屋の中央に置きます（右下＝置いた数／数量）</small></div>\n<div class="chips" id="chips"></div>')
rep('<p class="kbd">', '<p class="kbd pc-only">')

# ---------- 3D：切り替え・家具を置く・お客さま表示 ----------
rep('<div id="v3" hidden>\n<div class="icobar" id="vb">',
    '<div id="v3" hidden>\n' + DD3 + '<button id="plb3" class="pri plb" data-ic="plus"><span class="lb">家具を置く</span></button>\n'
    '<div class="icobar" id="vb"><button id="cvb" class="ib biz-only" data-ic="person">お客さま表示</button>')
rep('<div id="cv3w" style="position:relative"><div id="cv" style="width:100%;overflow:hidden;touch-action:none"></div>',
    '<div id="cv3w" style="position:relative"><div id="cv" style="width:100%;overflow:hidden;touch-action:none"></div><button id="cvx" class="cvx" hidden>閉じる</button>')

# 色・素材を無料に（パーツ単位の編集は有料のまま）
rep('<p class="lead std-only" style="margin:0 0 8px">色の変更・家具の素材はPRO仕様で使えます（画面上部の「PRO」）。</p>\n', '')
rep('<label style="width:120px" class="pro-only">壁の色', '<label style="width:120px">壁の色')
rep('<label style="width:90px" class="pro-only">扉の色', '<label style="width:90px">扉の色')
rep('<label style="width:90px" class="pro-only">床の色', '<label style="width:90px">床の色')
rep('<div class="sw pro-only" id="fsw"', '<div class="sw" id="fsw"')
rep('<div class="xcl pro-only" id="xcl"></div>\n<div id="clr" class="pro-only"></div>', '<div class="xcl" id="xcl"></div>\n<div id="clr"></div>')
rep('<label id="ccl" class="pro-only" style="width:70px">色', '<label id="ccl" style="width:70px">色')
rep('<input type="checkbox" id="lbl" checked> 番号ラベル', '<input type="checkbox" id="lbl"> 番号を表示')

# ---------- はじめの画面（どこをつくる？＋広さ） ----------
rep('<div id="tov" hidden>',
    '<div id="stm" class="mdl" hidden role="dialog" aria-modal="true" aria-labelledby="stmt"><div class="dbox m3box stmbox">\n'
    '<div class="m3h"><b id="stmt">どこをつくりますか？</b><button id="stmx" class="ib" data-ic="close" aria-label="閉じる">閉じる</button></div>\n'
    '<div class="seg rvseg" id="stmk"><button data-k="room" class="on">room<small>部屋</small></button><button data-k="vmd">vmd<small>売場</small></button></div>\n'
    '<div class="sect">広さを選ぶ</div><div class="stmg" id="stmg"></div>\n'
    '<p class="lead" style="font-size:.76rem;margin:10px 0 0">寸法や形は、あとから「広さ・形」で自由に変えられます。</p>\n'
    '</div></div>\n<div id="tov" hidden>')

# ---------- 使い方（新しい流れ） ----------
a = s.index('<ol class="tus">')
b = s.index('</ol>', a) + len('</ol>')
s = s[:a] + (
    '<ol class="tus">'
    '<li><span class="tun">1</span><div><b>広さを選ぶ</b><p>「新規」から room（部屋）か vmd（売場）を選び、畳や坪の広さをタップします。</p></div></li>'
    '<li><span class="tun">2</span><div><b>家具を置く</b><p>「家具を置く」から選ぶと、部屋の中央に置かれます。ドラッグで移動、「回転」で向きを変えます。狭い所は赤く表示できます。</p><button data-go="2">部屋を開く</button></div></li>'
    '<li><span class="tun">3</span><div><b>3Dで確かめる</b><p>上の「3D」に切り替えます。1本指で回転、2本指で拡大・移動。「立つ」「座る」で目線を変えられます。</p><button data-go="3">3Dを開く</button></div></li>'
    '<li><span class="tun">4</span><div><b>保存する</b><p>名前をつけて保存すると、家具・配置・3Dの視点までまとめて残ります。</p><button data-go="4">保存を開く</button></div></li>'
    '<li><span class="tun">5</span><div><b>渡す</b><p>リンクやQRコード、PDF、きれいな画像で、家族やお客さまに渡せます。</p><button data-go="5">渡すを開く</button></div></li>'
    '</ol>') + s[b:]
rep('<li>右上の「設定」から、テーマカラー・フォント・スマホ／PC表示、「Standard」と「Advisor」の切り替えができます。</li>',
    '<li>家具の一覧（サイズ・価格・数量）は下の「家具」タブで確かめられます。</li>')
a = s.index('<details class="fold"><summary>PRO仕様でできること</summary>')
b = s.index('</details>', a) + len('</details>')
s = s[:a] + (
    '<details class="fold"><summary>有料プランでできること</summary><ul class="tul">'
    '<li><b>Plus</b>：保存できるプランが無制限、案を比べる、別の端末と同期（クラウド）、パーツごとの木目・素材、ベッドや照明の全タイプ、透かしなしの高品位画像。</li>'
    '<li><b>Pro</b>：Plusのすべてに加えて、お見積り（PDF・QR）、お客さま表示、vmd（売場）プロジェクト、梁、店頭端末のロック。</li>'
    '</ul><p class="lead">画面上部の「プラン」から申し込めます。</p></details>') + s[b:]

# ---------- CSS ----------
rep('/* 使う人：Standard／Advisor */',
    '/* 部屋・売場（room／vmd）と新しい導線 */\n'
    '.ddseg{display:grid!important;grid-template-columns:1fr 1fr;gap:0;margin:0 0 10px}.ddseg button{width:100%;margin:0;min-height:40px;font-weight:700}\n'
    '.rvseg{display:grid!important;grid-template-columns:1fr 1fr;gap:0;margin:0 0 10px}.rvseg button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;width:100%;margin:0;min-height:54px;font-size:1rem;font-weight:800;letter-spacing:.03em;line-height:1.1}.rvseg button small{font-size:.68rem;font-weight:500;opacity:.8}\n'
    '.plb{width:100%;min-height:48px;margin:4px 0 10px;font-size:1rem;font-weight:800}\n'
    '.stmbox{max-width:520px;width:100%}.stmg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}\n'
    '.stmg button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;min-height:112px;border:1.5px solid var(--line);border-radius:var(--rc);background:var(--card);color:var(--ink)}\n'
    '.stmg button i{display:block;border:2px solid var(--ink);border-radius:2px;background:var(--fill)}.stmg button b{font-size:1rem}.stmg button small{font-size:.68rem;color:var(--sub)}\n'
    'body:not(.shownum) .pchip .pn{display:none}\n'
    '.cvx{position:absolute;top:10px;right:10px;z-index:6;min-height:40px;padding:4px 14px;border-radius:999px;background:rgba(255,255,255,.94);border:1.5px solid #111;color:#111;font-weight:700}\n'
    'body.cview{overflow:hidden}body.cview #cv3w{position:fixed;inset:0;z-index:50;background:#fff}body.cview #cv3w #eyeov,body.cview #cv3w .sel3,body.cview #cv3w .ppn{display:none!important}\n'
    'body.cview #ur,body.cview .tabs,body.cview h1{visibility:hidden}\n'
    '.pc-only{display:none}body.pc .pc-only{display:block}\n'
    '.ptag{display:inline-block;margin-left:6px;padding:0 6px;border-radius:999px;font-size:.62rem;font-weight:800;letter-spacing:.04em;background:var(--ink);color:var(--card);vertical-align:2px}\n'
    'body.biz .ptag.tp,body.pro .ptag.tl{display:none}\n'
    '/* 旧：使う人 Standard／Advisor */')

# ---------- JS：テーマは固定（黒・白基調）、フォントは端末標準 ----------
rep('(function(){var st={};try{st=JSON.parse(localStorage.getItem("bimini-theme"))||{}}catch(e){}THS.f=st.f||"sys";setTheme(st.t,st.c);if(THS.f!=="sys")setFont(THS.f);',
    '(function(){THS.f="sys";setTheme("custom","#2b2b2b");')
rep(' document.getElementById("thsw").addEventListener("click",function(e){var x=e.target.closest("[data-c]");if(x)setTheme("custom",x.getAttribute("data-c"))});\n'
    ' document.getElementById("fnts").addEventListener("click",function(e){var x=e.target.closest("[data-f]");if(x)setFont(x.getAttribute("data-f"))});\n'
    ' document.getElementById("thc").addEventListener("input",function(e){setTheme("custom",e.target.value)});\n', '')
rep('b.onclick=function(){thUI();p.hidden=false;', 'b.onclick=function(){p.hidden=false;')
rep('function thUI(){var sw=document.getElementById("thsw"),fn=document.getElementById("fnts");if(!sw||sw.childNodes.length)return;',
    'function thUI(){var sw=document.getElementById("thsw"),fn=document.getElementById("fnts");if(!sw||!fn||sw.childNodes.length)return;')
rep('function setTheme(t,c){var r=document.documentElement;', 'function setTheme(t,c){c="#2b2b2b";var r=document.documentElement;')

# レイアウトは自動だけ
rep('function layMode(){try{return localStorage.getItem("bimini-layout")||"auto"}catch(e){return"auto"}}', 'function layMode(){return"auto"}')
rep('document.getElementById("lay").addEventListener("click",', 'if(document.getElementById("lay"))document.getElementById("lay").addEventListener("click",')
rep('wrapCols("v2",[q("#v2 .tbar"),', 'wrapCols("v2",[q("#v2 .ddseg"),q("#v2 .tbar"),')
rep('wrapCols("v3",[q("#vb"),', 'wrapCols("v3",[q("#v3 .ddseg"),q("#vb"),')

# ---------- JS：はじめは家具ゼロ（空の番号を作らない） ----------
rep(' if(!items.length)for(var i=0;i<8;i++)items.push({name:"",w:"",d:"",h:"",q:1,img:""});norm(items);', ' norm(items);')
rep('if(all){items=[];for(var i=0;i<8;i++)items.push({name:"",w:"",d:"",h:"",q:1,img:""});norm(items)}', 'if(all){items=[];norm(items)}')
rep('tab(all?1:2);toast((all?"白紙から始めます。":"配置を白紙に戻しました（カタログはそのまま）。")',
    'tab(2);if(all)setTimeout(stmOpen,60);toast((all?"白紙から始めます。":"配置を白紙に戻しました（家具の一覧はそのまま）。")')

# ---------- JS：room／vmd（プロジェクトの種類） ----------
rep('plan.o=plan.o||[];plan.hm=plan.hm||[];plan.cut=plan.cut||[];plan.fl=plan.fl||[];plan.views=plan.views||[];plan.cols=plan.cols||[];plan.bms=plan.bms||[];var selO=-1,selH=-1;',
    'plan.o=plan.o||[];plan.hm=plan.hm||[];plan.cut=plan.cut||[];plan.fl=plan.fl||[];plan.views=plan.views||[];plan.cols=plan.cols||[];plan.bms=plan.bms||[];pmNorm(plan);var selO=-1,selH=-1;')
rep('function store(){return plan.mode==="store"&&document.body.classList.contains("biz")}',
    '/* room＝部屋／vmd＝売場。旧データの "store" は vmd として読みます */\n'
    'function pmNorm(p){if(p&&p.mode==="store")p.mode="vmd";return p}\n'
    'function store(){return plan.mode==="vmd"||plan.mode==="store"}\n'
    'function isBiz(){return document.body.classList.contains("biz")}\n'
    'var RFMT={room:[["2700x2700","4.5畳"],["2700x3600","6畳"],["3600x3600","8畳"],["3600x4500","10畳"],["3600x5400","12畳"],["4500x5760","16畳"]],'
    'vmd:[["3640x4550","5坪"],["5460x6060","10坪"],["5460x9100","15坪"],["7280x9100","20坪"],["9100x10920","30坪"],["10920x15140","50坪"]]};\n'
    'function rfmtFill(){var e=document.getElementById("rfmt");if(!e)return;var k=store()?"vmd":"room";if(e.getAttribute("data-k")===k)return;e.setAttribute("data-k",k);'
    'e.innerHTML=\'<option value="">選ぶ…</option>\'+RFMT[k].map(function(o){var d=o[0].split("x");return\'<option value="\'+o[0]+\'">\'+o[1]+"（"+(+d[0]).toLocaleString()+"×"+(+d[1]).toLocaleString()+"）</option>"}).join("")}')
rep('document.getElementById("aw").hidden=st;document.getElementById("ad").hidden=st;if(st)selO=-1;roomSum()}',
    'document.getElementById("aw").hidden=st;document.getElementById("ad").hidden=st;if(st)selO=-1;rfmtFill();roomSum()}')
rep('e.textContent=(store()?"売場 ":"")+plan.rw+"×"+plan.rd+"mm"+(store()?"":"（約"+j+"畳）")}',
    'e.textContent=(store()?"vmd ":"room ")+plan.rw+"×"+plan.rd+"mm"+(store()?"（約"+(Math.round(plan.rw*plan.rd/3305785*10)/10)+"坪）":"（約"+j+"畳）")}')
rep('function setMode(m){if(m===(store()?"store":"room"))return;', 'function setMode(m){if(m===(store()?"vmd":"room"))return;')
rep('document.getElementById("mstore").onclick=function(){setMode("store")};',
    'document.getElementById("mstore").onclick=function(){if(!isBiz()){needPlan("pro","vmd（売場）はProプランで使えます。");return}setMode("vmd")};')
rep('plan.mode="room";plan.rw=wd[0];plan.rd=wd[1];plan.cut=[];if(!plan.o.length){',
    'if(!store())plan.mode="room";plan.rw=wd[0];plan.rd=wd[1];plan.cut=[];if(!store()&&!plan.o.length){')
rep('st:(d.plan||{}).mode==="store"}}', 'st:(d.plan||{}).mode==="store"||(d.plan||{}).mode==="vmd"}}')
rep('plan=d.plan;plan.o=plan.o||[];', 'plan=pmNorm(d.plan);plan.o=plan.o||[];')
rep('(st?\'<small>\'+(st.st?"売場":"部屋")', '(st?\'<small>\'+(st.st?"vmd 売場":"room 部屋")')

# ---------- JS：番号は必要な人だけ表示 ----------
rep('<text class="pt" x="\'+pc.x+\'" y="\'+pc.y+\'">\'+circ(pc.n+1)+\'</text></g>\'})',
    '\'+(SHOWNUM?\'<text class="pt" x="\'+pc.x+\'" y="\'+pc.y+\'">\'+circ(pc.n+1)+\'</text>\':\'\')+\'</g>\'})')
rep('inf=circ(pc.n+1)+" "', 'inf=(SHOWNUM?circ(pc.n+1)+" ":"")')
rep('textContent=circ(pc.n+1)+" "+(it.name||"")', 'textContent=(SHOWNUM?circ(pc.n+1)+" ":"")+(it.name||"")')
rep('document.getElementById("lbl").onchange=r3d;',
    'document.getElementById("lbl").onchange=function(e){numSet(e.target.checked);r3d()};')
rep('var PK="furniture-plan-v1",',
    'var TIERN={free:"Free",plus:"Plus",pro:"Pro"};var SHOWNUM=false;try{SHOWNUM=localStorage.getItem("bimini-num")==="1"}catch(e){}document.body.classList.toggle("shownum",SHOWNUM);document.getElementById("lbl").checked=SHOWNUM;\n'
    'function numSet(on){SHOWNUM=!!on;document.body.classList.toggle("shownum",SHOWNUM);try{localStorage.setItem("bimini-num",SHOWNUM?"1":"0")}catch(e){}if(typeof plan!=="undefined"&&plan&&!document.getElementById("v2").hidden)rplan()}\n'
    'var PK="furniture-plan-v1",')

# 置くボタン：中身のない家具は出さない
rep(' document.getElementById("chips").innerHTML=items.map(function(it,i){\n  var c=plan.p.filter(function(p){return p.n===i}).length;\n  return',
    ' document.getElementById("chips").innerHTML=items.map(function(it,i){\n  if(!(it.name||+it.w||+it.d||it.img))return"";var c=plan.p.filter(function(p){return p.n===i}).length;\n  return')
rep('var W=plan.rw,D=plan.rd,g="";', 'var _ch=document.getElementById("chipst");if(_ch)_ch.hidden=!plan.p.length;var W=plan.rw,D=plan.rd,g="";', 1)

# ---------- JS：タブ ----------
rep('function tab(n){for(var k=1;k<=6;k++){document.getElementById("v"+k).hidden=n!==k;document.getElementById("t"+k).className=n===k?"on":""}',
    'function tab(n){for(var k=1;k<=6;k++){document.getElementById("v"+k).hidden=n!==k;document.getElementById("t"+k).className=n===k||(k===2&&n===3)?"on":""}if(n===2||n===3)tab.dd=n;'
    '[].forEach.call(document.querySelectorAll(".ddseg [data-dd]"),function(b){b.className=+b.getAttribute("data-dd")===n?"on":""});try{ev("tab",{n:n})}catch(e){}')
rep('document.getElementById("t1").onclick=function(){tab(1)};document.getElementById("t2").onclick=function(){tab(2)};',
    'document.getElementById("t1").onclick=function(){tab(1)};document.getElementById("t2").onclick=function(){tab(tab.dd||2)};\n'
    '[].forEach.call(document.querySelectorAll(".ddseg"),function(g){g.addEventListener("click",function(e){var b=e.target.closest("[data-dd]");if(b)tab(+b.getAttribute("data-dd"))})});')

# ---------- JS：テンプレートから「置く」 ----------
rep('function addPreset(sm){var n=tplItem(sm),k=-1;\n items.forEach(function(it,i){if(k<0&&!it.name&&!it.w&&!it.d&&!it.h&&!it.img)k=i});\n if(k<0)items.push(n);else items[k]=n;save();render()}',
    'function addPreset(sm){var n=tplItem(sm),k=-1;\n items.forEach(function(it,i){if(k<0&&!it.name&&!it.w&&!it.d&&!it.h&&!it.img)k=i});\n if(k<0){items.push(n);k=items.length-1}else items[k]=n;save();render();return k}\n'
    '/* 家具を置く：同じ家具が一覧にあれば数量を増やし、なければ一覧に足して、部屋の中央に置く */\n'
    'function placeTpl(e){var k=-1;items.forEach(function(it,i){if(k<0&&it.name===e.name&&(it.fs||"")===(e.fs||"")&&(it.kind||"")===(e.kind||""))k=i});\n'
    ' if(k<0)k=addPreset(e);else{var c=plan.p.filter(function(p){return p.n===k}).length;if(c>=(+items[k].q||1)){items[k].q=c+1;save();render()}}\n'
    ' var cx=Math.round(plan.rw/2),cy=Math.round(plan.rd/2),z=0;plan.p.forEach(function(p){if(Math.abs(p.x-cx-z)<50&&Math.abs(p.y-cy-z)<50)z+=150});\n'
    ' plan.p.push({n:k,x:cx+z,y:cy+z,r:0});sel=plan.p.length-1;psave();rplan();after3d();try{ev("place",{fs:e.fs||e.kind||""})}catch(x){}return k}')
rep('function tplAdd(v){if(!v){toast("テンプレートを選んでください。");return}',
    'function tplAdd(v){if(!v){toast("家具を選んでください。");return}')
rep('if(!e)return;addPreset(e);toast(e.name+" を追加しました。"', 'if(!e)return;if(TPLPLACE){placeTpl(e);toast(e.name+" を置きました。ドラッグで動かせます。");return}addPreset(e);toast(e.name+" を一覧に追加しました。"')
rep('(v[0]==="y"&&!isPro()?"（形の表示はPRO仕様です）":""))}', '(v[0]==="y"&&!isPro()?"（形の表示は有料プランです）":""))}\nvar TPLPLACE=false;')
rep(' q("tplb").onclick=tplOpen;', ' q("tplb").onclick=function(){TPLPLACE=false;q("tpla").querySelector(".lb").textContent="一覧に追加";tplOpen()};\n'
    ' var pl=function(){TPLPLACE=true;q("tpla").querySelector(".lb").textContent="部屋に置く";tplOpen()};q("plb").onclick=pl;q("plb3").onclick=pl;')
rep(' q("tplg").addEventListener("click",function(e){var b=e.target.closest("[data-id]");if(b)tplShow(b.getAttribute("data-id"))});',
    ' q("tplg").addEventListener("click",function(e){var b=e.target.closest("[data-id]");if(!b)return;if(TPLPLACE){tplAdd(b.getAttribute("data-id"));tplPvFree();q("tpl").hidden=true;return}tplShow(b.getAttribute("data-id"))});')
rep('<b id="tplt">テンプレートから選ぶ</b>', '<b id="tplt">家具を選ぶ</b>')
rep('<span class="lb">カタログに追加</span>', '<span class="lb">一覧に追加</span>')
rep('var TPG=["テーブル",', 'var TPG=["什器","テーブル",')

# ---------- JS：はじめの画面 ----------
rep('/* ===== お客さま用 見積り ===== */',
    '/* ===== はじめの画面：どこをつくる？ → 広さ → 家具を置く ===== */\n'
    'var STM={k:"room"};\n'
    'function stmGrid(){var g=document.getElementById("stmg"),L=RFMT[STM.k],mx=0;L.forEach(function(o){o[0].split("x").forEach(function(v){mx=Math.max(mx,+v)})});\n'
    ' g.innerHTML=L.map(function(o){var d=o[0].split("x").map(Number),w=Math.round(14+d[0]/mx*46),h=Math.round(14+d[1]/mx*46);'
    'return\'<button type="button" data-wd="\'+o[0]+\'"><i style="width:\'+w+\'px;height:\'+h+\'px"></i><b>\'+o[1]+\'</b><small>\'+d[0].toLocaleString()+"×"+d[1].toLocaleString()+"</small></button>"}).join("");\n'
    ' [].forEach.call(document.querySelectorAll("#stmk [data-k]"),function(b){b.className=b.getAttribute("data-k")===STM.k?"on":""})}\n'
    'function stmOpen(){if(VIEW)return;STM.k=store()?"vmd":"room";if(STM.k==="vmd"&&!isBiz())STM.k="room";stmGrid();document.getElementById("stm").hidden=false;try{ev("start_open")}catch(e){}}\n'
    '(function(){var q=function(i){return document.getElementById(i)};if(!q("stm"))return;\n'
    ' q("stmx").onclick=function(){q("stm").hidden=true;try{localStorage.setItem("bimini-started","1")}catch(e){}};\n'
    ' q("stmk").addEventListener("click",function(e){var b=e.target.closest("[data-k]");if(!b)return;var k=b.getAttribute("data-k");if(k==="vmd"&&!isBiz()){needPlan("pro","vmd（売場）はProプランで使えます。");return}STM.k=k;stmGrid()});\n'
    ' q("stmg").addEventListener("click",function(e){var b=e.target.closest("[data-wd]");if(!b)return;var wd=b.getAttribute("data-wd").split("x").map(Number);\n'
    '  plan.mode=STM.k;plan.rw=wd[0];plan.rd=wd[1];plan.cut=[];\n'
    '  if(STM.k==="room"&&!plan.o.length){plan.o.push({t:"w",wall:"n",s:Math.round((wd[0]-1700)/2/50)*50,len:1700,sill:900,h:1100});plan.o.push({t:"d",wall:"s",s:150,len:800,sill:0,h:2000})}\n'
    '  plan.o.forEach(function(o){oclamp(o)});plan.p.forEach(function(pc){var z=size(pc);pc.x=Math.max(z.bw/2,Math.min(plan.rw-z.bw/2,pc.x));pc.y=Math.max(z.bh/2,Math.min(plan.rd-z.bh/2,pc.y))});\n'
    '  psave();modeUI();q("stm").hidden=true;try{localStorage.setItem("bimini-started","1");ev("start_size",{k:STM.k,wd:b.getAttribute("data-wd")})}catch(x){}tab(2);\n'
    '  if(!plan.p.length)setTimeout(function(){q("plb").click()},250)});\n'
    ' q("setgd").onclick=function(){q("thp").hidden=true;tab(6)};q("setdemo").onclick=function(){q("thp").hidden=true;demoLoad()};\n'
    ' var started=false;try{started=localStorage.getItem("bimini-started")==="1"}catch(e){}\n'
    ' if(!started&&!hasContent()&&!/^#b=/.test(location.hash||""))setTimeout(stmOpen,300)})();\n'
    '/* ===== お客さま用 見積り ===== */')
# 旧ガイドの案内バナーは出さない（はじめの画面に置き換え）
rep('if(!seen&&!hasContent())q("tuban").hidden=false})();', '})();')

# ---------- JS：ガイドツアー（新しい流れ） ----------
a = s.index('var TOUR=[{t:1,s:"#tplb"')
b = s.index('],TI=-1;', a)
s = s[:a] + (
    'var TOUR=[{t:2,s:"#roomf",m:"① まず「広さ・形」で部屋の大きさを選びます。畳（部屋）や坪（売場）のテンプレートが使えます。"},\n'
    ' {t:2,s:"#plb",m:"② 「家具を置く」から選ぶと、部屋の中央に置かれます。"},\n'
    ' {t:2,s:"#svg",m:"③ 家具はドラッグで移動。選ぶと上のボタンで「回転・複製・削除」ができます。窓・扉・人は下の「追加する」から。"},\n'
    ' {t:2,s:"#ailb",ai:1,m:"おまかせ配置：通路幅を考えて配置し、好きなテイストの色・素材まで提案します。",pro:1},\n'
    ' {t:3,s:"#cv",m:"④ 上の「3D」で確認します。1本指で回転、2本指で拡大・移動。家具をタップで選び、もう一度ドラッグで動かせます。"},\n'
    ' {t:3,s:"#eyeov",m:"⑤ 右のバーで目線の高さを変えられます。「立つ」「座る」で人の目線に。"},\n'
    ' {t:3,s:"#fcol",m:"⑥ 「色・素材」で壁・床・家具の色を変えられます。"},\n'
    ' {t:4,s:"#pjs",m:"⑦ 名前をつけて保存。保存したものは「呼び出す」でいつでも戻せます。"},\n'
    ' {t:5,s:"#v5 .tiles",m:"⑧ リンク・QRコード・PDF・画像で渡せます。"},\n'
    ' {t:0,s:"#newb",m:"新しいプランは右上の「新規」から。困ったら「↶ 戻す」で1つ前に戻れます。おつかれさまでした！"}') + s[b:]

# ---------- JS：お客さま表示のロック（旧：使う人の切り替え） ----------
a = s.index('/* ===== 使う人：Standard／Advisor（管理者が切り替え） ===== */')
b = s.index('/* ===== サブスク（Web版のみ')
s = s[:a] + (
    '/* ===== お客さま表示のロック（店頭端末向けのパスコード） ===== */\n'
    'var ROLE={want:null};\n'
    'function rolePin(){try{return localStorage.getItem("bimini-rolepin")||""}catch(e){return""}}\n'
    '(function(){var q=function(i){return document.getElementById(i)};if(!q("rolelk"))return;var lk=q("rolelk");lk.checked=!!rolePin();\n'
    ' function ask4(mode,lb){ROLE.mode=mode;q("rolepl").textContent=lb;q("rolepok").textContent=mode==="exit"?"閉じる":"決定";q("rolelock").hidden=false;q("rolepin").value="";setTimeout(function(){try{q("rolepin").focus()}catch(x){}},30)}\n'
    ' ROLE.ask=ask4;\n'
    ' q("rolepok").onclick=function(){var v=q("rolepin").value;\n'
    '  if(ROLE.mode==="set"){if(!/^\\d{4}$/.test(v)){toast("数字4桁で決めてください。");return}try{localStorage.setItem("bimini-rolepin",v)}catch(x){}lk.checked=true;q("rolelock").hidden=true;toast("パスコードを設定しました。");return}\n'
    '  if(v!==rolePin()){toast("パスコードが違います。");return}q("rolelock").hidden=true;\n'
    '  if(ROLE.mode==="unset"){try{localStorage.removeItem("bimini-rolepin")}catch(x){}lk.checked=false;toast("パスコードを外しました。")}else if(ROLE.mode==="exit"){q("thp").hidden=true;cvSet(false,true)}};\n'
    ' lk.onchange=function(){var on=lk.checked;lk.checked=!on;if(on)ask4("set","新しいパスコード（数字4桁）");else ask4("unset","いまのパスコード（4桁）")}})();\n'
    '/* ===== お客さま表示（UIを消した3D） ===== */\n'
    'function cvSet(on,force){var q=function(i){return document.getElementById(i)};\n'
    ' if(!on&&!force&&rolePin()){q("thp").hidden=false;ROLE.ask("exit","パスコード（4桁）で閉じる");return}\n'
    ' if(on&&!isBiz()){needPlan("pro","お客さま表示はProプランで使えます。");return}\n'
    ' document.body.classList.toggle("cview",!!on);q("cvx").hidden=!on;if(on){tab(3);try{ev("customer_view")}catch(e){}}setTimeout(function(){if(T&&T.r)r3d()},60)}\n'
    '(function(){var q=function(i){return document.getElementById(i)};q("cvb").onclick=function(){cvSet(true)};q("cvx").onclick=function(){cvSet(false)}})();\n'
    '/* ===== プラン（free／plus／pro）と表示の切り替え ===== */\n'
    'function tierGet(){return document.body.classList.contains("biz")?"pro":document.body.classList.contains("pro")?"plus":"free"}\n'
    'function setTier(t,quiet){t=t==="pro"||t==="plus"?t:"free";document.body.classList.toggle("biz",t==="pro");document.body.classList.toggle("gen",t!=="pro");document.body.classList.toggle("plus",t==="plus");\n'
    ' try{localStorage.setItem("bimini-tier",t)}catch(e){}var b=document.getElementById("prob");if(b)b.textContent=t==="free"?"プラン":TIERN[t];var bg=document.getElementById("prbg");if(bg)bg.textContent=TIERN[t];\n'
    ' if(t!=="pro"&&document.body.classList.contains("cview"))cvSet(false,true);\n'
    ' setPro(t!=="free",true);try{modeUI()}catch(e){}if(!quiet)toast(TIERN[t]+"にしました")}\n'
    'function tierLocal(){var t="";try{t=localStorage.getItem("bimini-tier")||"";if(!t&&localStorage.getItem("bimini-pro")==="1")t="pro"}catch(e){}return t||"free"}\n'
    '/* 課金の入口：Plus／Pro が必要な所で、理由を添えて申し込み画面を開く */\n'
    'function needPlan(t,msg){try{ev("paywall",{need:t,why:msg})}catch(e){}\n'
    ' if(document.body.classList.contains("billing")){toast(msg);billOpen(t);return}\n'
    ' if(document.body.classList.contains("native")){toast(msg);try{iosUI()}catch(e){}document.getElementById("bill").hidden=false;return}\n'
    ' toast(msg+"（画面上部の「プラン」で切り替えられます）")}\n'
) + s[b:]

# PROボタン：課金なしの環境では Free → Plus → Pro の順に切り替え
rep('document.getElementById("prob").onclick=function(){setPro(!isPro())};\n(function(){var on=false;try{on=localStorage.getItem("bimini-pro")==="1"}catch(e){}setPro(on,true)})();',
    'document.getElementById("prob").onclick=function(){var t=tierGet();setTier(t==="free"?"plus":t==="plus"?"pro":"free")};\n(function(){setTier(tierLocal(),true)})();')
rep('function billDisable(){document.body.classList.remove("billing");BILL.api="";var b=document.getElementById("prob");if(b)b.onclick=function(){setPro(!isPro())};var on=false;try{on=localStorage.getItem("bimini-pro")==="1"}catch(e){}setPro(on,true)',
    'function billDisable(){document.body.classList.remove("billing");BILL.api="";var b=document.getElementById("prob");if(b)b.onclick=function(){var t=tierGet();setTier(t==="free"?"plus":t==="plus"?"pro":"free")};setTier(tierLocal(),true)')
rep('function billApply(lic,quiet){BILL.lic=lic;var on=!!(lic&&lic.active);setPro(on,true);\n if(!on&&roleGet()==="biz")roleSet("gen",true);\n if(!quiet)toast(on?"PROが有効です":"PROは無効になっています")}',
    'function billApply(lic,quiet){BILL.lic=lic;var on=!!(lic&&lic.active),t=on?(lic.tier==="plus"?"plus":"pro"):"free";setTier(t,true);try{webCloud()}catch(e){}\n if(!quiet)toast(on?TIERN[t]+"プランが有効です":"有料プランは無効になっています")}')
rep(' /* Advisorモードは販売員プランの契約者だけ */\n q("roleseg").addEventListener("click",function(e){var b=e.target.closest("[data-role]");if(!b||b.getAttribute("data-role")!=="biz")return;var L=BILL.lic;if(L&&L.active)return;\n  e.stopPropagation();e.preventDefault();toast("AdvisorモードはPRO（月額）で使えます。");document.getElementById("thp").hidden=true;billOpen()},true);\n', '')
rep('function iosApply(st,quiet){IOS.active=st.active;IOS.end=st.end;IOS.will=st.will;setPro(st.active,true);if(!st.active&&roleGet()==="biz")roleSet("gen",true);if(!quiet)toast(st.active?"PROが有効です":"PROは無効になっています")}',
    'function iosApply(st,quiet){IOS.active=st.active;IOS.end=st.end;IOS.will=st.will;setTier(st.active?"pro":"free",true);if(!quiet)toast(st.active?"Proプランが有効です":"有料プランは無効になっています")}')
rep(' q("roleseg").addEventListener("click",function(e){var b=e.target.closest("[data-role]");if(!b||b.getAttribute("data-role")!=="biz"||IOS.active)return;e.stopPropagation();e.preventDefault();toast("AdvisorモードはPRO（月額）で使えます。");q("thp").hidden=true;iosUI();q("bill").hidden=false},true);\n setPro(false,true);',
    ' setTier("free",true);')
rep('<button id="prob" aria-pressed="false">PRO</button>', '<button id="prob" aria-pressed="false">プラン</button>')
rep('<i class="probadge">PRO</i>', '<i class="probadge" id="prbg">PRO</i>')
rep('<button id="hsv" class="hb" data-ic="folder" aria-label="保存・呼び出し">保存</button><button id="hhelp" class="hb" data-ic="help" aria-label="使い方">使い方</button>',
    '<button id="hsv" class="hb" data-ic="folder" aria-label="保存・呼び出し" hidden>保存</button><button id="hhelp" class="hb" data-ic="help" aria-label="使い方" hidden>使い方</button>')
rep('/* ===== iOSアプリ版（Capacitor）：アプリの中で動くときだけ有効 ===== */',
    '/* 起動時は「部屋」を開く */\nsetTimeout(function(){if(!VIEW&&document.getElementById("v1").hidden)tab(2)},0);\n/* ===== iOSアプリ版（Capacitor）：アプリの中で動くときだけ有効 ===== */')

# 起動時は「部屋」を開く・利用計測の受け口（ev は p3 で中身を入れる）
rep('load();render();setTimeout(function(){hisPush();cloudInit();aiInit()},0);',
    'function ev(){}\nload();render();setTimeout(function(){hisPush();cloudInit();aiInit()},0);')

open(P, "w", encoding="utf-8").write(s)
print("p1 OK")
