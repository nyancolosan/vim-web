/* ===== 素材 v4：つなぎ目のないノイズで作る木目・布・革・金属など =====
 * 色の画像と凹凸（高さ）の画像を同時に作り、凹凸から法線マップを作る。
 * 解像度は端末に合わせて 512 / 1024。作った素材は使い回す。 */
var TX4={c:{},res:(function(){try{var m=window.devicePixelRatio||1,mem=navigator.deviceMemory||4;var tc=("ontouchstart" in window)||navigator.maxTouchPoints>0;return m>=2&&mem>=4?(tc?768:1024):512}catch(e){return 512}})()};
/* 追加の素材（名前・種類・基本色・1枚の大きさ[m]） */
(function(){var A={
 oak:{n:"オーク",g:"w",c:"#c4a072",s:.9},walnut:{n:"ウォールナット",g:"w",c:"#5a3d2a",s:.9},teak:{n:"チーク",g:"w",c:"#9b6a3e",s:.9},ash:{n:"アッシュ",g:"w",c:"#d8c6a6",s:.9},beech:{n:"ブナ",g:"w",c:"#d7b48a",s:.8},
 maple:{n:"メープル",g:"w",c:"#e6d2ad",s:.8},pine:{n:"パイン",g:"w",c:"#dcb882",s:.9},rubber:{n:"ラバーウッド",g:"w",c:"#d6b68a",s:.8},cherry:{n:"チェリー",g:"w",c:"#a5623e",s:.9},blackoak:{n:"オーク（黒）",g:"w",c:"#2e2a26",s:.9},
 plywood:{n:"成形合板",g:"w",c:"#d8bf98",s:.6},
 plain:{n:"平織",g:"f",c:"#d9cfbd",s:.3},canvas:{n:"帆布",g:"f",c:"#d6ccb8",s:.3},linen:{n:"リネン",g:"f",c:"#d4c9b2",s:.35},boucle:{n:"ブークレー",g:"f",c:"#ebe5da",s:.25},
 tweed:{n:"ツイード",g:"f",c:"#a99b84",s:.3},velvet:{n:"ベルベット",g:"f",c:"#3f5f52",s:.5},wool:{n:"ウール",g:"f",c:"#8a8a86",s:.3},basket:{n:"バスケット織",g:"f",c:"#d9cfbd",s:.3},
 leather:{n:"レザー",g:"l",c:"#7a5238",s:.4},leatherblk:{n:"レザー（黒）",g:"l",c:"#26221f",s:.4},
 cord:{n:"ペーパーコード",g:"c",c:"#cfb68a",s:.25},cane:{n:"籐の網代（ケーン）",g:"c",c:"#d7b67e",s:.12},rattan:{n:"ラタン",g:"c",c:"#c49a62",s:.3},
 marble:{n:"大理石",g:"s",c:"#ece9e4",s:1.2},travertine:{n:"トラバーチン",g:"s",c:"#d9cbb3",s:1.2},terrazzo:{n:"テラゾー",g:"s",c:"#e3ded6",s:.8},concrete:{n:"コンクリート",g:"s",c:"#b6b3ae",s:1.2},
 steel:{n:"ステンレス（ヘアライン）",g:"m",c:"#c9ccd0",s:.4},chrome:{n:"クロームめっき",g:"m",c:"#e8eaee",s:.4},brass:{n:"真ちゅう",g:"m",c:"#c9a565",s:.4},blacksteel:{n:"スチール（黒）",g:"m",c:"#2a2a2a",s:.4},
 lacquer:{n:"塗装（つや消し白）",g:"p",c:"#efeeea",s:1},glass:{n:"ガラス",g:"g",c:"#e9f1f2",s:1}};
 Object.keys(A).forEach(function(k){TEX[k]=A[k]})})();
