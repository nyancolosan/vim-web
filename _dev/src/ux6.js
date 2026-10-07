/* ===== v4.3 はじめてでも迷わない：①部屋をつくる→②家具を置く→③3Dで見る の案内、
 * 家具の編集パネル（平面図・3D 共通：サイズ・色・素材）、3Dで壁を隠す ===== */
ICO.edit='<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>';
ICO.wall='<path d="M3 20h18"/><path d="M5 20V7h14v13"/><path d="M5 11h14M5 15.5h14M12 7v4M8.5 11v4.5M15.5 11v4.5M12 15.5V20"/>';
ICO.check='<path d="M5 12.5l4.5 4.5L19 7.5"/>';
var UX6={seen3:false};try{UX6.seen3=localStorage.getItem("vim-seen3")==="1"}catch(e){}
/* ---------- ①②③ の案内 ---------- */
function ux6Cur(){var has=plan.p&&plan.p.length>0;return!has?1:!UX6.seen3?2:3}
function ux6Steps(){try{var cur=ux6Cur(),m=Math.round(plan.rw/100)/10+"×"+Math.round(plan.rd/100)/10+"m",n=plan.p.length,
 S=[["部屋をつくる",m],["家具を置く",n?n+"点":"まだありません"],["3Dで見る",UX6.seen3?"見ました":"立体で確認"]],
 H=["","次は「家具を置く」。下の赤いボタンから選んで、部屋の中にドラッグで動かします。","置けました。次は「3Dで見る」で、立体で確かめましょう。","家具をタップすると、サイズ・色・素材を変えられます。"][cur];
 var h='<div class="ux6s" role="list">'+S.map(function(s,i){var st=i<cur?"done":i===cur?"now":"";return(i?'<i class="ux6a" aria-hidden="true"></i>':'')+'<button type="button" role="listitem" data-st="'+i+'" class="'+st+'"><em>'+(i<cur?ic("check"):i+1)+'</em><span><b>'+s[0]+'</b><small>'+s[1]+'</small></span></button>'}).join("")+'</div><p class="ux6h">'+H+'</p>';
 ["v2","v3"].forEach(function(v){var V=document.getElementById(v);if(!V)return;var w=V.querySelector(".ux6w");if(!w){w=document.createElement("div");w.className="ux6w";V.insertBefore(w,V.firstChild)}if(w.getAttribute("data-h")!==h){w.innerHTML=h;w.setAttribute("data-h",h)}});
 [].forEach.call(document.querySelectorAll(".plb"),function(b){b.classList.toggle("ux6go",cur===1)})}catch(e){}}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".ux6s [data-st]");if(!b)return;var k=+b.getAttribute("data-st");
 if(k===0){tab(2);var f=document.getElementById("roomf");if(f){f.open=true;setTimeout(function(){f.scrollIntoView({behavior:"smooth",block:"start"})},60)}}
 else if(k===1){var p=document.getElementById(document.getElementById("v3").hidden?"plb":"plb3");if(p)p.click()}
 else tab(3)});
/* ---------- 家具の編集パネル（平面図・3D 共通） ---------- */
var FED={g:0,n:-1};
(function(){if(document.getElementById("fed"))return;var d=document.createElement("div");d.id="fed";d.className="fed";d.hidden=true;d.setAttribute("role","dialog");d.setAttribute("aria-labelledby","fedt");
 d.innerHTML='<div class="fedb"><div class="fedh"><b id="fedt">家具を編集</b><button type="button" id="fedx" class="pri">完了</button></div><p class="fedn" id="fedn"></p>'+
 '<div class="feds"><b>サイズ</b><div class="fedz">'+[["w","幅 W"],["d","奥行 D"],["h","高さ H"]].map(function(k){return'<label>'+k[1]+'<span class="fedp"><button type="button" data-z="'+k[0]+'" data-dz="-10" aria-label="10mm 小さく">−</button><input type="number" inputmode="numeric" id="fed'+k[0]+'" min="10"><button type="button" data-z="'+k[0]+'" data-dz="10" aria-label="10mm 大きく">＋</button></span></label>'}).join("")+'</div><small class="fedu">単位は mm（＋−は1cmずつ）</small></div>'+
 '<div class="feds"><b>色</b><div class="fedc" id="fedc"></div></div>'+
 '<div class="feds"><b>素材</b><div class="pptab" id="fedtab"></div><div class="ppsw" id="fedsw"></div></div>'+
 '<button type="button" id="fedpp" class="fedpp" hidden>部品ごとに素材を変える（3Dでタップ）</button></div>';
 document.body.appendChild(d)})();
