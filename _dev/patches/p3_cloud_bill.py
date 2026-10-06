"""p3: 復元コードでのクラウド同期（Plus・Pro）、匿名の利用状況、Free／Plus／Pro の申し込み画面。"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)

# ---------- 利用状況（匿名）：端末ごとのランダムな番号と操作の名前だけ ----------
rep('function ev(){}\n',
    '/* ===== 利用状況（匿名）：どこで止まり、どこで申し込み画面を開いたか ===== */\n'
    'var EVQ=[],EVT=0,EVAPI=(function(){var c=window.BIMINI_BILLING||{};return String(c.api||"").replace(/\\/+$/,"")})();\n'
    'function evOn(){try{return!!EVAPI&&!(window.claude&&window.claude.use)&&/^https?:$/.test(location.protocol)&&navigator.doNotTrack!=="1"&&!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())}catch(e){return false}}\n'
    'function evDid(){var d="";try{d=localStorage.getItem("bimini-did")||""}catch(e){}if(!/^[a-f0-9]{16,32}$/.test(d)){var a=new Uint8Array(12);crypto.getRandomValues(a);d=Array.from(a,function(v){return("0"+v.toString(16)).slice(-2)}).join("");try{localStorage.setItem("bimini-did",d)}catch(e){}}return d}\n'
    'function ev(e,p){if(!evOn())return;try{var b=document.body.classList;EVQ.push({e:e,d:evDid(),t:typeof tierGet==="function"?tierGet():"",w:b.contains("pc")?"pc":b.contains("tab")?"tab":"sp",p:p||undefined});clearTimeout(EVT);EVT=setTimeout(evFlush,EVQ.length>=10?0:4000)}catch(x){}}\n'
    'function evFlush(){if(!EVQ.length)return;var b=JSON.stringify({l:EVQ.splice(0,10)});try{if(navigator.sendBeacon&&navigator.sendBeacon(EVAPI+"/ev",new Blob([b],{type:"application/json"})))return}catch(e){}try{fetch(EVAPI+"/ev",{method:"POST",headers:{"Content-Type":"application/json"},body:b,keepalive:true}).catch(function(){})}catch(e){}}\n'
    'document.addEventListener("visibilitychange",function(){if(document.hidden)evFlush()});\n'
    'setTimeout(function(){ev("open",{new:!hasContent()})},500);\n')
rep('[].forEach.call(document.querySelectorAll(".ddseg [data-dd]"),function(b){b.className=+b.getAttribute("data-dd")===n?"on":""});try{ev("tab",{n:n})}catch(e){}',
    '[].forEach.call(document.querySelectorAll(".ddseg [data-dd]"),function(b){b.className=+b.getAttribute("data-dd")===n?"on":""});try{ev(n===3?"view_3d":n===5?"share_open":n===4?"save_open":n===1?"list_open":"plan_open")}catch(e){}')

# ---------- クラウド同期：Claude版の仕組みを、Web版では復元コード＋自前サーバーで動かす ----------
a = s.index('function cloudInit(){if(!window.claude||!window.claude.use)return;')
b0 = s.index('PDB=db;PUID=String(id);', a)
head = s[a:b0]
body_start = b0 + len('PDB=db;PUID=String(id);')
tail = '\n })}).catch(function(){}).then(function(){if(!document.getElementById("v4").hidden)rproj();else pjWhere()})}'
b1 = s.index(tail, body_start)
body = s[body_start:b1]
s = s[:a] + head + 'return cloudBoot(db,String(id))})}).catch(function(){}).then(function(){if(!document.getElementById("v4").hidden)rproj();else pjWhere()})}\n' \
    'function cloudBoot(db,uid){PDB=db;PUID=uid;' + body + '}\n' \
    '/* Web版（Plus・Pro）：復元コードを鍵に、BIMiniのサーバーへ保存する */\n' \
    'function webDb(lid){function call(b){b.lid=lid;return fetch(EVAPI+"/db",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)}).then(function(r){return r.json().then(function(d){if(!r.ok){var e=new Error(d&&d.error||"db");e.code=d&&(d.error==="too_large"||d.error==="quota_exceeded")?"quota_exceeded":d&&d.error;throw e}return d})})}\n' \
    ' function doc(id){return{get:function(){return call({op:"get",id:id}).then(function(d){return{exists:!!d.exists,data:function(){return d.data}}})},set:function(v){return call({op:"set",id:id,data:v})},"delete":function(){return call({op:"del",id:id})}}}\n' \
    ' return{web:true,collection:function(){return{doc:doc,where:function(f,o,v){return{get:function(){return call({op:"list",kind:v}).then(function(d){return{docs:(d.docs||[]).map(function(x){return{id:x.id,data:function(){return x.data}}})}})}}}}}}}\n' \
    'function webCloud(){if(typeof billOn!=="function"||!billOn()||!EVAPI)return;var L=BILL.lic,l=billLid(false);\n' \
    ' if(!l||!(L&&L.active)){if(PDB&&PDB.web){PDB=null;PUID=null;pjWhere()}return}if(PDB)return;\n' \
    ' cloudBoot(webDb(l),l).catch(function(){}).then(function(){if(!document.getElementById("v4").hidden)rproj();else pjWhere();try{ev("cloud_on")}catch(e){}})}\n' \
    + s[b1 + len(tail):]
rep('function pjWhere(){document.getElementById("pjw").textContent=PDB?"保存先：クラウド（あなた専用。別の端末やホーム画面のアプリからも呼び出せます）":"保存先：この端末のブラウザ（端末の設定によっては消えることがあります。「ファイルに書き出す」も併用してください）"}',
    'function pjWhere(){var w=document.getElementById("pjw");w.textContent=PDB?(PDB.web?"保存先：クラウド（復元コードを入れた端末なら、どこからでも呼び出せます）":"保存先：クラウド（あなた専用。別の端末やホーム画面のアプリからも呼び出せます）"):"保存先：この端末のブラウザ（端末の設定によっては消えることがあります）"+(isPro()?"":"。Plusにすると、別の端末とも同期できます。")}')

# 保存タブ：別の端末と同期
rep('<details class="fold"><summary>ファイルで持ち運ぶ（バックアップ）</summary>',
    '<details class="fold billing-only" id="syncf"><summary>別の端末と同期<i class="ptag tl">Plus</i></summary>\n'
    '<p class="lead">Plus・Proでは、保存した内容がクラウドに残ります。別の端末では「プラン」→「別の端末で申し込んだ方（復元コード）」に、この端末の復元コードを入れると同じ内容を呼び出せます。</p>\n'
    '<div class="row"><button id="syncb" data-ic="folder">復元コードを表示・入力する</button></div></details>\n'
    '<details class="fold"><summary>ファイルで持ち運ぶ（バックアップ）</summary>')
rep('.pc-only{display:none}', 'body:not(.billing) .billing-only{display:none!important}\n.pc-only{display:none}')

# ---------- 申し込み画面：Plus と Pro ----------
a = s.index('<div id="billbuy"><div class="plans">')
b = s.index('<p class="lead stripe-only"', a)
s = s[:a] + '''<div id="billbuy"><p class="lead billwhy" id="billwhy" hidden></p><div class="plans">
<div class="plan plus" id="bplus"><b>Plus</b><span class="pp" id="bpp1"></span><ul><li>保存できるプランが無制限・案を比べる</li><li>別の端末と同期（クラウド）</li><li>パーツごとの木目・素材、ベッドや照明の全タイプ</li><li>透かしなしの高品位画像</li></ul>
<div class="pbtn"><button data-plan="plus_m" class="pri"><span class="lb">月額で申し込む</span></button><button data-plan="plus_y"><span class="lb" id="bpy"></span></button><button data-plan="plus_pass"><span class="lb" id="bps"></span></button></div></div>
<div class="plan biz" id="bpro"><b>Pro</b><span class="pp" id="bpp"></span><ul><li>Plusのすべて</li><li>お見積り（PDF・お客さま用QR）</li><li>お客さま表示・店頭端末のロック</li><li>vmd（売場）プロジェクト・梁</li></ul><button data-plan="pro" class="pri"><span class="lb">申し込む</span></button></div></div>
''' + s[b:]
rep('<b id="billt">BIMini PRO</b>', '<b id="billt">BIMini のプラン</b>')
rep('/* サブスク */', '/* サブスク */\n.billwhy{margin:0 0 10px;padding:8px 10px;border-radius:var(--rc);background:var(--fill);color:var(--ink);font-weight:700}\n'
    '.plan.hl{box-shadow:0 0 0 2px var(--acc)}.pbtn{display:grid;gap:6px;margin-top:8px}.pbtn button{width:100%}\nbody.native #bplus{display:none}')
rep('function billUI(){var q=function(i){return document.getElementById(i)},L=BILL.lic,on=!!(L&&L.active);q("billbuy").hidden=on;q("billme").hidden=!on;q("billm").textContent="";\n q("bpp").textContent=BILL.price;q("billtk").href=BILL.tk;',
    'function billUI(t,why){var q=function(i){return document.getElementById(i)},L=BILL.lic,on=!!(L&&L.active),P=BILL.prices;q("billbuy").hidden=on&&L.status!=="pass";q("billme").hidden=!on;q("billm").textContent="";\n'
    ' q("bpp").textContent=P.pro||BILL.price;q("bpp1").textContent=P.plus_m||"";q("bpy").textContent="年額で申し込む"+(P.plus_y?"（"+P.plus_y+"）":"");q("bps").textContent="30日パス"+(P.plus_pass?"（"+P.plus_pass+"・自動更新なし）":"（自動更新なし）");q("billtk").href=BILL.tk;\n'
    ' q("bplus").hidden=on&&L.tier==="plus";q("bplus").classList.toggle("hl",t==="plus");q("bpro").classList.toggle("hl",t==="pro");q("billwhy").hidden=!why;q("billwhy").textContent=why||"";')
rep('  q("billst").innerHTML="<b>ご契約中：BIMini PRO</b><br>"+(L.status==="owner"?"管理者ライセンス（お支払いは不要です）":L.status==="past_due"?"お支払いが確認できていません。カード情報をご確認ください。":L.cancelAt?ds+"で終了します（解約済み）。":ds?"次回の更新日："+ds:"");',
    '  q("billst").innerHTML="<b>ご契約中：BIMini "+(L.tier==="plus"?"Plus":"Pro")+"</b><br>"+(L.status==="owner"?"管理者ライセンス（お支払いは不要です）":L.status==="pass"?ds+"まで使えます（30日パス・自動更新なし）":L.status==="past_due"?"お支払いが確認できていません。カード情報をご確認ください。":L.cancelAt?ds+"で終了します（解約済み）。":ds?"次回の更新日："+ds:"")+(L.tier==="plus"&&L.status!=="pass"?"<br><small>Proへの変更は「お支払い・プラン変更」から行えます。</small>":"");')
rep('<span class="lb">お支払い・解約の手続き</span>', '<span class="lb">お支払い・プラン変更・解約</span>')
rep('function billOpen(){billUI();document.getElementById("bill").hidden=false}',
    'function billOpen(t,why){billUI(t,why);document.getElementById("bill").hidden=false;try{ev("plan_open",{need:t||""})}catch(e){}}')
rep(' if(document.body.classList.contains("billing")){toast(msg);billOpen(t);return}', ' if(document.body.classList.contains("billing")){billOpen(t,msg);return}')
rep('var BILL=(function(){var c=window.BIMINI_BILLING||{};return{api:String(c.api||"").replace(/\\/+$/,""),price:c.price||c.gen||"",tk:c.tokushoho||"tokushoho.html",lic:null}})();',
    'var BILL=(function(){var c=window.BIMINI_BILLING||{};return{api:String(c.api||"").replace(/\\/+$/,""),price:c.price||c.gen||"",prices:c.prices||{},tk:c.tokushoho||"tokushoho.html",lic:null}})();')
rep(' q("billbuy").addEventListener("click",function(e){var b=e.target.closest("[data-plan]");if(!b)return;var lid=billLid(true);',
    ' q("billbuy").addEventListener("click",function(e){var b=e.target.closest("[data-plan]");if(!b)return;var lid=billLid(true);try{ev("checkout",{plan:b.getAttribute("data-plan")});evFlush()}catch(x){}')
rep(' q("prob").onclick=billOpen;q("billx").onclick=function(){q("bill").hidden=true};',
    ' q("prob").onclick=function(){billOpen()};q("billx").onclick=function(){q("bill").hidden=true};if(q("syncb"))q("syncb").onclick=function(){billOpen("plus")};')
rep('billApply(d);billUI()},function(){q("billm").textContent="確認できませんでした。通信状況を確認してください。"})};',
    'billApply(d);billUI();q("billm").textContent="この端末でも使えるようになりました。保存した内容はクラウドから呼び出せます。"},function(){q("billm").textContent="確認できませんでした。通信状況を確認してください。"})};')
# iOS版はこれまでどおり Pro（PRO）1本
rep('q("billst").innerHTML="<b>ご契約中：BIMini PRO</b><br>"+(d?', 'q("billst").innerHTML="<b>ご契約中：BIMini Pro</b><br>"+(d?')

open(P, "w", encoding="utf-8").write(s); print("p3 OK")