var TEXG=[["木材",["oak","walnut","teak","ash","beech","maple","cherry","pine","rubber","plywood","blackoak"]],["布地",["plain","linen","canvas","boucle","tweed","wool","velvet","basket"]],["革",["leather","leatherblk"]],["編み",["cord","cane","rattan"]],["石",["marble","travertine","terrazzo","concrete"]],["金属",["steel","chrome","brass","blacksteel"]],["その他",["lacquer","glass"]]];
function texOpts(cur){return'<option value="">素材：指定なし（単色）</option>'+TEXG.map(function(g){return'<optgroup label="'+g[0]+'">'+g[1].map(function(k){return'<option value="'+k+'"'+(cur===k?' selected':'')+'>'+TEX[k].n+'</option>'}).join("")+'</optgroup>'}).join("")}
function woodOpts(cur){return'<option value="">木部の素材：指定なし（単色）</option>'+TEXG[0][1].map(function(k){return'<option value="'+k+'"'+(cur===k?' selected':'')+'>'+TEX[k].n+'</option>'}).join("")}
function texTxt(k){var d=TEX[k];if(!d)return"";return d.g==="w"?d.n+"材":d.g==="f"?d.n+"の布地":d.n}

/* ---------- つなぎ目のないノイズ ---------- */
function tx4Noise(seed,P){var R=pl4R(seed),g=new Float32Array(P*P);for(var i=0;i<g.length;i++)g[i]=R();
 return function(x,y){x=((x%P)+P)%P;y=((y%P)+P)%P;var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,x1=(xi+1)%P,y1=(yi+1)%P,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  var a=g[yi*P+xi],b=g[yi*P+x1],c=g[y1*P+xi],d=g[y1*P+x1];return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}}