var FEDC=["#f4f2ee","#e9e0cc","#d2bd9b","#b08a5a","#7a5a3e","#4a3426","#d0d0d0","#8c8c8c","#4a4a4a","#1e1e1e","#2f3f5f","#4a78b5","#6f8a6a","#7a7d3e","#c0704a","#b8403a","#e3a0b0","#e6c34a"];
function fedOpen(){var pc=plan.p[sel];if(!pc||!items[pc.n]){toast("家具をタップして選んでから押してください。");return}FED.n=pc.n;var it=items[pc.n];
 if(it.tex&&TEX[it.tex])MAT5G.forEach(function(g,i){if(g[1].indexOf(TEX[it.tex].g)>=0)FED.g=i});else if(it.wtex)FED.g=0;
 document.getElementById("fedpp").hidden=document.getElementById("v3").hidden||it.kind==="p";fedUI();document.getElementById("fed").hidden=false;document.body.classList.add("fedon")}
function fedClose(){document.getElementById("fed").hidden=true;document.body.classList.remove("fedon")}
function fedUI(){var it=items[FED.n];if(!it){fedClose();return}var q=function(i){return document.getElementById(i)},cnt=plan.p.filter(function(p){return p.n===FED.n}).length;
 q("fedt").textContent=circ(FED.n+1)+" "+(it.name||"家具");q("fedn").textContent=cnt>1?"同じ番号の家具（"+cnt+"点）すべてに反映されます。":"変えるとすぐに平面図と3Dに反映されます。";
 ["w","d","h"].forEach(function(k){var e=q("fed"+k);if(document.activeElement!==e)e.value=it[k]||""});
 var cur=(it.col||"").toLowerCase();q("fedc").innerHTML=FEDC.map(function(c){return'<button type="button" data-fc="'+c+'" style="background:'+c+'"'+(cur===c?' class="on"':'')+' aria-label="'+c+'"></button>'}).join("")+'<label class="fedcc" title="色をつくる"><input type="color" id="fedcu" value="'+(/^#[0-9a-f]{6}$/i.test(it.col||"")?it.col:"#c9a46b")+'" aria-label="色をつくる"><span>色をつくる</span></label><button type="button" class="fedr" data-fr="col">元の色</button>';
 q("fedtab").innerHTML=MAT5G.map(function(g,i){return'<button type="button" data-g="'+i+'"'+(i===FED.g?' class="on"':'')+'>'+g[0]+'</button>'}).join("");
 var gk=MAT5G[FED.g][1],K=mat5Keys(gk),sel0=gk.indexOf("w")>=0?(it.wtex||it.tex):it.tex;MAT5.q=MAT5.q||[];
 q("fedsw").innerHTML='<button type="button" data-ft=""'+(!it.tex&&!it.wtex?' class="on"':'')+'><i class="ok nb"></i><span>元の素材</span></button>'+K.map(function(k){var u=MAT5.th[k];return'<button type="button" data-ft="'+k+'"'+(sel0===k?' class="on"':'')+'><i'+(u?' class="ok" style="background-image:url('+u+')"':' style="background:'+TEX[k].c+'"')+'></i><span>'+TEX[k].n+'</span></button>'}).join("");
 setTimeout(function(){K.forEach(function(k){if(MAT5.th[k])return;var u=mat5Thumb(k);if(!u)return;var el=document.querySelector('#fedsw [data-ft="'+k+'"] i');if(el){el.style.backgroundImage="url("+u+")";el.classList.add("ok")}})},40)}
function fedApply(){save();try{render()}catch(e){}try{rplan()}catch(e){}try{after3d()}catch(e){}try{rcolors()}catch(e){}fedUI()}
(function(){var q=function(i){return document.getElementById(i)},F=q("fed");
 q("fedx").onclick=fedClose;F.addEventListener("click",function(e){if(e.target===F)fedClose()});
 F.addEventListener("click",function(e){var it=items[FED.n];if(!it)return;var b;
  if((b=e.target.closest("[data-dz]"))){var k=b.getAttribute("data-z");it[k]=Math.max(10,(+it[k]||0)+(+b.getAttribute("data-dz")));fedApply();return}
  if((b=e.target.closest("[data-fc]"))){it.col=b.getAttribute("data-fc");fedApply();return}
  if((b=e.target.closest("[data-fr]"))){delete it.col;delete it.ccol;fedApply();return}
  if((b=e.target.closest("#fedtab [data-g]"))){FED.g=+b.getAttribute("data-g");fedUI();return}
  if((b=e.target.closest("[data-ft]"))){var v=b.getAttribute("data-ft");if(!v){delete it.tex;delete it.wtex}else if(TEX[v].g==="w"){it.wtex=v;if(!it.f4)it.tex=v}else it.tex=v;fedApply();return}});
 ["w","d","h"].forEach(function(k){q("fed"+k).addEventListener("change",function(e){var it=items[FED.n],v=Math.round(+e.target.value);if(!it||!(v>=10))return fedUI();it[k]=v;fedApply()})});
 F.addEventListener("input",function(e){if(e.target.id==="fedcu"){var it=items[FED.n];if(!it)return;it.col=e.target.value;save();try{rplan()}catch(x){}try{after3d()}catch(x){}}});
 q("fedpp").onclick=function(){fedClose();var b=q("s3p");if(b)b.click()};
 /* 平面図のボタン列と 3D の選択バーに「編集」 */
 var r=q("rot");if(r&&!q("ed2")){var e2=document.createElement("button");e2.id="ed2";e2.className="ib ux6ed";e2.setAttribute("data-ic","edit");e2.textContent="編集";r.parentNode.insertBefore(e2,r);e2.onclick=fedOpen}
 var s=q("s3p");if(s&&!q("s3e")){var e3=document.createElement("button");e3.id="s3e";e3.className="ib ux6ed";e3.setAttribute("data-ic","edit");e3.textContent="編集";s.parentNode.insertBefore(e3,s);e3.onclick=fedOpen;s.textContent="部品の素材";s.removeAttribute("data-icd")}
 /* 3D：壁を隠す */
 var vk=q("vwk");if(vk&&!q("vwall")){var w=document.createElement("button");w.id="vwall";w.className="ib";w.setAttribute("data-ic","wall");w.textContent="壁を隠す";vk.parentNode.insertBefore(w,vk.nextSibling);w.onclick=function(){plan.hidew=!plan.hidew;if(!plan.hidew)delete plan.hidew;psave();wallVis();toast(plan.hidew?"壁を隠しました（もう一度押すと表示）":"壁を表示しました")}}
 try{decorate(document)}catch(e){}})();
/* ---------- 3D：壁を隠す ---------- */
function wallVis(){if(typeof T==="undefined"||!T.sc)return;var hide=!!plan.hidew,have=false;
 T.sc.children.forEach(function(o){var u=o.userData||{};if(u.wl||u.wall!==undefined)o.visible=!hide;if(u.wlLow){o.visible=hide;have=true}});
 if(hide&&!have)T.sc.children.filter(function(o){return o.userData&&o.userData.wlm}).forEach(function(w){var b=new THREE.Box3().setFromObject(w),s=b.getSize(new THREE.Vector3()),c=b.getCenter(new THREE.Vector3()),m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.01,s.x),.1,Math.max(.01,s.z)),new THREE.MeshStandardMaterial({color:0x9a958d,roughness:.9}));m.position.set(c.x,.05,c.z);m.userData.wlLow=1;m.receiveShadow=true;T.sc.add(m)});
 var bt=document.getElementById("vwall");if(bt){bt.classList.toggle("on",hide);var l=bt.querySelector(".lb");if(l)l.textContent=hide?"壁を表示":"壁を隠す"}
 try{if(T.r&&T.cam)T.r.render(T.sc,T.cam)}catch(e){}}
/* ---------- いつ更新するか ---------- */
(function(){var _r3=r3d;r3d=function(){var x=_r3.apply(this,arguments);try{wallVis()}catch(e){}return x};
 var _rp=rplan;rplan=function(){var x=_rp.apply(this,arguments);ux6Steps();var e=document.getElementById("ed2");if(e)e.disabled=!plan.p[sel];if(!document.getElementById("fed").hidden){if(!plan.p[sel])fedClose();else if(plan.p[sel].n!==FED.n)fedOpen()}return x};
 var _tb=tab;tab=function(n){var x=_tb.apply(this,arguments);if(n===3&&!UX6.seen3){UX6.seen3=true;try{localStorage.setItem("vim-seen3","1")}catch(e){}}if(n!==2&&n!==3)fedClose();ux6Steps();return x};
 ux6Steps()})();
