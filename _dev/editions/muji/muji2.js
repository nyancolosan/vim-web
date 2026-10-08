/* ===== idea：商品の比較・接客メモ =====
 * muji.js のあとに読み込む。window.MUJI_CATALOG（ネットストアの家具・観葉植物）を使う。
 * 比較：2〜3点を並べて、価格・サイズ・素材・向く人（目安）を見る。
 * 接客メモ：お客さまの部屋・暮らし・好み・提案した商品を残す。保存先は Claude アカウント（使えない時はこの端末）。 */
(function(){
var MC=window.MUJI_CATALOG||[];
var q=function(i){return document.getElementById(i)};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var yen=function(v){return v?"¥"+Math.round(v).toLocaleString("ja-JP"):"商品ページで確認"};
var CN={sofa:"ソファ",table:"テーブル",lt:"ローテーブル",desk:"デスク",chair:"チェア",bench:"スツール・ベンチ",bed:"ベッド",shelf:"収納",rug:"ラグ",plant:"観葉植物"};
function norm(s){return String(s||"").replace(/[！-～]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-65248)}).replace(/　/g," ").toLowerCase()}
MC.forEach(function(p,i){if(p._i===undefined)p._i=i;if(!p._k)p._k=norm(p.name+" "+(p.sub||"")+" "+(p.note||"")+" "+p.jan)});
function ovl(id,label,cls){var e=q(id);if(e)return e;e=document.createElement("div");e.id=id;e.className="mxov "+(cls||"");e.hidden=true;e.setAttribute("role","dialog");e.setAttribute("aria-modal","true");e.setAttribute("aria-label",label);document.body.appendChild(e);return e}
function lock(on){document.documentElement.style.overflow=on?"hidden":""}
function back(lv){try{window.ideaMenu(lv)}catch(e){}}

/* ---------- 商品の見どころ（名前からの目安） ---------- */
var MAT=[[/ウォールナット/,"ウォールナット"],[/オーク/,"オーク"],[/タモ|アッシュ/,"タモ"],[/パイン/,"パイン"],[/ラバーウッド/,"ラバーウッド"],[/チーク/,"チーク"],[/メープル/,"メープル"],[/ブナ/,"ブナ"],[/竹/,"竹"],[/ステンレス/,"ステンレス"],[/スチール/,"スチール"],[/アルミ/,"アルミ"],[/ガラス/,"ガラス"],[/ポリプロピレン|樹脂|プラスチック/,"樹脂"],[/本革|牛革|レザー/,"革"],[/合成皮革|合皮/,"合成皮革"],[/ウール/,"ウール"],[/綿|コットン/,"綿"],[/麻|リネン/,"麻"],[/ポリエステル/,"ポリエステル"],[/ポケットコイル/,"ポケットコイル"],[/ウレタン/,"ウレタン"],[/不織布/,"不織布"],[/ラタン|籐/,"ラタン"],[/ブークレ/,"ブークレ生地"],[/ファブリック|布/,"布張り"]];
function mats(p){var o=[],t=p.name+" "+(p.sub||"");MAT.forEach(function(m){if(m[0].test(t)&&o.indexOf(m[1])<0)o.push(m[1])});return o}
function fit(p){var w=p.w,d=p.d,n=p.name+" "+(p.sub||"");
 switch(p.cat){
  case"sofa":return/1シーター|1人掛け|1人用|オットマン/.test(n)?"1人でゆったり座りたい人。すき間や書斎・寝室に":/2シーター|2人掛け|2\.5/.test(n)||w<=1700?"1〜2人暮らし・ワンルーム〜1LDK。圧迫感をおさえたい人":/3シーター|3人掛け/.test(n)||w<=2100?"2〜3人家族。リビングで足を伸ばしたい人":"3人以上・広めのリビング。ゆったり並んで座りたい人";
  case"table":return w<=800?"1人暮らし・カフェ使い。省スペース重視":w<=1300?"2人暮らし〜小さな家族（2〜4人）":w<=1700?"3〜4人家族。ふだんの食事＋作業にも":"4〜6人・来客が多い家。大きな天板がほしい人";
  case"lt":return w<=600?"サブとして置く人・ソファ横の小さなスペース":w<=1000?"1〜2人暮らし。ソファ前に置く、ふだん使い":"3人以上で囲む・リビングの主役にしたい人";
  case"desk":return w<=1000?"省スペースで作業したい人・ノートPC中心":w<=1400?"在宅ワーク・学習。モニター1台＋ノート":"2画面・書類が多い人。作業に広さがほしい人";
  case"chair":return/ダイニング|食卓/.test(n)?"食事のあいだ長く座る人":"食卓・デスク・予備椅子など、使い回したい人";
  case"bench":return"玄関・窓辺・ベッドサイドなど、ちょっと座る・置く場所に";
  case"bed":return/スモール/.test(n)?"1人（体の小さな方・子ども・ゲスト用）":/シングル|セミシングル/.test(n)?"1人で寝る人":/セミダブル/.test(n)?"1人でゆったり／2人でも可（狭め）":/クイーン|ワイドダブル|キング/.test(n)?"2人で寝る人":/ダブル/.test(n)?"2人で寝る人（ややコンパクト）":"寝室の広さとマットレスサイズに合わせて選ぶ";
  case"shelf":return p.h>=1500?"収納量がほしい人・本や雑貨をまとめたい人":p.h>=800?"リビングや玄関の腰高の収納。上も飾りたい人":"低めに抑えたい人・窓の下やベッド脇に";
  case"rug":return"床の質感と音をやわらげたい人";
  case"plant":return"空間に緑を足したい人（水やり・日当たりは商品ごとに確認）"}
 return"—"}