function tx4Fbm(n,x,y,oct,P){var s=0,a=.5,f=1,t=0;for(var o=0;o<oct;o++){s+=a*n(x*f,y*f);t+=a;a*=.5;f*=2}return s/t}
function tx4Hex(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function tx4Mix(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
function tx4SS(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}

/* ---------- 素材ごとの絵 ---------- */
function tx4Make(k){var d=TEX[k];if(!d)return null;var S=d.g==="w"||d.g==="s"?TX4.res:Math.min(TX4.res,768),C=document.createElement("canvas"),Hc=document.createElement("canvas");C.width=C.height=Hc.width=Hc.height=S;
 var x=C.getContext("2d"),hx=Hc.getContext("2d"),id=x.createImageData(S,S),hd=hx.createImageData(S,S),D=id.data,HD=hd.data,base=tx4Hex(d.c),seed=k.length*7919+k.charCodeAt(0)*131,R=pl4R(seed),i,j,p;
 function put(px,c,h){D[px]=c[0];D[px+1]=c[1];D[px+2]=c[2];D[px+3]=255;var hv=Math.max(0,Math.min(255,h*255));HD[px]=HD[px+1]=HD[px+2]=hv;HD[px+3]=255}
 if(d.g==="w"){/* 木目：年輪（ゆらぎ付き）＋細い繊維＋導管（オーク・アッシュ）＋放射組織の斑（オーク） */
  var n1=tx4Noise(seed,8),n2=tx4Noise(seed+1,64),n3=tx4Noise(seed+2,16),ring={oak:30,walnut:24,teak:26,ash:34,beech:40,maple:38,cherry:30,pine:18,rubber:30,plywood:12,blackoak:30}[k]||30,
   late=tx4Mix(base,[base[0]*.55,base[1]*.48,base[2]*.42],1),early=tx4Mix(base,[255,248,236],k==="walnut"||k==="blackoak"?.05:.12),pores=k==="oak"||k==="ash"||k==="blackoak"||k==="walnut",rays=k==="oak";
  for(j=0;j<S;j++)for(i=0;i<S;i++){var u=i/S,v=j/S,w=tx4Fbm(n1,u*1,v*2,3,8)*(k==="pine"?1.8:.9)+tx4Fbm(n3,u*2,v*6,2,16)*.25,f=v*ring+w,r=f-Math.floor(f),lw=tx4SS(.78,.97,r)*(.55+.45*n3(u*6,v*20)),
   fib=tx4Fbm(n2,u*3,v*90,3,64),c=tx4Mix(early,late,lw*(k==="pine"?.5:.34)),fv=.93+.12*fib;c=[c[0]*fv,c[1]*fv,c[2]*fv];var h=.55-lw*.12+(fib-.5)*.22;c=tx4Mix(c,base,.0+.1*tx4Fbm(n1,u*3+4,v*3,2,8));
   if(pores){var pz=n2(u*40,v*260);if(pz>.8){var pd=(pz-.8)*3.2*(k==="walnut"?.5:1);c=[c[0]*(1-pd*.55),c[1]*(1-pd*.58),c[2]*(1-pd*.6)];h-=pd*.5}}
   if(rays){var ry=n3(u*30,v*6);if(ry>.82){var rd=(ry-.82)*3;c=tx4Mix(c,[255,244,222],rd*.25);h+=rd*.1}}
   if(k==="plywood"){var ly=Math.sin(v*6.283*28);c=tx4Mix(c,early,.12*ly)}
   put((j*S+i)*4,c,h)}}
 else if(d.g==="s"){/* 石 */
  var m1=tx4Noise(seed,8),m2=tx4Noise(seed+5,32);
  for(j=0;j<S;j++)for(i=0;i<S;i++){var u2=i/S,v2=j/S,c2=base.slice(),h2=.5;
   if(k==="marble"){var wp=tx4Fbm(m1,u2*2,v2*2,4,8),f1=tx4Fbm(m2,u2*2+wp*1.6,v2*2+wp*1.2,5,32),vein=Math.pow(1-Math.abs(2*f1-1),14)*.85,f2=tx4Fbm(m1,u2*4+f1*2,v2*4,4,8),vein2=Math.pow(1-Math.abs(2*f2-1),40);
    c2=tx4Mix(c2,[118,120,126],vein*.7+vein2*.25);var cl=tx4Fbm(m2,u2*3,v2*3,3,32);c2=tx4Mix(c2,[250,249,246],(cl-.5)*.4+.1);h2=.5-vein*.05}
   else if(k==="travertine"){var bands=tx4Fbm(m1,u2*1.5,v2*12,4,8),hole=m2(u2*20,v2*80);c2=tx4Mix(base,[base[0]*.82,base[1]*.8,base[2]*.76],bands);if(hole>.82){c2=tx4Mix(c2,[150,135,110],(hole-.82)*3);h2=.2}else h2=.5+bands*.1}
   else if(k==="terrazzo"){var cn=tx4Fbm(m2,u2*10,v2*10,2,32);c2=tx4Mix(base,[base[0]*.92,base[1]*.92,base[2]*.9],cn);h2=.5}
   else{var cc=tx4Fbm(m1,u2*4,v2*4,5,8),pk=m2(u2*60,v2*60);c2=tx4Mix([base[0]*.85,base[1]*.85,base[2]*.85],[base[0]*1.08,base[1]*1.08,base[2]*1.08],cc);if(pk>.86){c2=tx4Mix(c2,[90,90,90],(pk-.86)*4);h2=.25}else h2=.45+cc*.15}
   put((j*S+i)*4,c2,h2)}
  if(k==="terrazzo"){x.putImageData(id,0,0);hx.putImageData(hd,0,0);var cols=["#8c8a86","#c9b8a0","#5a5a58","#e9e6df","#a7745a","#b9c1c4"];
   for(var q=0;q<S*S/900;q++){var px=R()*S,py=R()*S,r0=S*(.003+R()*.012),cl2=cols[Math.floor(R()*cols.length)];[x,hx].forEach(function(cx,ix){cx.fillStyle=ix?"#888":cl2;cx.beginPath();for(var a=0;a<7;a++){var aa=a/7*6.283,rr=r0*(.6+R()*.6);var X=px+Math.cos(aa)*rr,Y=py+Math.sin(aa)*rr;if(a)cx.lineTo(X,Y);else cx.moveTo(X,Y)}cx.closePath();cx.fill()})}
   return{c:C,h:Hc}}}
 else if(d.g==="l"){/* 革：細かい粒（セル）＋ゆるいしわ＋色むら */
  var l1=tx4Noise(seed,64),l2=tx4Noise(seed+3,4),cell=S/180;
  for(j=0;j<S;j++)for(i=0;i<S;i++){var gx=i/cell,gy=j/cell,best=9,ix=Math.floor(gx),iy=Math.floor(gy),pc=Math.floor(S/cell);
   for(var oy=-1;oy<=1;oy++)for(var ox=-1;ox<=1;ox++){var cx=ix+ox,cy=iy+oy,hx0=(((cx%pc)+pc)%pc),hy0=(((cy%pc)+pc)%pc),hs=Math.sin(hx0*127.1+hy0*311.7)*43758.5453,hs2=Math.sin(hx0*269.5+hy0*183.3)*43758.5453,rx=hs-Math.floor(hs),rr2=hs2-Math.floor(hs2),dx=cx+rx-gx,dy=cy+rr2-gy,dd=dx*dx+dy*dy;if(dd<best)best=dd}
   var cr=Math.sqrt(best),mot=tx4Fbm(l2,i/S*4,j/S*4,4,4),c3=[base[0]*(.92+.16*mot),base[1]*(.92+.16*mot),base[2]*(.92+.16*mot)],edge=tx4SS(.35,.7,cr);c3=[c3[0]*(1-edge*.05),c3[1]*(1-edge*.05),c3[2]*(1-edge*.05)];
   put((j*S+i)*4,c3,.6-edge*.3+(mot-.5)*.04)}}
 else if(d.g==="m"){/* 金属：ヘアラインの細い筋 */
  var mm=tx4Noise(seed,128);for(j=0;j<S;j++)for(i=0;i<S;i++){var st=mm(i/S*4,j/S*400),c4=base.map(function(v){return v*(k==="chrome"?(.97+st*.06):(.88+st*.2))});put((j*S+i)*4,c4,.5+(st-.5)*(k==="chrome"?.05:.3))}}
 else if(d.g==="p"||d.g==="g"){var pn=tx4Noise(seed,32);for(j=0;j<S;j++)for(i=0;i<S;i++){var q2=tx4Fbm(pn,i/S*6,j/S*6,3,32);put((j*S+i)*4,base.map(function(v){return v*(.985+q2*.03)}),.5+(q2-.5)*.08)}}
 else{x.putImageData(id,0,0);hx.putImageData(hd,0,0);return tx4Draw(k,d,S,x,hx,base,R)}
 x.putImageData(id,0,0);hx.putImageData(hd,0,0);return{c:C,h:Hc}}

/* 布・編みものは線で描く（糸の1本ずつに明暗と太さのむら） */
function tx4Draw(k,d,S,x,hx,base,R){var C=x.canvas,Hc=hx.canvas,i,j,t;
 function rgb(f,a){return"rgba("+Math.round(Math.min(255,base[0]*f))+","+Math.round(Math.min(255,base[1]*f))+","+Math.round(Math.min(255,base[2]*f))+","+(a===undefined?1:a)+")"}
 function hg(v,a){v=Math.round(v*255);return"rgba("+v+","+v+","+v+","+(a===undefined?1:a)+")"}
 function bg(f,h){x.fillStyle=rgb(f);x.fillRect(0,0,S,S);hx.fillStyle=hg(h);hx.fillRect(0,0,S,S)}
 if(k==="plain"||k==="canvas"||k==="linen"||k==="wool"){var th=S/(k==="canvas"?96:k==="wool"?110:k==="linen"?150:170);bg(.8,.35);
  for(t=0;t<2;t++)for(i=0;i<S/th;i++){var f=.96+R()*.08,slub=k==="linen"||k==="wool";for(j=0;j<S/th;j++){var over=((i+j)%2===0)===(t===0);if(!over)continue;var w0=th*(slub?(.82+R()*.35):.9),f2=f*(slub?(.975+R()*.05):(.99+R()*.02));
   var X=t?j*th:i*th,Y=t?i*th:j*th;x.fillStyle=rgb(f2);hx.fillStyle=hg(.75);if(t){x.fillRect(X,Y,th,w0);hx.fillRect(X,Y,th,w0)}else{x.fillRect(X,Y,w0,th);hx.fillRect(X,Y,w0,th)}
   x.fillStyle=rgb(f2*1.08,.35);if(t)x.fillRect(X,Y+w0*.3,th,w0*.25);else x.fillRect(X+w0*.3,Y,w0*.25,th)}}
  if(k==="wool")for(i=0;i<S*S/60;i++){x.fillStyle=rgb(.7+R()*.6,.25);x.fillRect(R()*S,R()*S,1+R()*2,1)}}
 else if(k==="boucle"){bg(.9,.4);for(i=0;i<S*S/55;i++){var px=R()*S,py=R()*S,rd=S*(.004+R()*.005),a0=R()*6.283,f3=.9+R()*.15;
   x.strokeStyle=rgb(f3*.8,.8);x.lineWidth=rd*.9;x.beginPath();x.arc(px,py,rd,a0,a0+3.5+R()*2.5);x.stroke();x.strokeStyle=rgb(f3*1.08,.9);x.lineWidth=rd*.45;x.beginPath();x.arc(px,py-rd*.15,rd,a0,a0+3);x.stroke();
   hx.strokeStyle=hg(.8,.9);hx.lineWidth=rd*.9;hx.beginPath();hx.arc(px,py,rd,a0,a0+4);hx.stroke()}}
 else if(k==="tweed"){var tw=S/128;bg(.9,.4);for(i=0;i<S/tw;i++)for(j=0;j<S/tw;j++){var dia=((i+j)%4<2);x.fillStyle=R()<.07?rgb(1.18):R()<.07?rgb(.72):rgb(dia?1:.9);x.fillRect(i*tw,j*tw,tw-.5,tw-.5);hx.fillStyle=hg(dia?.75:.4);hx.fillRect(i*tw,j*tw,tw-.5,tw-.5)}}
 else if(k==="velvet"){var vn=tx4Noise(17,16),id=x.createImageData(S,S),hd=hx.createImageData(S,S);for(j=0;j<S;j++)for(i=0;i<S;i++){var q=tx4Fbm(vn,i/S*4,j/S*4,4,16),pp=(j*S+i)*4,f4=.82+q*.32+(R()-.5)*.04;
   id.data[pp]=Math.min(255,base[0]*f4);id.data[pp+1]=Math.min(255,base[1]*f4);id.data[pp+2]=Math.min(255,base[2]*f4);id.data[pp+3]=255;hd.data[pp]=hd.data[pp+1]=hd.data[pp+2]=128+(R()-.5)*30;hd.data[pp+3]=255}x.putImageData(id,0,0);hx.putImageData(hd,0,0)}
 else if(k==="basket"){var bl=S/24;bg(.7,.2);for(i=0;i<S/bl;i++)for(j=0;j<S/bl;j++)for(t=0;t<3;t++){var hz=(i+j)%2;x.fillStyle=rgb(.95+R()*.12);hx.fillStyle=hg(.8);if(hz){x.fillRect(i*bl,j*bl+t*bl/3+.5,bl,bl/3-1);hx.fillRect(i*bl,j*bl+t*bl/3+.5,bl,bl/3-1)}else{x.fillRect(i*bl+t*bl/3+.5,j*bl,bl/3-1,bl);hx.fillRect(i*bl+t*bl/3+.5,j*bl,bl/3-1,bl)}}}
 else if(k==="cord"){/* ペーパーコード：ねじれた紙ひもが交互に */var cw=S/36;bg(.55,.1);
  for(i=0;i<S/cw;i++)for(j=0;j<S/cw;j++){var hz2=(Math.floor(i/2)+Math.floor(j/2))%2;var X0=i*cw,Y0=j*cw,g=x.createLinearGradient(hz2?0:X0,hz2?Y0:0,hz2?0:X0+cw,hz2?Y0+cw:0);g.addColorStop(0,rgb(.72));g.addColorStop(.5,rgb(1.05));g.addColorStop(1,rgb(.72));
   x.fillStyle=g;x.fillRect(X0+.5,Y0+.5,cw-1,cw-1);x.strokeStyle=rgb(.7,.6);x.lineWidth=1;for(t=0;t<4;t++){x.beginPath();if(hz2){x.moveTo(X0+t*cw/4,Y0);x.lineTo(X0+t*cw/4+cw/5,Y0+cw)}else{x.moveTo(X0,Y0+t*cw/4);x.lineTo(X0+cw,Y0+t*cw/4+cw/5)}x.stroke()}
   var gh=hx.createLinearGradient(hz2?0:X0,hz2?Y0:0,hz2?0:X0+cw,hz2?Y0+cw:0);gh.addColorStop(0,hg(.3));gh.addColorStop(.5,hg(.9));gh.addColorStop(1,hg(.3));hx.fillStyle=gh;hx.fillRect(X0,Y0,cw,cw)}}
 else if(k==="cane"){/* 籐の網代：八角形の透かし編み（穴は透明） */var cs=S/10;x.clearRect(0,0,S,S);hx.fillStyle=hg(0);hx.fillRect(0,0,S,S);x.lineCap="butt";
  [[1,0],[0,1],[1,1],[1,-1]].forEach(function(dv,q){var n=q<2?10:14;for(i=-n;i<=n*2;i++){var off=i*cs*(q<2?1:.7071)*(q<2?1:1.414);x.strokeStyle=rgb(.9+R()*.15);x.lineWidth=cs*(q<2?.2:.16);hx.strokeStyle=hg(.85);hx.lineWidth=x.lineWidth;
   [x,hx].forEach(function(cx){cx.beginPath();if(q===0){cx.moveTo(0,off+cs*.5);cx.lineTo(S,off+cs*.5)}else if(q===1){cx.moveTo(off+cs*.5,0);cx.lineTo(off+cs*.5,S)}else if(q===2){cx.moveTo(off,0);cx.lineTo(off+S,S)}else{cx.moveTo(off,S);cx.lineTo(off+S,0)}cx.stroke()})}})}
 else if(k==="rattan"){var rw=S/36;bg(.6,.1);for(i=0;i<S/rw;i++){var f5=.88+R()*.2;for(j=0;j<S;j+=rw*2){var ov=((i+Math.floor(j/(rw*2)))%2);var gg=x.createLinearGradient(i*rw,0,i*rw+rw,0);gg.addColorStop(0,rgb(f5*.7));gg.addColorStop(.5,rgb(f5*1.05));gg.addColorStop(1,rgb(f5*.7));x.fillStyle=gg;
   x.fillRect(i*rw+.5,j+(ov?0:rw),rw-1,rw*(ov?2:1));hx.fillStyle=hg(ov?.85:.5);hx.fillRect(i*rw,j,rw,rw*2)}}}
 return{c:C,h:Hc}}

/* ---------- 素材（マテリアル） ---------- */
var NMC4={};
function texMat(k,col){var d=TEX[k];if(!d)return new THREE.MeshStandardMaterial({color:new THREE.Color(col||"#cccccc"),roughness:.7});if(!T.tx)T.tx={};
 if(!T.tx[k]){var mk=tx4Make(k),t=new THREE.CanvasTexture(mk.c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.encoding=THREE.sRGBEncoding;
  var n=null;try{n=nmapOf("t4:"+k,mk.h,d.g==="w"?2:d.g==="l"?1.6:d.g==="f"?2.4:d.g==="c"?3.2:d.g==="m"?1.2:1.6);n.anisotropy=8}catch(e){}
  T.tx[k]=t;T.tx["n:"+k]=n}
 var G=d.g,P={w:{r:.58,m:0,e:.7},f:{r:.94,m:0,e:.35},l:{r:.48,m:0,e:.8},c:{r:.72,m:0,e:.45},s:{r:k==="marble"?.12:k==="concrete"?.9:.5,m:0,e:1},m:{r:k==="chrome"?.12:k==="steel"?.34:k==="brass"?.3:.45,m:k==="blacksteel"?.5:.85,e:1.6},p:{r:.62,m:0,e:.6},g:{r:.04,m:0,e:1.5}}[G]||{r:.7,m:0,e:.6};
 var useCol=col&&(G==="f"||G==="l"||G==="p"||G==="c"||G==="m")?col:null;
 var m=G==="g"?new THREE.MeshPhysicalMaterial({color:new THREE.Color(useCol||"#eef4f5"),roughness:.04,metalness:0,transparent:true,opacity:.28,envMapIntensity:1.5,depthWrite:false}):
  new THREE.MeshStandardMaterial({map:T.tx[k],color:new THREE.Color(useCol?"#ffffff":"#ffffff"),roughness:P.r,metalness:P.m,envMapIntensity:P.e});
 if(G!=="g"){if(useCol){/* 色を指定したとき：布・革・金属は素材の明暗を残して色を変える */var cc=new THREE.Color(useCol),bc=new THREE.Color(d.c);m.color.setRGB(cc.r/Math.max(.05,bc.r),cc.g/Math.max(.05,bc.g),cc.b/Math.max(.05,bc.b))}
  if(T.tx["n:"+k]){m.normalMap=T.tx["n:"+k];var ns={w:.5,f:.55,l:.35,c:.9,s:.3,m:.25,p:.2}[G]||.5;m.normalScale=new THREE.Vector2(ns,ns)}
  if(k==="cane"){m.alphaTest=.4;m.side=THREE.DoubleSide;m.transparent=false}}
 m.userData.ts=d.s;m.userData.tk=k;m._lin=0;return m}
/* 色指定（sRGB）を、リニアへの変換の前に入れておく（linMats が変換する） */
