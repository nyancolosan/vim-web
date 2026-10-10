/* ===== idea（旧 POAD / MUJI Store Assistant / VIM for MUJI staff。店舗スタッフ向け・H&B・住空間（部屋づくり・カーテン見積）・素材図鑑） =====
 * VIM 本体の上に重ねて動く追加分。VIM 本体には入らない（_dev/editions/muji/build_muji.py で別ファイルに組み立てる）。
 * ・プランの切り替えなし（全機能）・白地にエンジのテーマ
 * ・はじめの画面を「接客」「売場（vmd）」に
 * ・無印良品ネットストアの家具（スナップショット）を検索して、実寸のまま置ける
 * ・見積書に JAN コードを載せる */
(function(){
var MC=window.MUJI_CATALOG||[],AT=window.MUJI_CATALOG_AT||"";
var q=function(i){return document.getElementById(i)},esc2=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
document.documentElement.classList.add("ed-muji");
/* 1) 全機能・課金なし */
try{setTier("pro",true)}catch(e){}
/* 2) 白地にエンジのテーマ（カーテン見積と同じ色） */
var RED="#9f2a37",WHITE={"--bg":"#ffffff","--card":"#ffffff","--fill":"#ffffff","--line":"#e3dfdf","--ink":"#333333","--sub":"#7d7778","--accbg":"#f9eef0","--head":"#ffffff","--headink":"#333333","--logo":"#ffffff","--logobg":RED,"--headline":"#e3dfdf","--hi":RED,"--hiink":"#ffffff","--segon":RED,"--segink":"#ffffff"};
function red(){try{var V=themeVars(RED),r=document.documentElement;Object.keys(WHITE).forEach(function(k){V[k]=WHITE[k]});Object.keys(V).forEach(function(k){r.style.setProperty(k,V[k])});var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute("content",RED)}catch(e){}}
if(typeof setTheme==="function"){var oST=setTheme;setTheme=function(){var r=oST.apply(this,arguments);red();return r}}red();
/* 3) 見出し */
/* （ロゴが idea になったので、文字のラベルは付けない） */
/* 4) はじめの画面：接客／売場 */
var rb=document.querySelector('#stmk [data-k="room"]'),vb=document.querySelector('#stmk [data-k="vmd"]');
if(rb)rb.innerHTML='接客<small>お客さまのお部屋</small>';if(vb)vb.innerHTML='売場づくり<small>vmd・什器</small>';
var st=q("stmt");if(st)st.textContent="今日はどちらに使いますか？";

/* 5) 無印良品の商品をさがす */
var CATS=[["all","すべて"],["sofa","ソファ"],["table","テーブル"],["lt","ローテーブル"],["desk","デスク"],["chair","チェア"],["bench","スツール・ベンチ"],["bed","ベッド"],["shelf","収納"],["rug","ラグ"],["plant","観葉植物"]];
var S={cat:"all",q:"",w:"",d:"",sort:"rec",place:true};
function norm(s){return String(s||"").replace(/[！-～]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-65248)}).replace(/　/g," ").toLowerCase()}
MC.forEach(function(p,i){p._i=i;p._k=norm(p.name+" "+(p.sub||"")+" "+(p.note||"")+" "+p.jan)});
function wood(n){return/ウォールナット/.test(n)?"walnut":/オーク/.test(n)?"oak":/タモ|アッシュ/.test(n)?"ash":/パイン/.test(n)?"pine":/ラバーウッド/.test(n)?"rubber":/チーク/.test(n)?"teak":/メープル/.test(n)?"maple":/ブナ/.test(n)?"beech":/チェリー/.test(n)?"cherry":/スチール|ステンレス/.test(n)?"":"oak"}
/* 商品 → VIM の家具（形は近いものを選び、寸法は商品のまま） */
function toItem(p){if(p.cat==="plant"){var pl={name:p.name,w:p.w,d:p.d,h:p.h,kind:"p",fs:"g"};if(p.sp){pl.sp=p.sp;pl.pot=p.pot}else pl.shape=p.shape||"r";return pl}
 var n=p.name,w=wood(n),o={name:n,w:p.w,d:p.d,h:p.h,price:p.price||"",jan:p.jan,url:p.url};if(w)o.wtex=w;
 var m=window.mjShape?mjShape(p):null;if(m&&m.f4){o.f4=m.f4;o.fs=m.fs;o.mj=m.mj;if(m.col)o.col=m.col;if(m.wtex)o.wtex=m.wtex;o.mjv=2;if(m.f4==="round"||m.f4==="bent")o.wtex=w||"oak";if(/スチール|ステンレス/.test(n)&&!/材棚|天板|材デスク/.test(n))delete o.wtex}
 else o.fs={sofa:"sofa",table:"table",lt:"lt",desk:"desk",chair:"chair",bench:"bench",bed:"bed",shelf:"shelf",rug:"g"}[p.cat]||"shelf";
 return o}
