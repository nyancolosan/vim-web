/* ===== VIM for MUJI staff（店舗スタッフ向け・接客と売場づくり） =====
 * VIM 本体の上に重ねて動く追加分。VIM 本体には入らない（_dev/editions/muji/build_muji.py で別ファイルに組み立てる）。
 * ・プランの切り替えなし（全機能）・赤のテーマ
 * ・はじめの画面を「接客」「売場（vmd）」に
 * ・無印良品ネットストアの家具（スナップショット）を検索して、実寸のまま置ける
 * ・見積書に JAN コードを載せる */
(function(){
var MC=window.MUJI_CATALOG||[],AT=window.MUJI_CATALOG_AT||"";
var q=function(i){return document.getElementById(i)},esc2=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
document.documentElement.classList.add("ed-muji");
/* 1) 全機能・課金なし */
try{setTier("pro",true)}catch(e){}
/* 2) 赤のテーマ */
var RED="#7f0019";
function red(){try{var V=themeVars(RED),r=document.documentElement;Object.keys(V).forEach(function(k){r.style.setProperty(k,V[k])});var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute("content",RED)}catch(e){}}
if(typeof setTheme==="function"){var oST=setTheme;setTheme=function(){var r=oST.apply(this,arguments);red();return r}}red();
/* 3) 見出しの「for MUJI staff」 */
var hv=document.querySelector("h1 .vlogo");if(hv&&!q("mjhd")){var s=document.createElement("span");s.id="mjhd";s.className="mjhd";s.textContent="for MUJI staff";hv.insertAdjacentElement("afterend",s)}
/* 4) はじめの画面：接客／売場 */
var rb=document.querySelector('#stmk [data-k="room"]'),vb=document.querySelector('#stmk [data-k="vmd"]');
if(rb)rb.innerHTML='接客<small>お客さまのお部屋</small>';if(vb)vb.innerHTML='売場づくり<small>vmd・什器</small>';
var st=q("stmt");if(st)st.textContent="今日はどちらに使いますか？";

/* 5) 無印良品の商品をさがす */
var CATS=[["all","すべて"],["sofa","ソファ"],["table","テーブル"],["lt","ローテーブル"],["desk","デスク"],["chair","チェア"],["bench","スツール・ベンチ"],["bed","ベッド"],["shelf","収納"],["rug","ラグ"]];
var S={cat:"all",q:"",w:"",d:"",sort:"rec",place:true};
function norm(s){return String(s||"").replace(/[！-～]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-65248)}).replace(/　/g," ").toLowerCase()}
MC.forEach(function(p,i){p._i=i;p._k=norm(p.name+" "+(p.sub||"")+" "+(p.note||"")+" "+p.jan)});
function wood(n){return/ウォールナット/.test(n)?"walnut":/オーク/.test(n)?"oak":/タモ|アッシュ/.test(n)?"ash":/パイン/.test(n)?"pine":/ラバーウッド/.test(n)?"rubber":/チーク/.test(n)?"teak":/メープル/.test(n)?"maple":/ブナ/.test(n)?"beech":/チェリー/.test(n)?"cherry":/スチール|ステンレス/.test(n)?"":"oak"}
/* 商品 → VIM の家具（形は近いものを選び、寸法は商品のまま） */
function toItem(p){var n=p.name,w=wood(n),o={name:n,w:p.w,d:p.d,h:p.h,price:p.price||"",jan:p.jan,url:p.url};if(w)o.wtex=w;
 if(p.cat==="sofa"){if(/オットマン|スツール/.test(n+(p.sub||""))){o.fs="bench"}else if(/ソファベッド/.test(n)){o.fs="sofa";o.f4="sofa";o.arm="n";o.leg="w";o.bk="l"}
  else{o.fs="sofa";o.f4="sofa";o.arm=/アームレス|カウチ/.test(n)?"n":/木製フレーム|木製アーム/.test(n)?"t":"k";o.leg=/フロア|体にフィット|空気/.test(n)?"p":"w";o.bk=/ハイバック/.test(n)?"h":"l";o.cu=/カウチ|1シーター|１シーター/.test(n)?"b":"s"}}
 else if(p.cat==="table"||p.cat==="lt"){o.fs=p.cat==="lt"?"lt":"table";o.f4="table";o.top=p.top==="round"||/丸|ラウンド/.test(n)?"c":p.top==="oval"||/楕円/.test(n)?"o":"r";o.lg="4"}
 else if(p.cat==="desk"){o.fs="desk";o.f4="desk";o.dr=/引出/.test(n)?"y":"n"}
 else if(p.cat==="chair"){o.fs="chair"}
 else if(p.cat==="bench"){o.fs="bench"}
 else if(p.cat==="bed"){o.fs="bed";o.f4="bed";o.hb=/脚付マットレス/.test(n)?"n":"p"}
 else if(p.cat==="shelf"){o.fs="shelf";if(/チェスト|引出/.test(n+(p.sub||""))){o.f4="chest";o.tiers=String(Math.max(2,Math.min(8,p.tiers||4)))}else if(/キャビネット|扉/.test(n+(p.sub||""))){o.f4="board"}else{o.f4="shelf";o.tiers=String(Math.max(1,Math.min(8,p.tiers||Math.max(2,Math.round(p.h/360)))));o.back="n"}}
 else if(p.cat==="rug"){o.fs="g";o.col="#cbb9a0"}
 else if(p.cat==="l"){o.fs="l"}
 return o}