var LABEL={m:"素材（名前から）",f:"向く人（目安）"};

/* ---------- 商品をえらぶ窓（比較・メモ共通） ---------- */
var PK={cb:null,cat:"all",t:""};
function pickOpen(cb,title){PK.cb=cb;var e=ovl("mxpk","商品をえらぶ","mxpk");
 e.innerHTML='<div class="mxbox"><div class="mxh"><b>'+esc(title||"商品をえらぶ")+'</b><button type="button" class="mxb" data-k="x">閉じる</button></div><input type="search" id="mxpq" class="mxin" placeholder="商品名・素材・JANで探す" autocomplete="off"><div class="mxcats" id="mxpc">'+[["all","すべて"]].concat(Object.keys(CN).map(function(k){return[k,CN[k]]})).map(function(c){return'<button type="button" data-c="'+c[0]+'"'+(c[0]===PK.cat?' class="on"':'')+'>'+c[1]+'</button>'}).join("")+'</div><div id="mxpl" class="mxlist"></div></div>';
 e.hidden=false;pkDraw();
 e.onclick=function(ev){var b=ev.target.closest("[data-k],[data-c],[data-p]");if(ev.target===e||(b&&b.getAttribute("data-k")==="x")){e.hidden=true;return}
  if(!b)return;if(b.hasAttribute("data-c")){PK.cat=b.getAttribute("data-c");[].forEach.call(q("mxpc").children,function(x){x.className=x===b?"on":""});pkDraw();return}
  if(b.hasAttribute("data-p")){var p=MC[+b.getAttribute("data-p")];e.hidden=true;if(PK.cb&&p)PK.cb(p)}};
 q("mxpq").oninput=function(ev){PK.t=ev.target.value;pkDraw()};q("mxpq").value=PK.t;
 if(!("ontouchstart" in window))setTimeout(function(){try{q("mxpq").focus()}catch(x){}},50)}
function pkDraw(){var t=norm(PK.t).split(/\s+/).filter(Boolean);
 var r=MC.filter(function(p){return(PK.cat==="all"||p.cat===PK.cat)&&t.every(function(x){return p._k.indexOf(x)>=0})});
 q("mxpl").innerHTML=(r.slice(0,80).map(function(p){return'<button type="button" class="mxrow" data-p="'+p._i+'"><b>'+esc(p.name)+'</b><span>W'+p.w+' × D'+p.d+' × H'+p.h+' mm　'+(p.cat==="plant"?"VIMの観葉植物":yen(p.price))+'</span></button>'}).join("")||'<p class="mxe">見つかりません</p>')+(r.length>80?'<p class="mxe">ほか '+(r.length-80)+' 件。絞り込んでください。</p>':"")}