/* 以前に置いた無印良品の商品も、新しい3Dモデルに */
(function(){try{var ch=0,J={};MC.forEach(function(p){J[p.jan]=p});items.forEach(function(it){var p=it&&it.jan&&J[it.jan];if(!p||(it.mj&&it.mjv===2))return;var o=toItem(p);["f4","fs","mj","col","wtex","w","h"].forEach(function(k){if(o[k]!==undefined)it[k]=o[k];else delete it[k]});delete it.lay;delete it.layH;it.mjv=2;ch++});if(ch){save();try{render();rplan();after3d()}catch(x){}}}catch(e){}})();
function find(){var t=norm(S.q).split(/\s+/).filter(Boolean),mw=+S.w||0,md=+S.d||0;
 var r=MC.filter(function(p){return(S.cat==="all"||p.cat===S.cat)&&t.every(function(x){return p._k.indexOf(x)>=0})&&(!mw||p.w<=mw)&&(!md||p.d<=md)});
 if(S.sort==="pa")r.sort(function(a,b){return(a.price||9e9)-(b.price||9e9)});else if(S.sort==="pd")r.sort(function(a,b){return(b.price||0)-(a.price||0)});else if(S.sort==="w")r.sort(function(a,b){return a.w-b.w});
 return r}
function yen2(v){return v?"¥"+Math.round(v).toLocaleString("ja-JP"):"価格は商品ページで"}
function draw(){var R=find(),L=q("mjl");q("mjn").textContent=R.length+"件";
 L.innerHTML=R.slice(0,120).map(function(p){return'<div class="mjc"><div class="mjm"><b>'+esc2(p.name)+'</b><span>W'+p.w+' × D'+p.d+' × H'+p.h+' mm'+(p.sub?'　'+esc2(p.sub):'')+'</span><span class="mjp">'+(p.cat==='plant'?'VIMの観葉植物':yen2(p.price))+'</span></div>'+
  '<div class="mjb"><button type="button" class="pri" data-mp="'+p._i+'">'+(S.place?"置く":"一覧に追加")+'</button>'+'<button type="button" class="mjcmp" data-cp="'+p._i+'">比べる</button>'+(p.url?'<a href="'+esc2(p.url)+'" target="_blank" rel="noopener">商品ページ</a>':'')+'</div></div>'}).join("")||'<p class="mje">見つかりませんでした。言葉を短くするか、幅・奥行の上限を外してください。</p>';wire()}
function open(place){S.place=place!==false;q("mjs").hidden=false;q("mjst").hidden=true;q("mjt").textContent=S.place?"無印良品の商品を置く":"無印良品の商品を一覧に追加";draw();if(!("ontouchstart" in window))setTimeout(function(){try{q("mjq").focus({preventScroll:true})}catch(e){}},60)}
var box=document.createElement("div");box.id="mjs";box.className="mdl";box.hidden=true;box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");box.setAttribute("aria-labelledby","mjt");
box.innerHTML='<div class="dbox mjbox"><div class="m3h"><b id="mjt">無印良品の商品を置く</b><button id="mjx" class="ib" type="button">閉じる</button></div>'+
 '<input id="mjq" type="search" placeholder="商品名・素材・JANで探す（例：オーク 2シーター）" autocomplete="off">'+
 '<div class="mjcats" id="mjcats">'+CATS.map(function(c){return'<button type="button" data-c="'+c[0]+'"'+(c[0]==="all"?' class="on"':'')+'>'+c[1]+'</button>'}).join("")+'</div>'+
 '<div class="mjf"><label>幅 ≤<input id="mjw" type="number" inputmode="numeric" placeholder="mm"></label><label>奥行 ≤<input id="mjd" type="number" inputmode="numeric" placeholder="mm"></label><label>並び<select id="mjo"><option value="rec">おすすめ</option><option value="pa">価格の安い順</option><option value="pd">価格の高い順</option><option value="w">幅の小さい順</option></select></label></div>'+
 '<div id="mjst" class="mjst" hidden></div><div class="mjh"><span id="mjn"></span><button type="button" id="mjcmpo" class="mjlink">比較を見る</button><button type="button" id="mjg" class="mjlink">ほかの家具（形だけ）から選ぶ</button></div><div id="mjl" class="mjlist"></div>'+
 '<p class="mjnote">'+esc2(AT)+'時点の無印良品ネットストアの情報（'+MC.length+'点）。価格・在庫・仕様は変わることがあります。お客さまには商品ページで最新をご確認ください。形は近い3Dで表示し、寸法は商品のままです。</p></div>';
