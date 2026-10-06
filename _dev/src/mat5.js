/* ===== 素材を変える（v4.1）：3Dで家具をタップ →「素材」→ 変えたいところをタップ → 見本を選ぶ =====
 * すべての家具（名作風・汎用・旧モデル・AIモデル・観葉植物）の部品ごとに、素材と色を変えられる。
 * 「同じ素材のところをまとめて」がオンなら、たとえばソファのクッション全部・脚4本をまとめて変える。 */
var MAT5={grp:0,all:true,pks:[],th:{},q:[],qb:false};
var MAT5G=[["木","w"],["布","f"],["革","l"],["編み","c"],["石","s"],["金属","m"],["その他","pg"]];
function mat5Keys(g){var o=[];Object.keys(TEX).forEach(function(k){var d=TEX[k];if(d&&g.indexOf(d.g)>=0&&(TEXG.some(function(G){return G[1].indexOf(k)>=0})))o.push(k)});return o}
/* 見本の小さな絵（素材を作るのは重いので、見えている分だけ順番に） */
function mat5Thumb(k){if(MAT5.th[k])return MAT5.th[k];try{var t=T.tx&&T.tx[k];var src=t&&t.image;if(!src){texMat(k);src=T.tx[k]&&T.tx[k].image}if(!src)return null;var c=document.createElement("canvas");c.width=c.height=72;var x=c.getContext("2d");
 if(TEX[k].g==="c"){x.fillStyle="#3a3631";x.fillRect(0,0,72,72)}x.drawImage(src,0,0,src.width*.35,src.height*.35,0,0,72,72);if(TEX[k].g==="g"){x.fillStyle="rgba(200,225,228,.6)";x.fillRect(0,0,72,72)}MAT5.th[k]=c.toDataURL("image/jpeg",.8);return MAT5.th[k]}catch(e){return null}}
function mat5Fill(){if(MAT5.qb)return;MAT5.qb=true;(function step(){var k=MAT5.q.shift();if(!k){MAT5.qb=false;return}var u=mat5Thumb(k);[].forEach.call(document.querySelectorAll('#ppsw [data-tx="'+k+'"] i'),function(el){if(u){el.style.backgroundImage="url("+u+")";el.classList.add("ok")}});setTimeout(step,16)})()}
/* 選んだ部品（と、同じ素材の部品）を集める */
function mat5Meshes(){var f=T.fg&&T.fg[sel];if(!f||T.pk<0)return[];var all=[],tap=null;f.g.traverse(function(o){if(o.isMesh&&o.userData.pk!==undefined){all.push(o);if(o.userData.pk===T.pk&&!tap)tap=o}});if(!tap)return[];
 if(!MAT5.all)return[tap];var om=tap.userData.om;return om?all.filter(function(o){return o.userData.om===om}):[tap]}