/* ---------- 商品の比較 ---------- */
var CMP=[];
function cmpAdd(p){if(!p)return false;if(CMP.indexOf(p._i)>=0)return true;if(CMP.length>=3){toast("比べられるのは3点までです");return false}CMP.push(p._i);return true}
function toast(m){try{window.toast(m)}catch(e){}}
function cmpOpen(){lock(true);var e=ovl("mxcmp","商品を比べる","mxfull");e.hidden=false;cmpDraw();
 e.onclick=function(ev){var b=ev.target.closest("[data-a]");if(!b)return;var a=b.getAttribute("data-a");
  if(a==="x"){e.hidden=true;lock(false);back("living")}
  else if(a==="add")pickOpen(function(p){cmpAdd(p);cmpDraw()},"比べる商品を追加");
  else if(a==="rm"){CMP.splice(+b.getAttribute("data-i"),1);cmpDraw()}
  else if(a==="clr"){CMP=[];cmpDraw()}}}
function best(P,f,low){var v=P.map(f).filter(function(x){return x>0});if(v.length<2)return null;return low?Math.min.apply(0,v):Math.max.apply(0,v)}
function cmpDraw(){var e=q("mxcmp"),P=CMP.map(function(i){return MC[i]}).filter(Boolean);
 var h='<div class="mxin2"><div class="mxh mxsticky"><b>商品を比べる</b><span class="mxhs"><button type="button" class="mxb" data-a="clr"'+(P.length?'':' hidden')+'>全部はずす</button><button type="button" class="mxb pri" data-a="x">閉じる</button></span></div>';
 h+='<p class="mxlead">2〜3点を選ぶと、サイズ・価格・素材・向く人を並べて見られます。お客さまの「どっちがいい？」に。</p>';
 if(P.length<3)h+='<button type="button" class="mxadd" data-a="add">＋ 比べる商品を追加（'+P.length+'/3）</button>';
 if(P.length<2){h+='<p class="mxe">'+(P.length?"あと1点選ぶと比べられます。":"商品を2点以上選んでください。")+'</p>'+(P.length?cmpCols(P,true):"")+'</div>';e.innerHTML=h;return}
 h+=cmpCols(P)+cmpDiff(P)+'<p class="mxnote">素材と「向く人」は商品名・サイズからの目安です。正確な仕様・在庫・最新の価格は、商品ページでご確認ください。（'+esc(window.MUJI_CATALOG_AT||"")+'時点）</p></div>';e.innerHTML=h}
function cmpCols(P,single){var n=P.length,lo=best(P,function(p){return p.price},true),nw=best(P,function(p){return p.w},true),nd=best(P,function(p){return p.d},true),nh=best(P,function(p){return p.h},true);
 var rows=[["価格",function(p){return'<b class="'+(lo&&p.price===lo&&!single?"hi":"")+'">'+(p.cat==="plant"?"—":yen(p.price))+'</b>'+(lo&&p.price===lo&&!single?'<i class="tg">最安</i>':"")}],
  ["幅",function(p){return'<b class="'+(nw&&p.w===nw&&!single?"hi":"")+'">'+p.w+' mm</b>'+(nw&&p.w===nw&&!single?'<i class="tg">いちばんコンパクト</i>':"")}],
  ["奥行",function(p){return'<b class="'+(nd&&p.d===nd&&!single?"hi":"")+'">'+p.d+' mm</b>'}],
  ["高さ",function(p){return'<b class="'+(nh&&p.h===nh&&!single?"hi":"")+'">'+p.h+' mm</b>'}],
  ["種類",function(p){return esc(CN[p.cat]||"")+(p.sub?"／"+esc(p.sub):"")}],
  [LABEL.m,function(p){var m=mats(p);return m.length?esc(m.join("・")):'<span class="sub">商品ページで確認</span>'}],
  [LABEL.f,function(p){return esc(fit(p))}],
  ["商品ページ",function(p){return p.url?'<a href="'+esc(p.url)+'" target="_blank" rel="noopener">ネットストアで見る</a>':'<span class="sub">—</span>'}]];
 var t='<div class="mxtbl" style="--n:'+n+'"><div class="mxr mxhd"><span class="mxl"></span>'+P.map(function(p,i){return'<div class="mxc"><b>'+esc(p.name)+'</b><button type="button" class="mxrm" data-a="rm" data-i="'+i+'" aria-label="はずす">×</button></div>'}).join("")+'</div>';
 rows.forEach(function(r){t+='<div class="mxr"><span class="mxl">'+r[0]+'</span>'+P.map(function(p){return'<div class="mxc">'+r[1](p)+'</div>'}).join("")+'</div>'});return t+'</div>'}