function find(){var t=norm(S.q).split(/\s+/).filter(Boolean),mw=+S.w||0,md=+S.d||0;
 var r=MC.filter(function(p){return(S.cat==="all"||p.cat===S.cat)&&t.every(function(x){return p._k.indexOf(x)>=0})&&(!mw||p.w<=mw)&&(!md||p.d<=md)});
 if(S.sort==="pa")r.sort(function(a,b){return(a.price||9e9)-(b.price||9e9)});else if(S.sort==="pd")r.sort(function(a,b){return(b.price||0)-(a.price||0)});else if(S.sort==="w")r.sort(function(a,b){return a.w-b.w});
 return r}
function yen2(v){return v?"¥"+Math.round(v).toLocaleString("ja-JP"):"価格は商品ページで"}
function draw(){var R=find(),L=q("mjl");q("mjn").textContent=R.length+"件";
 L.innerHTML=R.slice(0,120).map(function(p){return'<div class="mjc"><div class="mjm"><b>'+esc2(p.name)+'</b><span>W'+p.w+' × D'+p.d+' × H'+p.h+' mm'+(p.sub?'　'+esc2(p.sub):'')+'</span><span class="mjp">'+yen2(p.price)+'</span></div>'+
  '<div class="mjb"><button type="button" class="pri" data-mp="'+p._i+'">'+(S.place?"置く":"一覧に追加")+'</button><a href="'+esc2(p.url)+'" target="_blank" rel="noopener">商品ページ</a></div></div>'}).join("")||'<p class="mje">見つかりませんでした。言葉を短くするか、幅・奥行の上限を外してください。</p>';wire()}
function open(place){S.place=place!==false;q("mjs").hidden=false;q("mjst").hidden=true;q("mjt").textContent=S.place?"無印良品の商品を置く":"無印良品の商品を一覧に追加";draw();if(!("ontouchstart" in window))setTimeout(function(){try{q("mjq").focus({preventScroll:true})}catch(e){}},60)}
var box=document.createElement("div");box.id="mjs";box.className="mdl";box.hidden=true;box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");box.setAttribute("aria-labelledby","mjt");
box.innerHTML='<div class="dbox mjbox"><div class="m3h"><b id="mjt">無印良品の商品を置く</b><button id="mjx" class="ib" type="button">閉じる</button></div>'+
 '<input id="mjq" type="search" placeholder="商品名・素材・JANで探す（例：オーク 2シーター）" autocomplete="off">'+
 '<div class="mjcats" id="mjcats">'+CATS.map(function(c){return'<button type="button" data-c="'+c[0]+'"'+(c[0]==="all"?' class="on"':'')+'>'+c[1]+'</button>'}).join("")+'</div>'+
 '<div class="mjf"><label>幅 ≤<input id="mjw" type="number" inputmode="numeric" placeholder="mm"></label><label>奥行 ≤<input id="mjd" type="number" inputmode="numeric" placeholder="mm"></label><label>並び<select id="mjo"><option value="rec">おすすめ</option><option value="pa">価格の安い順</option><option value="pd">価格の高い順</option><option value="w">幅の小さい順</option></select></label></div>'+
 '<div id="mjst" class="mjst" hidden></div><div class="mjh"><span id="mjn"></span><button type="button" id="mjg" class="mjlink">ほかの家具（形だけ）から選ぶ</button></div><div id="mjl" class="mjlist"></div>'+
 '<p class="mjnote">'+esc2(AT)+'時点の無印良品ネットストアの情報（'+MC.length+'点）。価格・在庫・仕様は変わることがあります。お客さまには商品ページで最新をご確認ください。形は近い3Dで表示し、寸法は商品のままです。</p></div>';