document.body.appendChild(box);
q("mjx").onclick=function(){box.hidden=true};box.addEventListener("click",function(e){if(e.target===box)box.hidden=true});
q("mjq").addEventListener("input",function(e){S.q=e.target.value;draw()});
q("mjw").addEventListener("input",function(e){S.w=e.target.value;draw()});q("mjd").addEventListener("input",function(e){S.d=e.target.value;draw()});
q("mjo").addEventListener("change",function(e){S.sort=e.target.value;draw()});
q("mjcats").onclick=function(e){var b=e.target.closest("[data-c]");if(!b)return;S.cat=b.getAttribute("data-c");[].forEach.call(q("mjcats").children,function(x){x.className=x===b?"on":""});draw()};
q("mjcmpo").onclick=function(){box.hidden=true;window.ideaCmp&&ideaCmp.open()};
q("mjg").onclick=function(){box.hidden=true;TPLPLACE=S.place;var lb=q("tpla")&&q("tpla").querySelector(".lb");if(lb)lb.textContent=S.place?"部屋に置く":"一覧に追加";tplOpen()};
/* 置く：スマホではキーボードが閉じて並びがずれ、タップが外れやすいので、押した時点で決める */
function say(m,bad){var e=q("mjst");if(!e)return;e.textContent=m;e.className="mjst "+(bad?"bad":"ok");e.hidden=false}
function act(b){say("押しました。配置しています…");var p=MC[+b.getAttribute("data-mp")];if(!p){say("商品が見つかりません",1);return}
 var k=-1;try{try{document.activeElement&&document.activeElement.blur()}catch(x){}
  if(!plan||typeof plan!=="object")plan={rw:4000,rd:3000,p:[]};["p","o","hm","cut","fl","views","cols","bms"].forEach(function(z){if(!Array.isArray(plan[z]))plan[z]=[]});if(!plan.rw)plan.rw=4000;if(!plan.rd)plan.rd=3000;if(!Array.isArray(items))items=[];
  var o=toItem(p);k=placeTpl(o);
  if(items[k]&&p.jan){items[k].jan=p.jan;items[k].url=p.url;if(p.price)items[k].price=p.price;try{save()}catch(x){}}
 }catch(err){say("置けませんでした（配置）："+(err&&err.message||err),1);return}
 box.hidden=true;try{["stm","tpl","dlg"].forEach(function(i){var e=document.getElementById(i);if(e&&e.classList.contains("mdl"))e.hidden=true})}catch(x){}
 try{if(document.getElementById("v2").hidden)tab(2)}catch(x){}try{render()}catch(x){}try{rplan()}catch(x){}try{after3d()}catch(x){}
 try{toast(p.name+" を置きました。ドラッグで動かせます。")}catch(x){}}
q("mjl").addEventListener("click",function(e){var b=e.target.closest("[data-cp]");if(!b||!window.ideaCmp)return;if(ideaCmp.add(+b.getAttribute("data-cp")))b.textContent="比較に入れた"});
/* ボタンごとに直接つける（親での振り分けをやめる）。touchend と click の二重実行は防ぐ */
var lastAct=0;
function wire(){[].forEach.call(q("mjl").querySelectorAll("[data-mp]"),function(b){
 var go=function(){var n=Date.now();if(n-lastAct<600)return;lastAct=n;act(b)};
 b.addEventListener("click",go);b.addEventListener("touchend",function(){go()},{passive:true})})}