function cmpDiff(P){var out=[],a=P[0];
 function d(v,u,hi,lo){return v>0?hi:lo}
 var L=P.slice(1).map(function(b){var s=[],dw=b.w-a.w,dd=b.d-a.d,dh=b.h-a.h,dp=(b.price||0)-(a.price||0);
  s.push("幅 "+(dw===0?"同じ":Math.abs(dw)+"mm "+(dw>0?"広い":"せまい")));if(dd!==0)s.push("奥行 "+Math.abs(dd)+"mm "+(dd>0?"長い":"短い"));if(dh!==0)s.push("高さ "+Math.abs(dh)+"mm "+(dh>0?"高い":"低い"));
  if(a.price&&b.price)s.push(dp===0?"価格は同じ":"価格 "+yen(Math.abs(dp))+(dp>0?" 高い":" 安い"));
  return'<li><b>'+esc(b.name)+'</b> は <b>'+esc(a.name)+'</b> より、'+s.join("、")+'</li>'});
 return'<div class="mxdiff"><b>ちがいのまとめ</b><ul>'+L.join("")+'</ul></div>'}
window.ideaCmp={open:cmpOpen,add:function(i){var p=MC[i];var ok=cmpAdd(p);if(ok)toast((p.name)+" を比較に入れました（"+CMP.length+"/3）");return ok},list:function(){return CMP.slice()}};

/* ---------- 接客メモ ---------- */
var TAGS=["ナチュラル","ウォールナット系","シンプル・モダン","コンパクト重視","収納重視","子ども・ペットがいる","搬入が不安","賃貸","新築・引っ越し予定"];
var ST={mode:"local",db:null,uid:null,list:[],ready:null,view:"list",cur:null,f:"",only:false};
var LS="idea-memo-v1";
function lsGet(){try{return JSON.parse(localStorage.getItem(LS)||"[]")}catch(e){return window.__mxmem||[]}}
function lsSet(l){try{localStorage.setItem(LS,JSON.stringify(l))}catch(e){window.__mxmem=l}}
function doc(){return ST.db.doc("data/users/"+ST.uid+"/idea_memo")}
function init(){if(ST.ready)return ST.ready;
 ST.ready=(window.claude&&window.claude.use?Promise.all([window.claude.use("db"),window.claude.use("user")]):Promise.resolve([null,null])).then(function(r){
  if(!r[0]||!r[1])return;return r[1].id().then(function(id){if(id){ST.db=r[0];ST.uid=String(id);ST.mode="cloud"}})}).catch(function(){}).then(function(){
  if(ST.mode==="cloud")return doc().get().then(function(d){ST.list=(d.exists&&d.data().list)||[]}).catch(function(){ST.mode="local";ST.list=lsGet()});
  ST.list=lsGet()});return ST.ready}