function ppUI(){var pn=document.getElementById("ppn"),bar=document.getElementById("sel3");if(!pn)return;if(T.phl&&T.sc){T.sc.remove(T.phl);T.phl=null}
 if(!T.pm||sel<0||!T.fg||!T.fg[sel]){pn.hidden=true;T.pm=false;return}var was=pn.hidden;pn.hidden=false;if(was)setTimeout(function(){try{var r=pn.getBoundingClientRect();if(r.bottom>innerHeight-70)window.scrollBy({top:r.bottom-innerHeight+80,behavior:"smooth"})}catch(e){}},60);bar.hidden=true;var pc=plan.p[sel],it=items[pc.n]||{};
 document.getElementById("ppt").textContent=circ(pc.n+1)+" "+(it.name||"")+"の素材";
 var M=mat5Meshes();MAT5.pks=M.map(function(o){return o.userData.pk});document.getElementById("ppe").hidden=!M.length;document.getElementById("ppall").classList.toggle("on",MAT5.all);
 if(!M.length){document.getElementById("ppm").textContent="変えたいところをタップしてください（同じ番号の家具すべてに反映されます）。";return}
 var hl=new THREE.Group();M.forEach(function(o){var b=new THREE.BoxHelper(o,new THREE.Color(css("--hi")||"#f5c518"));b.material.depthTest=false;b.renderOrder=21;hl.add(b)});T.phl=hl;T.sc.add(hl);
 var ov=(it.pp||{})[T.pk]||{},ms=M[0];
 document.getElementById("ppm").textContent=(M.length>1?M.length+"か所を選択中":"1か所を選択中")+"（ほかのところ・ほかの家具もタップで選べます）"+(ov.tx&&TEX[ov.tx]?"：いまは「"+TEX[ov.tx].n+"」":"")+(ov.r?"・木目を90°回転中":"");
 var tk=ms.material&&ms.material.userData&&ms.material.userData.tk;document.getElementById("ppc").value=ov.c||(tk&&TEX[tk]?(TEX[tk].g==="f"||TEX[tk].g==="l"?(it.col||it.ccol||TEX[tk].c):TEX[tk].c):ms.material&&ms.material.color?"#"+(ms.material._lin?ms.material.color.clone().convertLinearToSRGB():ms.material.color).getHexString():"#cccccc");
 if(MAT5.grp<0)MAT5.grp=0;if(ov.tx&&TEX[ov.tx]){MAT5G.forEach(function(g,i){if(g[1].indexOf(TEX[ov.tx].g)>=0)MAT5.grp=i})}
 document.getElementById("pptab").innerHTML=MAT5G.map(function(g,i){return'<button type="button" data-g="'+i+'"'+(i===MAT5.grp?' class="on"':'')+'>'+g[0]+'</button>'}).join("");
 var K=mat5Keys(MAT5G[MAT5.grp][1]);MAT5.q=[];
 document.getElementById("ppsw").innerHTML='<button type="button" data-tx=""'+(!ov.tx?' class="on"':'')+'><i class="ok nb"></i><span>元の素材</span></button>'+K.map(function(k){var u=MAT5.th[k];if(!u)MAT5.q.push(k);return'<button type="button" data-tx="'+k+'"'+(ov.tx===k?' class="on"':'')+'><i'+(u?' class="ok" style="background-image:url('+u+')"':' style="background:'+TEX[k].c+'"')+'></i><span>'+TEX[k].n+'</span></button>'}).join("");
 setTimeout(mat5Fill,30)}
function ppSet(fn){var pc=plan.p[sel];if(!pc||T.pk<0)return;var it=items[pc.n],P=MAT5.pks.length?MAT5.pks:[T.pk];it.pp=it.pp||{};
 P.forEach(function(k){var o=it.pp[k]||{};fn(o);if(!o.r&&!o.tx&&!o.c)delete it.pp[k];else it.pp[k]=o});if(!Object.keys(it.pp).length)delete it.pp;save();r3d()}
/* 3Dで最後にタップした場所（「素材」を押したとき、そこを選んだ状態で始める） */
function mat5Pick(ndc,only){var rc=new THREE.Raycaster();rc.setFromCamera(ndc,T.cam);var G=[],I=[];var FG=T.fg||{};Object.keys(FG).forEach(function(k){var f=FG[k],i=+k;if(f&&f.g&&(only===undefined||only===i)){G.push(f.g);I.push(i)}});
 var hh=rc.intersectObjects(G,true);for(var h=0;h<hh.length;h++){var ob=hh[h].object,pk;if(ob.isLineSegments||ob.isSprite||(ob.material&&ob.material.visible===false))continue;
  while(ob&&ob.userData.pk===undefined&&ob.parent)ob=ob.parent;if(!ob||ob.userData.pk===undefined)continue;pk=ob.userData.pk;var r=ob;while(r&&G.indexOf(r)<0)r=r.parent;if(!r)continue;return{pi:I[G.indexOf(r)],pk:pk}}return null}
(function(){var q=function(i){return document.getElementById(i)};if(!q("ppn"))return;
 q("ppall").onclick=function(){MAT5.all=!MAT5.all;ppUI();cam3()};
 q("pptab").onclick=function(e){var b=e.target.closest("[data-g]");if(!b)return;MAT5.grp=+b.getAttribute("data-g");ppUI();cam3()};
 q("ppsw").onclick=function(e){var b=e.target.closest("[data-tx]");if(!b)return;var v=b.getAttribute("data-tx");ppSet(function(o){if(v)o.tx=v;else{delete o.tx;delete o.c}})};
 q("s3p").onclick=function(){if(sel<0)return;if(!isPro()){needPlan("plus","部品ごとに素材を変えるのは Plus から使えます。");return}T.pm=true;T.pk=-1;
  if(T.ltap&&T.ltap.pi===sel){var h=mat5Pick(T.ltap.ndc,sel);if(h)T.pk=h.pk}sel3UI();cam3()}})();