/* 「家具を置く」「家具を追加」は無印良品の商品から */
["plb","plb3"].forEach(function(id){var b=q(id);if(b)b.onclick=function(){open(true)}});
var tb=q("tplb");if(tb){tb.onclick=function(){open(true)};var l1=tb.querySelector(".lb"),s1=tb.querySelector("small");if(l1)l1.textContent="無印良品の商品を置く";if(s1)s1.textContent="ネットストアの家具を、名前やサイズで探せます"}
["plb","plb3"].forEach(function(id){var b=q(id),l=b&&b.querySelector(".lb");if(l)l.textContent="無印良品の商品を置く";else if(b&&!b.children.length)b.textContent="無印良品の商品を置く"});
/* ロゴの下にアプリ名 */[].forEach.call(document.querySelectorAll(".stmbrand,.verlogo"),function(el){if(el.querySelector(".mjsub"))return;var t=document.createElement("small");t.className="mjsub";t.textContent="supported by VIM";el.appendChild(t)});
/* 6) 見積書に JAN コード */
if(typeof dimText==="function"){var oDT=dimText;dimText=function(it){var r=oDT(it),th=window.mjTotalH&&mjTotalH(it);if(th)r=r.concat([(window.mjLegName?mjLegName(it):"脚")+"込みの総高さ H"+Math.round(th)+" mm"]);if(it&&it.f4==="mjssh"&&it.lay==="h")r=r.concat(["横置き"]);if(it&&it.jan)r=r.concat(["JAN "+it.jan]);return r}}
/* 棚の詳細に「置き方（縦置き・横置き）」を出す（スタッキングシェルフ） */
function layUI(){try{items.forEach(function(it,i){if(!it||it.f4!=="mjssh")return;var g=document.getElementById("grid");if(!g||g.querySelector('select[data-f="lay"][data-i="'+i+'"]'))return;var a=g.querySelector('select[data-f="st"][data-i="'+i+'"]');var host=a&&a.closest("label");if(!host)return;
 var l=document.createElement("label");l.innerHTML='置き方<select data-f="lay" data-i="'+i+'"><option value="v"'+(it.lay==="h"?"":" selected")+'>縦置き</option><option value="h"'+(it.lay==="h"?" selected":"")+'>横置き</option></select>';host.parentNode.insertBefore(l,host)})}catch(e){}}
if(typeof render==="function"){var oRender=render;render=function(){var r=oRender.apply(this,arguments);layUI();mjPrune();return r}}
/* ===== 接客・売場づくりに必要なものだけ残す（保存・渡すは保存に関わるものだけ） ===== */
function mjPrune(){try{
 [].forEach.call(document.querySelectorAll("#v4 details.fold"),function(d){var s=d.querySelector("summary");if(s&&/案を比べる/.test(s.textContent))d.classList.add("mj-cmp")});
 [].forEach.call(document.querySelectorAll("#v5 details.fold"),function(d){var s=d.querySelector("summary");if(s&&/画像生成AI/.test(s.textContent))d.classList.add("mj-ai");if(s&&/その他の書き出し/.test(s.textContent)){s.textContent="そのほかの画像";d.open=true}});
 var g=document.getElementById("setgd");g=g&&g.closest(".setg");if(g)g.classList.add("mj-guide");
 var ld=document.querySelector("#v5>p.lead");if(ld)ld.textContent="プランを画像やPDFにして、この端末に保存します。";
 var l4=document.querySelector("#v4 details.fold:not(.mj-cmp):not(#syncf) summary");
 /* 無印良品の商品は、種類・カテゴリ・棚のタイプ・段数を固定（商品のまま） */
 items.forEach(function(it,i){if(!it||!(it.jan||it.mjv))return;["kind","fs","st"].forEach(function(f){var e=document.querySelector('#grid select[data-f="'+f+'"][data-i="'+i+'"]');var l=e&&e.closest("label");if(l)l.style.display="none"});
  var tp=document.querySelector('#grid .tpk[data-i="'+i+'"]');if(tp)tp.style.display="none";var t=document.querySelector('#grid input[data-f="tiers"][data-i="'+i+'"]');var td=t&&t.closest(".dims");if(td)td.style.display="none"});
}catch(e){}}
mjPrune();
/* 置き方（縦・横）を変えたら幅と高さを入れ替える */
(function(){var g=document.getElementById("grid");if(!g)return;g.addEventListener("change",function(e){var t=e.target,i=t.getAttribute&&t.getAttribute("data-i"),f=t.getAttribute&&t.getAttribute("data-f");if(i===null||f!=="lay")return;var it=items[+i];if(!it)return;it.lay=t.value;if(window.mjLay&&mjLay(it)){save();try{render();rplan();after3d()}catch(x){}}else save()})})();