function persist(){if(ST.mode==="cloud")return doc().set({list:ST.list,at:new Date().toISOString()}).catch(function(){ST.mode="local";lsSet(ST.list);toast("Claudeアカウントに保存できなかったので、この端末に保存しました")});lsSet(ST.list);return Promise.resolve()}
function today(){var d=new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function uid(){return"m"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function memoOpen(){lock(true);var e=ovl("mxmemo","接客メモ","mxfull");e.hidden=false;e.innerHTML='<div class="mxin2"><p class="mxe">読み込んでいます…</p></div>';
 init().then(function(){ST.view="list";mDraw()});
 e.onclick=memoClick;e.oninput=memoInput;e.onchange=memoInput}
function modeNote(){return ST.mode==="cloud"?"あなたのClaudeアカウントに保存されます（ほかの端末でも見られます）":"この端末（このブラウザ）にだけ保存されます。端末やブラウザを変えると見られません。「書き出し」で控えを取れます"}
function mDraw(){var e=q("mxmemo");if(ST.view==="edit")return mEdit();
 var f=norm(ST.f).split(/\s+/).filter(Boolean),L=ST.list.slice().sort(function(a,b){return(b.upd||"")<(a.upd||"")?-1:1}).filter(function(m){var k=norm([m.name,m.room,m.family,m.memo,(m.tags||[]).join(" "),(m.items||[]).map(function(i){return i.name}).join(" ")].join(" "));return f.every(function(x){return k.indexOf(x)>=0})&&(!ST.only||(m.next&&m.next>=today()))});
 var h='<div class="mxin2"><div class="mxh mxsticky"><b>接客メモ</b><span class="mxhs"><button type="button" class="mxb" data-a="exp">書き出し</button><button type="button" class="mxb" data-a="imp">読み込み</button><button type="button" class="mxb pri" data-a="x">閉じる</button></span></div>'+
  '<p class="mxlead">お客さまの部屋・暮らし・好み・提案した商品を残して、次回の来店や相談で見返せます。<br><b>住所・電話番号など、お客さまを特定できる情報は入れないでください。</b>お名前も呼び名（例：「田中さま」「3/2ご来店の新婚ご夫婦」）で。</p>'+
  '<div class="mxtool"><input type="search" class="mxin" id="mxf" placeholder="メモを探す（名前・部屋・商品・タグ）" value="'+esc(ST.f)+'"><label class="mxck"><input type="checkbox" id="mxo"'+(ST.only?" checked":"")+'>次回来店の予定があるものだけ</label><button type="button" class="mxadd" data-a="new">＋ 新しいメモ</button></div>';
 h+='<div class="mxcards">'+(L.map(function(m){return'<button type="button" class="mxcard" data-a="open" data-id="'+esc(m.id)+'"><b>'+esc(m.name||"（呼び名なし）")+'</b><span>'+esc([m.visit&&("来店 "+m.visit),m.next&&("次回 "+m.next)].filter(Boolean).join("　"))+'</span><span>'+esc([m.room,m.family].filter(Boolean).join("／")||"部屋・暮らしは未入力")+'</span>'+((m.items&&m.items.length)?'<span class="mxit">提案：'+esc(m.items.slice(0,3).map(function(i){return i.name}).join("、"))+(m.items.length>3?" ほか"+(m.items.length-3)+"点":"")+'</span>':"")+((m.tags&&m.tags.length)?'<span class="mxtg">'+m.tags.map(function(t){return'<i>'+esc(t)+'</i>'}).join("")+'</span>':"")+'</button>'}).join("")||'<p class="mxe">'+(ST.list.length?"条件に合うメモがありません。":"まだメモがありません。「＋ 新しいメモ」から作れます。")+'</p>')+'</div>'+
  '<p class="mxnote">'+esc(modeNote())+'</p><input type="file" id="mxfile" accept="application/json,.json" hidden></div>';
 e.innerHTML=h}
function mEdit(){var m=ST.cur,e=q("mxmemo");
 var h='<div class="mxin2"><div class="mxh mxsticky"><b>'+(m._new?"新しいメモ":"メモを編集")+'</b><span class="mxhs"><button type="button" class="mxb" data-a="list">一覧へ</button><button type="button" class="mxb pri" data-a="save">保存</button></span></div>'+
  '<div class="mxform">'+
  fld("呼び名","name",m.name,"例：田中さま／新婚ご夫婦")+
  '<div class="mxg2">'+fld("来店日","visit",m.visit,"","date")+fld("次回来店の予定","next",m.next,"","date")+'</div>'+
  '<div class="mxg2">'+fld("間取り・部屋","room",m.room,"例：1LDK／リビング8畳")+fld("暮らし","family",m.family,"例：2人＋猫／小学生の子ども1人")+'</div>'+
  '<div class="mxg3">'+fld("部屋の幅 mm","rw",m.rw,"","number")+fld("奥行 mm","rd",m.rd,"","number")+fld("天井高 mm","rh",m.rh,"","number")+'</div>'+
  fld("ご予算（円）","budget",m.budget,"例：150000","number")+
  '<div class="mxlbl">好み・条件</div><div class="mxtags">'+TAGS.map(function(t){return'<button type="button" class="'+((m.tags||[]).indexOf(t)>=0?"on":"")+'" data-a="tag" data-t="'+esc(t)+'">'+esc(t)+'</button>'}).join("")+'</div>'+
  '<div class="mxlbl">提案した商品</div><div class="mxitems">'+((m.items||[]).map(function(i,k){return'<div class="mxrow2"><span><b>'+esc(i.name)+'</b><small>'+(i.w?'W'+i.w+' × D'+i.d+' × H'+i.h+' mm　':'')+(i.price?yen(i.price):"")+'</small></span><button type="button" class="mxrm" data-a="rmi" data-k="'+k+'" aria-label="はずす">×</button></div>'}).join("")||'<p class="mxe" style="text-align:left;padding:4px 0">まだありません</p>')+'</div>'+
  '<button type="button" class="mxadd" data-a="addi">＋ 商品を追加</button>'+
  '<label class="mxfld"><span>メモ（好み・気になっていること・次回までの宿題）</span><textarea id="mx_memo" rows="6">'+esc(m.memo||"")+'</textarea></label>'+
  '<div class="mxbtns"><button type="button" class="mxb" data-a="copy">テキストをコピー</button>'+(m._new?"":'<button type="button" class="mxb dng" data-a="del">このメモを削除</button>')+'</div>'+
  '<p class="mxnote">'+esc(modeNote())+'</p></div></div>';e.innerHTML=h}
function fld(l,k,v,ph,type){return'<label class="mxfld"><span>'+l+'</span><input id="mx_'+k+'" class="mxin" type="'+(type||"text")+'" value="'+esc(v==null?"":v)+'"'+(ph?' placeholder="'+esc(ph)+'"':"")+(type==="number"?' inputmode="numeric"':"")+'></label>'}
function grab(){var m=ST.cur;["name","visit","next","room","family","budget","rw","rd","rh"].forEach(function(k){var e=q("mx_"+k);if(e)m[k]=e.value.trim?e.value.trim():e.value});var t=q("mx_memo");if(t)m.memo=t.value}
function toText(m){var L=["【接客メモ】"+(m.name||"（呼び名なし）")];if(m.visit)L.push("来店日："+m.visit);if(m.next)L.push("次回来店：" + m.next);if(m.room)L.push("間取り・部屋："+m.room);if(m.rw||m.rd||m.rh)L.push("部屋の寸法：幅"+(m.rw||"?")+" × 奥行"+(m.rd||"?")+" × 天井高"+(m.rh||"?")+" mm");if(m.family)L.push("暮らし："+m.family);if(m.budget)L.push("ご予算："+yen(+m.budget));if(m.tags&&m.tags.length)L.push("好み・条件："+m.tags.join("、"));
 if(m.items&&m.items.length){L.push("提案した商品：");m.items.forEach(function(i){L.push("・"+i.name+(i.w?"（W"+i.w+"×D"+i.d+"×H"+i.h+"mm）":"")+(i.price?" "+yen(i.price):"")+(i.jan?" JAN "+i.jan:""))})}if(m.memo)L.push("メモ："+m.memo);return L.join("\n")}
function copy(t){try{if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t).then(function(){toast("コピーしました")},function(){fb()})}catch(x){}fb();function fb(){var a=document.createElement("textarea");a.value=t;a.style.cssText="position:fixed;left:-999px";document.body.appendChild(a);a.select();try{document.execCommand("copy");toast("コピーしました")}catch(x){toast("コピーできませんでした")}a.remove()}}
function memoInput(ev){var t=ev.target;if(t.id==="mxf"){ST.f=t.value;var pos=t.selectionStart;mDraw();var n=q("mxf");if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}}
 else if(t.id==="mxo"){ST.only=t.checked;mDraw()}
 else if(t.id==="mxfile"&&t.files&&t.files[0]&&ev.type==="change"){var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result),L=Array.isArray(d)?d:d.list;if(!Array.isArray(L))throw 0;var have={};ST.list.forEach(function(m){have[m.id]=1});var n=0;L.forEach(function(m){if(m&&m.id&&!have[m.id]){ST.list.push(m);n++}});persist().then(function(){toast(n+"件を読み込みました");mDraw()})}catch(x){toast("読み込めませんでした（書き出したファイルを選んでください）")}};r.readAsText(t.files[0])}}