document.body.appendChild(box);
q("mjx").onclick=function(){box.hidden=true};box.addEventListener("click",function(e){if(e.target===box)box.hidden=true});
q("mjq").addEventListener("input",function(e){S.q=e.target.value;draw()});
q("mjw").addEventListener("input",function(e){S.w=e.target.value;draw()});q("mjd").addEventListener("input",function(e){S.d=e.target.value;draw()});
q("mjo").addEventListener("change",function(e){S.sort=e.target.value;draw()});
q("mjcats").onclick=function(e){var b=e.target.closest("[data-c]");if(!b)return;S.cat=b.getAttribute("data-c");[].forEach.call(q("mjcats").children,function(x){x.className=x===b?"on":""});draw()};
q("mjg").onclick=function(){box.hidden=true;TPLPLACE=S.place;var lb=q("tpla")&&q("tpla").querySelector(".lb");if(lb)lb.textContent=S.place?"部屋に置く":"一覧に追加";tplOpen()};
/* 置く：スマホではキーボードが閉じて並びがずれ、タップが外れやすいので、押した時点で決める */
function say(m,bad){var e=q("mjst");if(!e)return;e.textContent=m;e.className="mjst "+(bad?"bad":"ok");e.hidden=false}
function act(b){say("押しました。配置しています…");var p=MC[+b.getAttribute("data-mp")];if(!p){say("商品が見つかりません",1);return}
 var k=-1;try{try{document.activeElement&&document.activeElement.blur()}catch(x){}
  if(!plan||typeof plan!=="object")plan={rw:4000,rd:3000,p:[]};["p","o","hm","cut","fl","views","cols","bms"].forEach(function(z){if(!Array.isArray(plan[z]))plan[z]=[]});if(!plan.rw)plan.rw=4000;if(!plan.rd)plan.rd=3000;if(!Array.isArray(items))items=[];
  var o=toItem(p);k=placeTpl(o);
  if(items[k]){items[k].jan=p.jan;items[k].url=p.url;if(p.price)items[k].price=p.price;try{save()}catch(x){}}
 }catch(err){say("置けませんでした（配置）："+(err&&err.message||err),1);return}
 box.hidden=true;
 try{if(document.getElementById("v2").hidden)tab(2)}catch(x){}try{render()}catch(x){}try{rplan()}catch(x){}try{after3d()}catch(x){}
 try{toast(p.name+" を置きました。ドラッグで動かせます。")}catch(x){}}
/* ボタンごとに直接つける（親での振り分けをやめる）。touchend と click の二重実行は防ぐ */
var lastAct=0;
function wire(){[].forEach.call(q("mjl").querySelectorAll("[data-mp]"),function(b){
 var go=function(){var n=Date.now();if(n-lastAct<600)return;lastAct=n;act(b)};
 b.addEventListener("click",go);b.addEventListener("touchend",function(){go()},{passive:true})})}
/* 「家具を置く」「家具を追加」は無印良品の商品から */
["plb","plb3"].forEach(function(id){var b=q(id);if(b)b.onclick=function(){open(true)}});
var tb=q("tplb");if(tb){tb.onclick=function(){open(true)};var l1=tb.querySelector(".lb"),s1=tb.querySelector("small");if(l1)l1.textContent="無印良品の商品を置く";if(s1)s1.textContent="ネットストアの家具を、名前やサイズで探せます"}
["plb","plb3"].forEach(function(id){var b=q(id),l=b&&b.querySelector(".lb");if(l)l.textContent="無印良品の商品を置く";else if(b&&!b.children.length)b.textContent="無印良品の商品を置く"});
/* ロゴの下に「for MUJI staff」 */[].forEach.call(document.querySelectorAll(".stmbrand,.verlogo"),function(el){if(el.querySelector(".mjsub"))return;var t=document.createElement("small");t.className="mjsub";t.textContent="for MUJI staff — VIM";el.appendChild(t)});
/* 6) 見積書に JAN コード */
if(typeof dimText==="function"){var oDT=dimText;dimText=function(it){var r=oDT(it);if(it&&it.jan)r=r.concat(["JAN "+it.jan]);return r}}
window.mujiOpen=open;
})();