/* ===== idea：はじめの選択画面と、オーダーカーテン見積・H&B・素材図鑑（同じフォルダのページを全画面で重ねる） ===== */
(function(){
var IC={
 room:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 20 24 7l18 13"/><path d="M10 17v24h28V17"/><path d="M15 34v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6"/><path d="M13 34h22v4H13z"/><path d="M15 38v3M33 38v3"/></svg>',
 curtain:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h38"/><circle cx="5" cy="7" r="1.6"/><circle cx="43" cy="7" r="1.6"/><path d="M9 8c0 10 6 14 6 18s-4 7-6 13h11V8"/><path d="M39 8c0 10-6 14-6 18s4 7 6 13H28V8"/><path d="M12 26h5M31 26h5"/><path d="M14 13v5M33 13v5" opacity=".5"/></svg>',
 hb:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 6h10v6H19z"/><path d="M17 12h14a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z"/><path d="M14 22h20M14 34h20" opacity=".5"/><path d="M24 25.5c1.8 0 3 1.2 3 2.6 0 1.6-1.4 2.8-3 2.8s-3-1.2-3-2.8c0-1.4 1.2-2.6 3-2.6z"/></svg>',
 living:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="20" height="17" rx="1.5"/><path d="M17 7v17M7 15.5h20"/><path d="M5 7h24" /><path d="M9 34v-4a3 3 0 0 1 3-3h24a3 3 0 0 1 3 3v4"/><path d="M7 34h34v5H7z"/><path d="M10 39v3M38 39v3"/><path d="M33 7v14M30 21h6"/></svg>',
 know:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="11" width="20" height="28" rx="3" transform="rotate(-12 16 25)"/><rect x="20" y="8" width="21" height="30" rx="3"/><path d="M25 15h11M25 21h11M25 27h7" opacity=".55"/><circle cx="30.5" cy="33" r="1.4"/></svg>',
 idee:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 24c0-5 3-8 8-8h12c5 0 8 3 8 8v5H10z"/><path d="M6 25a3 3 0 0 1 4-1v10H6zM42 25a3 3 0 0 0-4-1v10h4z"/><path d="M6 34h36v3H6z"/><path d="M11 37l-1 5M37 37l1 5"/><circle cx="24" cy="9" r="2"/></svg>',
 shelf:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5v38M39 5v38"/><path d="M9 13h30M9 24h30M9 35h30"/><path d="M14 13v-5h7v5M27 24v-7h6v7M15 35v-6h10v6"/></svg>',
 memo:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6h20l6 6v30H12z"/><path d="M32 6v6h6"/><path d="M18 21h14M18 28h14M18 35h8"/></svg>',
 cmp:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="14" width="16" height="26" rx="2"/><rect x="27" y="8" width="16" height="32" rx="2"/><path d="M10 22h6M32 16h6M32 24h6" opacity=".6"/></svg>',
 cloth:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 7l-11 6 4 8 5-2v21h18V19l5 2 4-8-11-6c-1 3-3 5-7 5s-6-2-7-5z"/></svg>',
 map:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 12l10-4 12 4 10-4v28l-10 4-12-4-10 4z"/><path d="M18 8v28M30 12v28"/></svg>',
 menu:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>'};
/* --- 全画面で重ねるページ（curtain.html・knowledge.html）--- */
var subs={},cur=null,timer=null;
function closeSub(back){var was=cur;if(cur&&subs[cur])subs[cur].el.hidden=true;cur=null;document.documentElement.style.overflow="";if(back!==false)showHome(was==="curtain"||was==="idee"||was==="shelf"?"living":"top")}
function openSub(k){var src={curtain:"curtain.html",know:"knowledge.html",hb:"hb.html",idee:"idee.html",shelf:"shelf.html",clothing:"clothing.html",map:"map.html"}[k],title={curtain:"オーダーカーテン見積",know:"素材図鑑",hb:"H&B",idee:"IDEE",shelf:"オーダー収納の見積り",clothing:"衣服",map:"店舗マップ（試験運用）"}[k];
 hideHome();var st=q("stm");if(st)st.hidden=true;
 if(!subs[k]){var el=document.createElement("div");el.className="mjsub-ov";el.setAttribute("role","dialog");el.setAttribute("aria-label",title);
  el.innerHTML='<div class="mjsubf" hidden>'+title+'をここで開けませんでした。<br><a href="'+src+'" target="_blank" rel="noopener">別のタブで開く</a><br><button type="button" class="ib">メニューに戻る</button></div><iframe src="'+src+'" title="'+title+'"></iframe>';
  document.body.appendChild(el);el.querySelector(".mjsubf button").onclick=function(){closeSub()};
  subs[k]={el:el,ready:false};var me=subs[k];setTimeout(function(){if(!me.ready)el.querySelector(".mjsubf").hidden=false},6000)}
 cur=k;subs[k].el.hidden=false;document.documentElement.style.overflow="hidden"}
window.addEventListener("message",function(e){var d=e.data||{},k=null;Object.keys(subs).forEach(function(x){try{if(subs[x].el.querySelector("iframe").contentWindow===e.source)k=x}catch(_){}});
 if(d.mj==="sub-ready"&&k){if(k==="map"){try{e.source.postMessage({mj:"store",no:getStore()},"*")}catch(_){}}subs[k].ready=true;subs[k].el.querySelector(".mjsubf").hidden=true}
 if(d.mj==="sub-close")closeSub()});
/* --- はじめの選択画面 --- */
var home=document.createElement("div");home.id="ideahome";home.setAttribute("role","dialog");home.setAttribute("aria-label","MUJI STORE app メニュー");
home.innerHTML='<div class="phin"><div class="phlogo" role="img" aria-label="MUJI STORE app"></div>'+
 '<p class="phq" id="phq">今日は何をしますか？</p><div class="phgrid" id="phgrid"></div>'+
 '<section class="nw" id="nw" aria-labelledby="nwt"></section><div class="phst" id="phst"></div><p class="phsup">supported by VIM</p></div>';
/* はじめの画面：H&B・住空間・素材図鑑。住空間を押すと、家具を置く／オーダーカーテンの2つが出る */
var MENU={top:[["hb",IC.hb,"H&amp;B（ヘルス&amp;ビューティー）","肌の悩みや好みから、おすすめのスキンケアと使い方を出す"],
  ["clothing",IC.cloth,"衣服（モック）","サイズ診断・実寸比較・お手入れ・在庫と取り置き・コーデ。あったら便利な機能を試せる"],
  ["living",IC.living,"住空間","部屋に家具を置く・カーテンや収納の見積り・IDEE"],
  ["map",IC.map,"店舗マップ（試験運用）","売り場の場所を、案内板と同じ見た目の図で探す"],
  ["know",IC.know,"素材図鑑","木材・繊維・樹脂・金属・焼き物など、素材の特長と接客のひとこと"],
  ["memo",IC.memo,"接客メモ","お客さまの部屋・好み・提案した商品を残して、次の来店で見返す"]],
 living:[["room",IC.room,"部屋に家具を置く","間取りに無印良品の家具を実寸で置いて、3Dで確かめる"],
  ["curtain",IC.curtain,"オーダーカーテンの見積り","生地を選んでサイズを入れると、金額と見積書をつくる"],
  ["cmp",IC.cmp,"商品を比べる","2〜3点を並べて、サイズ・価格・素材・向く人を見る"],
  ["idee",IC.idee,"IDEE（イデー）","わかりにくい名前の家具を、読み方・サイズ・向く人でひと目で"],
  ["shelf",IC.shelf,"オーダー収納の見積り","SUSの棚板やスタッキングシェルフを、サイズを入れて金額まで"]]};
function menu(lv){var g=home.querySelector("#phgrid"),qq=home.querySelector("#phq");
 qq.innerHTML=lv==="living"?'<button type="button" class="phback" data-go="top" aria-label="はじめの画面に戻る"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>戻る</button><span>住空間</span>':"今日は何をしますか？";
 g.innerHTML=MENU[lv].map(function(m){return'<button type="button" class="phc" data-go="'+m[0]+'"><span class="phi">'+m[1]+'</span><span><b>'+m[2]+'</b><small>'+m[3]+'</small></span>'+(m[0]==="living"?'<svg class="phgo" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>':'')+'</button>'}).join("");
 home.querySelector("#nw").hidden=lv!=="top"}
menu("top");
document.body.appendChild(home);
/* --- 新商品（ネットストアの各カテゴリで NEW 表記のもの。build_muji.py が news/news.json を埋め込む） --- */
(function(){var N=window.IDEA_NEWS,box=home.querySelector("#nw");if(!N||!box||!N.items||!N.items.length){if(box)box.hidden=true;return}
 var CI={furniture:'<path d="M7 11V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5"/><path d="M5 11h14v4H5z"/><path d="M6 15v5M18 15v5"/>',
  storage:'<rect x="4" y="6" width="16" height="13" rx="1.5"/><path d="M4 11h16M10 8.5h4M10 14h4"/>',
  bedding:'<path d="M3 18v-6h18v6M3 15h18M3 18v2M21 18v2"/><rect x="5" y="8" width="6" height="4" rx="1.5"/>',
  apparel:'<path d="M9 4 3 7l2 4 2-1v10h10V10l2 1 2-4-6-3c-.5 1.5-1.6 2.5-3 2.5S9.5 5.5 9 4z"/>',
  interior:'<rect x="5" y="5" width="14" height="14" rx="4"/><path d="M5 12c3 2 11 2 14 0"/>',
  light:'<path d="M9 3h6l3 7H6z"/><path d="M12 10v8M8 20h8"/>',
  kitchen:'<path d="M4 10h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z"/><path d="M2 10h20M9 7c0-1 1-1 1-2M14 7c0-1 1-1 1-2"/>'};
 function ic(c){return'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(CI[c]||CI.interior)+'</svg>'}
 var cn={};N.cats.forEach(function(c){cn[c[0]]=c[1]});var S={c:"all",more:false};
 var d=new Date(N.at+"T00:00:00");var at=(d.getMonth()+1)+"月"+d.getDate()+"日";
 /* 「すべて」はカテゴリを順番に混ぜて並べる（はじめの6件に色々なカテゴリが出るように） */
 var MIX=(function(){var G=N.cats.map(function(c){return N.items.filter(function(it){return it.cat===c[0]})}),o=[],i=0,more=true;while(more){more=false;G.forEach(function(g){if(g[i]){o.push(g[i]);more=true}});i++}return o})();
 function draw(){var L=S.c==="all"?MIX:N.items.filter(function(it){return it.cat===S.c}),M=S.more?L:L.slice(0,6);
  box.innerHTML='<div class="nwh"><b id="nwt">新商品</b><small>'+at+'時点・ネットストア（毎朝10時に更新）</small></div>'+
   '<div class="nwc">'+[["all","すべて",N.items.length]].concat(N.cats.map(function(c){return[c[0],c[1],N.items.filter(function(it){return it.cat===c[0]}).length]})).filter(function(c){return c[2]>0}).map(function(c){return'<button type="button" data-c="'+c[0]+'" class="'+(S.c===c[0]?"on":"")+'">'+esc2(c[1])+'<i>'+c[2]+'</i></button>'}).join("")+'</div>'+
   '<div class="nwl">'+M.map(function(it){return'<a class="nwi" href="'+(it.jan?'https://www.muji.com/jp/ja/store/cmdty/detail/'+esc2(it.jan):esc2(it.url||"https://www.muji.com/jp/ja/store/"))+'" target="_blank" rel="noopener"><span class="nwp">'+ic(it.cat)+'</span><span class="nwm"><b>'+esc2(it.name)+'</b><small>'+esc2(cn[it.cat]||"")+'</small></span><span class="nwy">¥'+Number(it.price).toLocaleString("ja-JP")+(it.from?"〜":"")+'</span></a>'}).join("")+'</div>'+
   (L.length>6?'<button type="button" class="nwm2">'+(S.more?"少なく表示":"すべて見る（"+L.length+"件）")+'</button>':"")+
   '<p class="nwn">商品をタップするとネットストアの商品ページが開き、写真・在庫・最新の価格を確認できます。衣服は、衣服の新着ページが開きます。</p>'}
 box.addEventListener("click",function(e){var b=e.target.closest(".nwc button");if(b){S.c=b.getAttribute("data-c");S.more=false;draw();return}if(e.target.closest(".nwm2")){S.more=!S.more;draw()}});
 draw()})();
try{home.querySelector(".phlogo").innerHTML=vimWord()}catch(e){}
function showHome(lv){home.hidden=false;menu(typeof lv==="string"?lv:"top");document.documentElement.style.overflow="hidden"}
function hideHome(){home.hidden=true;document.documentElement.style.overflow=""}
home.addEventListener("click",function(e){var b=e.target.closest("[data-go]");if(!b)return;var g=b.getAttribute("data-go");if(g==="logout"){setStore("");lgno.value="";lger.hidden=true;lgn.hidden=false;stBar();return}if(g==="top"||g==="living"){menu(g);home.scrollTop=0}else if(g==="room")hideHome();else if(g==="memo"){hideHome();window.ideaMemo&&ideaMemo.open()}else if(g==="cmp"){hideHome();window.ideaCmp&&ideaCmp.open()}else openSub(g)});
/* --- 店舗ログイン（オープニングのあと。6桁の店舗番号） --- */
function getStore(){try{var v=localStorage.getItem("mj-store");return /^\d{6}$/.test(v||"")?v:""}catch(_){return window.__mjStore||""}}
function setStore(v){window.__mjStore=v;try{if(v)localStorage.setItem("mj-store",v);else localStorage.removeItem("mj-store")}catch(_){}}
var lgn=document.createElement("div");lgn.id="idealogin";lgn.setAttribute("role","dialog");lgn.setAttribute("aria-label","店舗ログイン");
lgn.innerHTML='<form class="lgin" novalidate><div class="lgl" role="img" aria-label="MUJI STORE app">MUJI STORE<span>app</span></div><h2>店舗ログイン</h2><p>店舗番号（6桁の数字）を入力してください</p><input id="lgno" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" placeholder="123456" aria-label="店舗番号"><p class="lger" id="lger" role="alert" hidden></p><button type="submit" class="lgb">ログイン</button><small>supported by VIM</small></form>';
document.body.appendChild(lgn);
var lgno=lgn.querySelector("#lgno"),lger=lgn.querySelector("#lger");
lgno.addEventListener("input",function(){this.value=this.value.replace(/[０-９]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-65248)}).replace(/\D/g,"").slice(0,6);lger.hidden=true});
lgn.querySelector("form").addEventListener("submit",function(e){e.preventDefault();var v=lgno.value;if(!/^\d{6}$/.test(v)){lger.textContent="6桁の数字で入力してください（例：123456）";lger.hidden=false;lgno.focus();return}
 setStore(v);lgn.hidden=true;stBar();var hh=(location.hash||"").slice(1);if(hh==="curtain"||hh==="know"||hh==="hb"||hh==="idee"||hh==="shelf"||hh==="clothing"||hh==="map")openSub(hh)});
function stBar(){var b=home.querySelector("#phst");if(!b)return;var n=getStore();b.innerHTML=n?'<span>店舗番号 <b>'+n+'</b></span><button type="button" data-go="logout">店舗を変更</button>':""}
/* ヘッダーに「メニュー」、ロゴを押してもメニューへ */
var hb=document.querySelector("h1 .hbt"),th=q("thb");
if(hb&&!q("ideamenu")){var b=document.createElement("button");b.id="ideamenu";b.className="hb";b.type="button";b.setAttribute("aria-label","メニュー");b.innerHTML=IC.menu+"メニュー";b.onclick=showHome;hb.insertBefore(b,th&&th.parentNode===hb?th:null)}
var lg=document.querySelector("h1 .vlogo");if(lg){lg.style.cursor="pointer";lg.addEventListener("click",showHome)}
window.ideaMenu=showHome;window.mjCurtainOpen=function(){openSub("curtain")};
if(getStore())lgn.hidden=true;else lgn.hidden=false;stBar();
var h=(location.hash||"").slice(1);if(!getStore()){showHome()}else if(h==="curtain"||h==="know"||h==="hb"||h==="idee"||h==="shelf"||h==="clothing"||h==="map")openSub(h);else if(h==="room")hideHome();else if(h==="living")showHome("living");else showHome();
})();
window.mujiOpen=open;window.__toItem=toItem;
})();