function memoClick(ev){var b=ev.target.closest("[data-a]");if(!b)return;var a=b.getAttribute("data-a"),e=q("mxmemo");
 if(a==="x"){e.hidden=true;lock(false);back("top")}
 else if(a==="new"){ST.cur={id:uid(),_new:true,visit:today(),tags:[],items:[]};ST.view="edit";mDraw();e.scrollTop=0}
 else if(a==="open"){var m=ST.list.filter(function(x){return x.id===b.getAttribute("data-id")})[0];if(m){ST.cur=JSON.parse(JSON.stringify(m));ST.view="edit";mDraw();e.scrollTop=0}}
 else if(a==="list"){ST.view="list";mDraw()}
 else if(a==="tag"){grab();var t=b.getAttribute("data-t"),i=ST.cur.tags.indexOf(t);if(i>=0)ST.cur.tags.splice(i,1);else ST.cur.tags.push(t);b.classList.toggle("on")}
 else if(a==="addi"){grab();pickOpen(function(p){ST.cur.items.push({name:p.name,jan:p.jan,w:p.w,d:p.d,h:p.h,price:p.price||0,url:p.url||""});mDraw()},"提案した商品を追加")}
 else if(a==="rmi"){grab();ST.cur.items.splice(+b.getAttribute("data-k"),1);mDraw()}
 else if(a==="copy"){grab();copy(toText(ST.cur))}
 else if(a==="save"){grab();var m2=ST.cur;if(!m2.name){toast("呼び名を入れてください");var n=q("mx_name");if(n)n.focus();return}
  m2.upd=new Date().toISOString();delete m2._new;var k=-1;ST.list.forEach(function(x,i){if(x.id===m2.id)k=i});if(k>=0)ST.list[k]=m2;else ST.list.push(m2);
  persist().then(function(){toast("保存しました");ST.view="list";mDraw();e.scrollTop=0})}
 else if(a==="del"){if(!confirm("このメモを削除します。元に戻せません。よろしいですか？"))return;ST.list=ST.list.filter(function(x){return x.id!==ST.cur.id});persist().then(function(){toast("削除しました");ST.view="list";mDraw()})}
 else if(a==="exp"){var blob=new Blob([JSON.stringify({app:"idea-memo",at:new Date().toISOString(),list:ST.list},null,1)],{type:"application/json"}),u=URL.createObjectURL(blob),l=document.createElement("a");l.href=u;l.download="idea-接客メモ-"+today()+".json";document.body.appendChild(l);l.click();setTimeout(function(){l.remove();URL.revokeObjectURL(u)},500)}
 else if(a==="imp"){var f=q("mxfile");if(f){f.value="";f.click()}}}
window.ideaMemo={open:memoOpen};
})();
