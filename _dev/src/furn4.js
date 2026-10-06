/* ===== 家具 v4：名作家具に似た形（一般名）＋ 汎用モデル =====
 * 1つの家具 = it.f4（形の種類）。部品はすべて part() 経由なので、パーツごとの色・素材の変更はそのまま使える。
 * 前（座る側）は +z、背は -z。床が y=0。単位 m。 */
var F4={},F4OPT={};
function f4V(a){return new THREE.Vector3(a[0],a[1],a[2])}
function f4Kit(it,bw,bh,bd,H){var P=H.part,K={_P:H.part,g:H.g},MC={};
 K.Hc=(function(){try{return(+document.getElementById("wh").value||2400)/1000}catch(e){return 2.4}})();
 /* 実際の光（フォトリアル表示のときだけ、最大4灯） */
 K.light=function(x,y,z,s){if(!(R3REAL&&typeof T!=="undefined"&&(T.nl=(T.nl||0)+1)<=4)||!H.g)return;var L=new THREE.PointLight(0xffd2a0,1.1*(s||1),5,2);L.userData.pti=.55*(s||1);L.position.set(x,y,z);H.g.add(L)};
 function upk(){var t=it.tex&&TEX[it.tex];return t&&(t.g==="f"||t.g==="l")?it.tex:null}
 function mc(k,f){if(!MC[k])MC[k]=f();return MC[k]}
 K.wood=function(def){return mc("w"+(def||""),function(){return texMat(it.wtex&&TEX[it.wtex]?it.wtex:def||"oak")})};
 K.fab=function(def,col){return mc("f"+def+(col||""),function(){return texMat(upk()||(it.ftex&&TEX[it.ftex]?it.ftex:def||"linen"),it.col||it.ccol||col||null)})};
 K.lea=function(def){return mc("l"+def,function(){return texMat(upk()||(it.ftex&&TEX[it.ftex]?it.ftex:def||"leather"),it.col||it.ccol||null)})};
 K.tx=function(k,c){return mc("t"+k+(c||""),function(){return texMat(k,c||null)})};
 K.col=function(h,r,m){return mc("c"+h+r+m,function(){return new THREE.MeshStandardMaterial({color:new THREE.Color(h),roughness:r==null?.6:r,metalness:m||0})})};
 K.main=H.mat;
 K.box=function(w,h,d,x,y,z,m,r){w=Math.max(.003,w);h=Math.max(.003,h);d=Math.max(.003,d);return P(rbx(w,h,d,r==null?Math.min(.004,Math.min(w,h,d)*.2):r),x,y,z,m,true)};
 /* クッション：角を大きく丸め、上面をふくらませる */
 K.cush=function(w,h,d,x,y,z,m,r,puff){w=Math.max(.01,w);h=Math.max(.01,h);d=Math.max(.01,d);var g=rbx(w,h,d,r==null?Math.min(.05,h*.42):r,4),p=g.attributes.position,i;puff=puff==null?h*.18:puff;
  for(i=0;i<p.count;i++){var X=p.getX(i)/(w/2),Y=p.getY(i)/(h/2),Z=p.getZ(i)/(d/2),f=Math.max(0,1-X*X)*Math.max(0,1-Z*Z);p.setY(i,p.getY(i)+puff*f*Math.max(0,Y)*.9-puff*.25*f*Math.max(0,-Y))}
  p.needsUpdate=true;g.computeVertexNormals();return P(g,x,y,z,m,true)};
 K.cyl=function(r1,r2,h,x,y,z,m,s){return P(new THREE.CylinderGeometry(r1,r2,Math.max(.002,h),s||24),x,y,z,m,true)};
 K.tube=function(pts,r,m,r2,rs){var tb=pl4Tube(pts.map(f4V),r,r2==null?r:r2,rs||14,Math.max(12,pts.length*10)),uv=tb.g.attributes.uv,cf=Math.PI*2*r;
  /* 木目・ヘアラインが管の長さ方向に流れるよう、UV を「長さ[m]×周[m]」にする */for(var q=0;q<uv.count;q++){var a=uv.getX(q),b=uv.getY(q);uv.setXY(q,b/4,a*cf)}uv.needsUpdate=true;return P(tb.g,0,0,0,m,true)};
 /* 2点を結ぶ脚（先細り可） */
 K.leg=function(a,b,r0,r1,m,s){var A=f4V(a),Bv=f4V(b),d=Bv.clone().sub(A),L=d.length();var pm=P(new THREE.CylinderGeometry(r1==null?r0:r1,r0,L,s||16),(A.x+Bv.x)/2,(A.y+Bv.y)/2,(A.z+Bv.z)/2,m,true);pm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return pm};
 K.lathe=function(prof,x,y,z,m,seg){var g=new THREE.LatheGeometry(prof.map(function(p){return new THREE.Vector2(p[0],p[1])}),seg||48);g.computeVertexNormals();return P(g,x,y,z,m,true)};
 /* 2D の形（xy）を z 方向に押し出す。中央に寄せる */
 K.ext=function(pts,depth,x,y,z,m,bev){var sh=new THREE.Shape();pts.forEach(function(p,i){if(i)sh.lineTo(p[0],p[1]);else sh.moveTo(p[0],p[1])});var b=bev==null?.003:bev,g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.001,depth-2*b),bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:16});g.translate(0,0,-(depth-2*b)/2);g.computeVertexNormals();return P(g,x,y,z,m,true)};
 /* 曲面（u,v→点）。厚みは両面表示で表現 */
 /* 厚みのある曲面（表・裏・ふち）。thick 省略時は 8mm */
 K.shell=function(nu,nv,fn,m,thick){thick=thick||.008;var Pp=[],U=[],I=[],i,j,A=[],G=(nu+1)*(nv+1),cu=0,cv=0;
  for(j=0;j<=nv;j++)for(i=0;i<=nu;i++)A.push(f4V(fn(i/nu,j/nv)));
  var tg=new THREE.BufferGeometry(),tp=[],ti=[];A.forEach(function(v){tp.push(v.x,v.y,v.z)});for(j=0;j<nv;j++)for(i=0;i<nu;i++){var a=j*(nu+1)+i;ti.push(a,a+nu+1,a+1,a+1,a+nu+1,a+nu+2)}
  tg.setAttribute("position",new THREE.Float32BufferAttribute(tp,3));tg.setIndex(ti);tg.computeVertexNormals();var NN=tg.attributes.normal;
  /* 実寸のUV（u 方向の長さ・v 方向の長さ） */var UU=[];for(j=0;j<=nv;j++)for(i=0;i<=nu;i++){var k=j*(nu+1)+i,uu=i?UU[(k-1)*2]+A[k].distanceTo(A[k-1]):0,vv=j?UU[(k-nu-1)*2+1]+A[k].distanceTo(A[k-nu-1]):0;UU.push(uu,vv)}
  for(var sd=0;sd<2;sd++)for(var q=0;q<G;q++){var v=A[q],o=sd?-thick:0;Pp.push(v.x+NN.getX(q)*o,v.y+NN.getY(q)*o,v.z+NN.getZ(q)*o);U.push(UU[q*2],UU[q*2+1])}
  for(j=0;j<nv;j++)for(i=0;i<nu;i++){var a2=j*(nu+1)+i;I.push(a2,a2+nu+1,a2+1,a2+1,a2+nu+1,a2+nu+2);I.push(G+a2,G+a2+1,G+a2+nu+1,G+a2+1,G+a2+nu+2,G+a2+nu+1)}
  /* ふち */var ring=[];for(i=0;i<=nu;i++)ring.push(i);for(j=1;j<=nv;j++)ring.push(j*(nu+1)+nu);for(i=nu-1;i>=0;i--)ring.push(nv*(nu+1)+i);for(j=nv-1;j>=1;j--)ring.push(j*(nu+1));ring.push(0);
  var RP=[],RU=[],RI=[];for(q=0;q<ring.length;q++){var e0=ring[q];RP.push(Pp[e0*3],Pp[e0*3+1],Pp[e0*3+2],Pp[(G+e0)*3],Pp[(G+e0)*3+1],Pp[(G+e0)*3+2]);RU.push(q*.01,0,q*.01,thick)}
  for(q=0;q<ring.length-1;q++){var f0=q*2,f1=f0+2;RI.push(f0,f0+1,f1,f1,f0+1,f1+1)}
  var g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(Pp,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();var main=P(g,0,0,0,m,true);
  var rg=new THREE.BufferGeometry();rg.setAttribute("position",new THREE.Float32BufferAttribute(RP,3));rg.setAttribute("uv",new THREE.Float32BufferAttribute(RU,2));rg.setIndex(RI);rg.computeVertexNormals();
  var rm=main.material.clone();rm.side=THREE.DoubleSide;rm._lin=main.material._lin;var rim=new THREE.Mesh(rg,rm);rim.castShadow=true;main.add(rim);return main};
 /* 断面（z,y の折れ線）に沿って、幅 hw(v)、横方向のそり cv(v) を持つ曲面。前後左右対称の椅子の座・背に */
 K.prof=function(pr,hw,cvf,m,thick,nu,nv,wd){var cr=new THREE.CatmullRomCurve3(pr.map(function(p){return new THREE.Vector3(0,p[1],p[0])}),false,"centripetal");
  return K.shell(nu||20,nv||40,function(u,v){var p=cr.getPointAt(v),t=cr.getTangentAt(v),n=new THREE.Vector3(0,t.z,-t.y);if(n.y<0||(Math.abs(n.y)<.3&&n.z<0))n.negate();n.y*=Math.max(0,1-Math.abs(t.y)*1.4);n.normalize();if(wd)n.set(0,wd[0],wd[1]).normalize();var x=(u-.5)*2,h=hw(v),c=cvf(v)*x*x;return[x*h,p.y+n.y*c,p.z+n.z*c]},m,thick)};
 K.surf=function(nu,nv,fn,m,thick){var Pp=[],U=[],I=[],i,j;for(j=0;j<=nv;j++)for(i=0;i<=nu;i++){var q=fn(i/nu,j/nv);Pp.push(q[0],q[1],q[2]);U.push(i/nu,j/nv)}
  for(j=0;j<nv;j++)for(i=0;i<nu;i++){var a=j*(nu+1)+i;I.push(a,a+nu+1,a+1,a+1,a+nu+1,a+nu+2)}
  var g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(Pp,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();
  var mm=m;if(m&&m.side!==THREE.DoubleSide){mm=m.clone();mm.side=THREE.DoubleSide;mm._lin=m._lin}return P(g,0,0,0,mm,true)};
 K.arc=function(cx,cy,cz,rx,rz,a0,a1,y,n){var o=[];n=n||12;for(var i=0;i<=n;i++){var a=a0+(a1-a0)*i/n;o.push([cx+Math.sin(a)*rx,y,cz-Math.cos(a)*rz])}return o};
 return K}
function furn4(it,bw,bh,bd,H){var f=F4[it.f4];if(!f)return false;f(f4Kit(it,bw,bh,bd,H),it,bw,bh,bd);return true}

/* ============ 椅子 ============ */
/* Y字背のペーパーコードチェア：弓なりの背と肘、Y字の背板、紙ひもの座 */
F4.wish=function(K,it,W,Hh,D){var w=K.wood("oak"),sh=.43,lr=.017;
 [-1,1].forEach(function(s){K.leg([s*(W/2-.04),0,D/2-.05],[s*(W/2-.035),sh,D/2-.04],lr*1.05,lr,w);K.tube([[s*(W/2-.05),0,-D/2+.06],[s*(W/2-.055),sh*.6,-D/2+.07],[s*(W/2-.06),sh+.08,-D/2+.1],[s*(W/2-.075),.66,-D/2+.13]],lr,w,lr*.85)});
 K.box(W-.06,.025,.03,0,sh-.025,D/2-.04,w,.008);K.box(W-.08,.025,.03,0,sh-.025,-D/2+.09,w,.008);[-1,1].forEach(function(s){K.box(.03,.025,D-.12,s*(W/2-.045),sh-.025,.02,w,.008)});
 K.box(W-.1,.022,D-.13,0,sh-.008,.02,K.tx("cord"),.006);
 K.tube(K.arc(0,.665,-.02,W/2-.07,.27,-1.75,1.75,.665,18),.016,w);
 K.ext([[-.075,-.12],[.075,-.12],[.025,.02],[.06,.13],[-.06,.13],[-.025,.02]],.016,0,sh+.115,-D/2+.135,w,.002).rotation.x=.12;
 [-1,1].forEach(function(s){K.box(.022,.022,D*.5,s*(W/2-.04),.13,.02,w,.006)})};
/* 樹脂シェルチェア（木の脚）：一体成形の座面と、ワイヤー補強の木脚 */
F4.shell=function(K,it,W,Hh,D){var sm=K.col(it.col||"#ecebe7",.42),w=K.wood("maple"),bl=K.col("#1d1d1d",.4,.6),sh=.44,hw0=W/2-.005;
 K.prof([[D/2-.015,sh+.035],[D/2-.05,sh+.012],[.02,sh-.005],[-D/2+.15,sh+.01],[-D/2+.08,sh+.1],[-D/2+.035,sh+.24],[-D/2+.022,Hh-.08],[-D/2+.012,Hh]],
  function(v){return v<.35?hw0*(.9+.1*Math.sin(v/.35*Math.PI/2)):v<.6?hw0*(1-.05*Math.sin((v-.35)/.25*Math.PI)):hw0*(1+.08*Math.sin((v-.6)/.4*Math.PI/2))*(v>.9?Math.sqrt(Math.max(.05,1-Math.pow((v-.9)/.1,2)*.6)):1)},
  function(v){return v<.08?.03:v<.45?.07:.1},sm,.007,24,48,[.55,.85]);
 [-1,1].forEach(function(s){[-1,1].forEach(function(b){K.leg([s*.2,0,b*.21],[s*.11,sh-.02,b*.12],.011,.013,w)})});
 [[-1,1],[1,-1]].forEach(function(q){K.tube([[q[0]*.175,.17,q[1]*.185],[0,.25,0],[-q[0]*.175,.17,-q[1]*.185]],.0028,bl)});[[-1,-1],[1,1]].forEach(function(q){K.tube([[q[0]*.175,.17,q[1]*.185],[0,.25,0],[-q[0]*.175,.17,-q[1]*.185]],.0028,bl)});
 K.box(.2,.012,.2,0,sh-.022,0,bl,.004)};
/* 曲げ木チェア：曲げた丸棒の背と輪の補強 */
F4.bent=function(K,it,W,Hh,D){var w=K.wood("beech"),sh=.46,r=.014;
 K.cyl(W/2-.02,W/2-.02,.03,0,sh-.015,0,w,40);K.cyl(W/2-.04,W/2-.04,.012,0,sh+.002,0,K.tx("cane"),40);
 [-1,1].forEach(function(s){K.leg([s*(W/2-.03),0,D/2-.06],[s*(W/2-.06),sh-.02,.1],r,r*1.15,w)});
 K.tube([[-.17,0,-D/2+.07],[-.15,sh,-.12],[-.16,.72,-D/2+.07],[-.1,.86,-D/2+.04],[0,.88,-D/2+.035],[.1,.86,-D/2+.04],[.16,.72,-D/2+.07],[.15,sh,-.12],[.17,0,-D/2+.07]],r,w);
 K.tube([[-.11,sh+.02,-.11],[-.12,.62,-D/2+.08],[0,.7,-D/2+.07],[.12,.62,-D/2+.08],[.11,sh+.02,-.11]],r*.8,w);
 var ring=[];for(var i=0;i<=24;i++){var a=i/24*6.283;ring.push([Math.sin(a)*(W/2-.035),.2,Math.cos(a)*(W/2-.04)])}K.tube(ring,r*.7,w)};
/* ウィンザーチェア：彫りの入った座と細いスピンドルの背 */
F4.windsor=function(K,it,W,Hh,D){var w=K.wood("ash"),sh=.44;
 K.lathe([[0,0],[W/2-.01,0],[W/2,.02],[W/2-.02,.04],[0,.04]],0,sh-.04,0,w,48).scale.set(1,1,D/W*.95);
 [-1,1].forEach(function(s){[-1,1].forEach(function(b){K.leg([s*(W/2-.02),0,b*(D/2-.03)],[s*(W/2-.08),sh-.04,b*(D/2-.11)],.013,.017,w)})});
 K.tube([[-(W/2-.07),.18,0],[W/2-.07,.18,0]],.009,w);
 var top=K.arc(0,0,-.02,W/2-.05,D/2-.03,-1.35,1.35,Hh-.03,16);K.tube(top,.017,w);
 for(var i=0;i<7;i++){var a=-1.1+i*2.2/6,x=Math.sin(a)*(W/2-.06),z=-.02-Math.cos(a)*(D/2-.05);K.tube([[x*.82,sh,z*.78+.01],[x,Hh-.03,z]],.0065,w)}};
/* カンチレバーチェア：スチールパイプのフレームに籐の座と背 */
F4.cant=function(K,it,W,Hh,D){var c=K.tx("chrome"),w=K.wood("blackoak"),cn=K.tx("cane"),sh=.46,r=.0125;
 [-1,1].forEach(function(s){var x=s*(W/2-.02);K.tube([[x,.012,-D/2+.08],[x,.012,D/2-.04],[x,.03,D/2-.02],[x,.2,D/2-.06],[x,sh-.03,.0],[x,sh-.03,-D/2+.1],[x,Hh-.03,-D/2+.04]],r,c)});
 K.tube([[-(W/2-.02),.012,-D/2+.08],[W/2-.02,.012,-D/2+.08]],r,c);
 K.box(W-.02,.03,D-.12,0,sh,.03,w,.01);K.box(W-.09,.006,D-.19,0,sh+.016,.03,cn,.002);
 K.box(W-.04,.24,.025,0,Hh-.15,-D/2+.07,w,.01).rotation.x=-.1;K.box(W-.11,.17,.006,0,Hh-.15,-D/2+.082,cn,.002).rotation.x=-.1};
/* 成形合板のスタッキングチェア：くびれた一枚板の座と背、細いスチール脚 */
F4.ply=function(K,it,W,Hh,D){var pw=it.tex&&TEX[it.tex]?texMat(it.tex,it.col):K.wood("plywood"),st=K.tx("chrome"),sh=.45,hw0=W/2-.01;
 K.prof([[D/2-.01,sh+.012],[D/2-.07,sh+.016],[0,sh],[-D/2+.14,sh+.012],[-D/2+.09,sh+.09],[-D/2+.06,sh+.2],[-D/2+.045,Hh-.1],[-D/2+.035,Hh]],
  function(v){var a;if(v<.32)a=1-.08*Math.pow(v/.32,2);else if(v<.5)a=.92-.6*Math.sin((v-.32)/.18*Math.PI/2);else if(v<.62)a=.32+.5*Math.sin((v-.5)/.12*Math.PI/2);else a=.82+.06*Math.sin((v-.62)/.38*Math.PI);
   if(v>.9)a*=Math.sqrt(Math.max(.08,1-Math.pow((v-.9)/.1,2)*.85));if(v<.04)a*=Math.sqrt(Math.max(.3,1-Math.pow((.04-v)/.04,2)*.5));return hw0*a},
  function(v){return v<.4?.012:v<.6?.02:.05},pw,.01,24,56);
 [-1,1].forEach(function(s){[-1,1].forEach(function(b){K.leg([s*(W/2-.05),0,b*(D/2-.07)],[s*.12,sh-.03,b*.1],.008,.008,st)})});K.box(.26,.012,.22,0,sh-.028,-.02,st,.004)};
/* ラウンドバックのアームチェア：背から肘へつながる一続きの笠木 */
F4.round=function(K,it,W,Hh,D){var w=K.wood("teak"),sh=.44,ah=.69;
 [-1,1].forEach(function(s){[-1,1].forEach(function(b){K.leg([s*(W/2-.05),0,b*(D/2-.06)],[s*(W/2-.06),b>0?ah-.04:ah,b*(D/2-.08)],.02,.016,w)})});
 K.box(W-.1,.03,.03,0,sh-.04,D/2-.07,w,.008);K.box(W-.1,.03,.03,0,sh-.04,-D/2+.07,w,.008);[-1,1].forEach(function(s){K.box(.03,.03,D-.14,s*(W/2-.06),sh-.04,0,w,.008)});
 K.box(W-.12,.02,D-.16,0,sh-.015,0,K.tx("cane"),.004);
 var rail=K.arc(0,0,.02,W/2-.05,D/2-.07,-1.95,1.95,ah+.015,22);rail.unshift([-(W/2-.05),ah,D/2-.09]);rail.push([W/2-.05,ah,D/2-.09]);K.tube(rail,.022,w,.016);
 K.ext([[-.13,-.07],[.13,-.07],[.1,.07],[-.1,.07]],.02,0,sh+.15,-D/2+.08,w,.004)};
/* カウンタースツール：細いスチールの4本脚と丸い木座 */
F4.bar=function(K,it,W,Hh,D){var w=K.wood("oak"),st=K.tx("blacksteel");K.cyl(W/2-.01,W/2-.02,.035,0,Hh-.018,0,w,40);
 [0,1,2,3].forEach(function(i){var a=i*Math.PI/2+.785;K.leg([Math.sin(a)*(W/2-.01),0,Math.cos(a)*(W/2-.01)],[Math.sin(a)*(W/2-.06),Hh-.035,Math.cos(a)*(W/2-.06)],.009,.009,st)});
 var ring=[];for(var i=0;i<=20;i++){var a=i/20*6.283;ring.push([Math.sin(a)*(W/2-.03),.3,Math.cos(a)*(W/2-.03)])}K.tube(ring,.008,st)};

/* ============ ラウンジチェア ============ */
/* 成形合板と革のラウンジチェア（オットマンは別） */
F4.lounge=function(K,it,W,Hh,D){var pw=K.wood("walnut"),le=K.lea("leatherblk"),al=K.tx("blacksteel"),st=K.tx("chrome"),sh=.38;
 /* 5本脚の台座と回転軸 */for(var i=0;i<5;i++){var a=i/5*6.283;K.box(.36,.025,.04,Math.sin(a)*.18,.06,Math.cos(a)*.18,al,.01).rotation.y=a+Math.PI/2}K.cyl(.03,.03,.22,0,.16,0,st,16);
 /* 座の殻とクッション */K.box(W-.12,.05,D-.28,0,sh-.03,.05,pw,.02).rotation.x=.08;K.cush(W-.16,.13,D-.32,0,sh+.04,.06,le,.05,.025).rotation.x=.08;
 /* 背（2段の殻とクッション） */[0,1].forEach(function(q){var y=sh+.17+q*.29,z=-D/2+.2-q*.1;var b=K.box(W-.1,.3,.05,0,y,z,pw,.02);b.rotation.x=-.32;var c=K.cush(W-.14,.28,.12,0,y+.01,z+.07,le,.05,.02);c.rotation.x=-.32});
 /* 肘 */[-1,1].forEach(function(s){K.box(.07,.03,D*.62,s*(W/2-.04),sh+.2,.0,pw,.01);K.cush(.08,.05,D*.56,s*(W/2-.04),sh+.24,.0,le,.02,.01)})};
F4.otto=function(K,it,W,Hh,D){var pw=K.wood("walnut"),le=K.lea("leatherblk"),al=K.tx("blacksteel");for(var i=0;i<4;i++){var a=i/4*6.283+.785;K.box(.28,.025,.035,Math.sin(a)*.12,.04,Math.cos(a)*.12,al,.01).rotation.y=a+Math.PI/2}
 K.cyl(.025,.025,.2,0,.15,0,K.tx("chrome"),16);K.box(W,.05,D,0,Hh-.12,0,pw,.02);K.cush(W-.04,.11,D-.04,0,Hh-.05,0,le,.05,.02)};
/* X脚フレームの革のチェア：平らなステンレスのX脚と、ボタン留めのクッション */
F4.xframe=function(K,it,W,Hh,D){var st=K.tx("steel"),le=K.lea("leather"),sh=.42;
 [-1,1].forEach(function(s){var x=s*(W/2-.03);K.tube([[x,0,D/2-.05],[x,.2,.15],[x,sh-.02,-.05],[x,.62,-D/2+.08],[x,Hh-.02,-D/2+.06]],.012,st);K.tube([[x,0,-D/2+.06],[x,.18,-.1],[x,sh-.02,.14],[x,sh-.01,D/2-.04]],.012,st)});
 [[-1,1],[1,1],[-1,-1]].forEach(function(){});for(var i=0;i<3;i++)K.box(W-.05,.012,.03,0,sh-.03,.16-i*.15,K.tx("leatherblk"),.004);
 K.cush(W-.06,.1,D-.12,0,sh+.03,.02,le,.04,.02).rotation.x=.06;var b=K.cush(W-.06,.48,.1,0,sh+.3,-D/2+.14,le,.04,.02);b.rotation.x=-.2};
/* スチールパイプのキューブチェア：外側のフレームに、大きな箱型のクッションをはめる */
F4.cube=function(K,it,W,Hh,D){var c=K.tx("chrome"),le=K.lea("leatherblk"),f=.02,ft=.16;
 [-1,1].forEach(function(s){[-1,1].forEach(function(b){K.leg([s*(W/2-f),0,b*(D/2-f)],[s*(W/2-f),.62,b*(D/2-f)],.012,.012,c)})});
 [-1,1].forEach(function(s){K.tube([[s*(W/2-f),.62,D/2-f],[s*(W/2-f),.62,-(D/2-f)]],.012,c);K.tube([[s*(W/2-f),ft,D/2-f],[s*(W/2-f),ft,-(D/2-f)]],.012,c)});
 K.tube([[-(W/2-f),.62,-(D/2-f)],[W/2-f,.62,-(D/2-f)]],.012,c);K.tube([[-(W/2-f),ft,D/2-f],[W/2-f,ft,D/2-f]],.012,c);
 var n=Math.max(1,Math.round((W-.4)/.6)),cw=(W-.36)/n;for(var i=0;i<n;i++){var x=-W/2+.18+cw*(i+.5);K.cush(cw-.01,.2,D-.24,x,ft+.12,.06,le,.04,.02);K.cush(cw-.01,.42,.18,x,ft+.3,-D/2+.11,le,.04,.02)}
 [-1,1].forEach(function(s){K.cush(.16,.44,D-.04,s*(W/2-.1),ft+.24,0,le,.04,.015)})};
/* 北欧の木フレーム・イージーチェア：浮いた座と背、彫刻的な肘 */
F4.danish=function(K,it,W,Hh,D){var w=K.wood("teak"),fb=K.fab("wool",it.ccol||"#8a8a86"),sh=.4;
 [-1,1].forEach(function(s){var x=s*(W/2-.04);K.leg([x,0,D/2-.08],[x,.58,D/2-.12],.02,.016,w);K.leg([x,0,-D/2+.1],[x,.5,-D/2+.06],.02,.016,w);
  K.tube([[x,.58,D/2-.1],[x,.6,0],[x,.55,-D/2+.12]],.022,w,.016);K.box(.03,.03,D-.18,x,.22,0,w,.008)});
 K.cush(W-.14,.12,D-.2,0,sh,.05,fb,.04,.02).rotation.x=.06;var b=K.cush(W-.16,.48,.11,0,sh+.3,-D/2+.16,fb,.04,.02);b.rotation.x=-.24};

/* ============ ソファ ============ */
/* 汎用ソファ：肘（細い・太い・なし）、脚（木・金属・台座）、背（低い・高い）を選べる */
F4OPT.sofa=[["arm","肘",[["t","細い"],["k","太い"],["n","なし"]]],["leg","脚",[["w","木の脚"],["m","金属の脚"],["p","台座（脚なし）"]]],["bk","背",[["l","低め"],["h","高め"]]],["cu","座の形",[["s","分かれた座面"],["b","一枚の座面"]]]];
F4.sofa=function(K,it,W,Hh,D){var fb=K.fab(it.ftex||"linen",it.ccol),w=K.wood("oak"),mt=K.tx("blacksteel"),arm=it.arm||"t",leg=it.leg||"w",bk=it.bk||"l",cu=it.cu||"s",lg=leg==="p"?.03:.13,aw=arm==="n"?0:arm==="k"?.2:.09,base=.2,sh=lg+base+.06,bH=bk==="h"?Hh-sh:Math.min(Hh-sh,.32);
 if(leg==="w")[-1,1].forEach(function(s){[-1,1].forEach(function(b){K.leg([s*(W/2-.08),0,b*(D/2-.08)],[s*(W/2-.07),lg+.01,b*(D/2-.07)],.016,.022,w)})});
 else if(leg==="m")[-1,1].forEach(function(s){[-1,1].forEach(function(b){K.leg([s*(W/2-.08),0,b*(D/2-.08)],[s*(W/2-.08),lg+.01,b*(D/2-.08)],.01,.01,mt)})});
 else K.box(W-.06,lg,D-.06,0,lg/2,0,K.col("#222",.6),.004);
 K.cush(W,base,D,0,lg+base/2,0,fb,.03,.004);
 if(aw)[-1,1].forEach(function(s){K.cush(aw,Hh*(arm==="k"?.62:.68)-lg,D,s*(W/2-aw/2),lg+(Hh*(arm==="k"?.62:.68)-lg)/2,0,fb,arm==="k"?.06:.035,.01)});
 var iw=W-2*aw,n=cu==="b"?1:Math.max(1,Math.round(iw/.62)),cw=iw/n;
 for(var i=0;i<n;i++){var x=-iw/2+cw*(i+.5);K.cush(cw-.006,.15,D-.26,x,lg+base+.07,.11,fb,.05,.025);var c=K.cush(cw-.012,bH+.02,.2,x,sh+bH/2-.02,-D/2+.13,fb,.06,.03);c.rotation.x=-.1}};
/* 北欧の木フレームソファ：木の枠に、置き型のクッション */
F4.dsofa=function(K,it,W,Hh,D){var w=K.wood("teak"),fb=K.fab("wool",it.ccol||"#7d8077"),sh=.42;
 [-1,1].forEach(function(s){var x=s*(W/2-.03);K.leg([x,0,D/2-.06],[x,.58,D/2-.08],.02,.017,w);K.leg([x,0,-D/2+.07],[x,Hh-.05,-D/2+.04],.02,.017,w);K.tube([[x,.58,D/2-.07],[x,.6,0],[x,.56,-D/2+.08]],.022,w,.018)});
 K.box(W-.06,.04,.04,0,.27,D/2-.07,w,.01);K.box(W-.06,.04,.04,0,.27,-D/2+.08,w,.01);
 var n=Math.max(1,Math.round((W-.1)/.6)),cw=(W-.1)/n;for(var i=0;i<n;i++){var x=-(W-.1)/2+cw*(i+.5);K.cush(cw-.01,.13,D-.14,x,sh-.06,.03,fb,.04,.02);var b=K.cush(cw-.01,.45,.11,x,sh+.25,-D/2+.13,fb,.04,.02);b.rotation.x=-.2}};

/* ============ テーブル ============ */
F4OPT.table=[["top","天板",[["r","長方形"],["o","楕円"],["c","丸"]]],["lg","脚",[["4","4本脚"],["t","トレッスル（板脚）"],["p","1本脚"]]]];
F4.table=function(K,it,W,Hh,D){var top=it.top||"r",lg=it.lg||"4",w=K.wood("oak"),tm=it.tex&&TEX[it.tex]?texMat(it.tex,it.col):w,tk=.03;
 if(top==="r")K.box(W,tk,D,0,Hh-tk/2,0,tm,.006);
 else{var g=top==="c"?K.cyl(Math.min(W,D)/2,Math.min(W,D)/2-.004,tk,0,Hh-tk/2,0,tm,64):K.cyl(.5,.496,tk,0,Hh-tk/2,0,tm,64);if(top==="o")g.scale.set(W,1,D);if(top==="c"){}}
 if(lg==="p"){K.lathe([[0,0],[.26,0],[.27,.01],[.06,.08],[.04,Hh*.5],[.06,Hh-tk-.05],[.16,Hh-tk],[0,Hh-tk]],0,0,0,it.lcol?K.col(it.lcol,.4):K.col("#efeeea",.35),56)}
 else if(lg==="t")[-1,1].forEach(function(s){var x=s*(W/2-.2);K.box(.04,Hh-tk-.05,D*.62,x,(Hh-tk)/2+.02,0,w,.01);K.box(.06,.04,D*.75,x,.02,0,w,.01);K.box(.05,.05,D*.7,x,Hh-tk-.03,0,w,.01)});
 else{var ix=top==="r"?W/2-.06:W*.32,iz=top==="r"?D/2-.06:D*.32;[-1,1].forEach(function(s){[-1,1].forEach(function(b){K.leg([s*ix,0,b*iz],[s*ix,Hh-tk,b*iz],.018,.024,w)})});if(top==="r"){K.box(W-.16,.07,.022,0,Hh-tk-.035,D/2-.07,w,.005);K.box(W-.16,.07,.022,0,Hh-tk-.035,-D/2+.07,w,.005)}}};
/* ガラス天板のコーヒーテーブル：曲線の木の脚を2枚、組み合わせる */
F4.glasst=function(K,it,W,Hh,D){var w=K.wood("walnut"),gl=K.tx("glass"),tk=.019,h=Hh-tk,sc=Math.min(W,1.4)/1.27;
 var pr=[[-.44,0],[-.27,0],[-.12,h*.42],[.12,h*.86],[.3,h],[.08,h],[-.1,h*.72],[-.28,h*.3]].map(function(p){return[p[0]*sc,p[1]]});
 var a=K.ext(pr,.055,-.06*sc,0,.04,w,.008);a.rotation.y=.42;var b=K.ext(pr.map(function(p){return[-p[0],p[1]]}),.055,.08*sc,0,-.05,w,.008);b.rotation.y=-.5;
 var t=K.cyl(.5,.5,tk,0,Hh-tk/2,0,gl,72);t.scale.set(W,1,D);t.geometry.translate(0,0,0);var r=W/2,pts=[];for(var i=0;i<=72;i++){var q=i/72*6.283,f=1+.07*Math.cos(q*1)-.05*Math.cos(2*q);pts.push([Math.cos(q)*f,Math.sin(q)])}
 /* 縁の青みがかったガラスの厚み */var e=K.cyl(.5,.5,tk*.96,0,Hh-tk/2,0,K.col("#9fc3bd",.08),72);e.scale.set(W*1.002,1,D*1.002);e.material=e.material.clone();e.material.transparent=true;e.material.opacity=.35};
F4.ctab=function(K,it,W,Hh,D){var w=K.wood("oak");K.cyl(W/2,W/2-.006,.03,0,Hh-.015,0,w,64);K.cyl(W/2-.03,W/2-.03,.02,0,.12,0,w,64);[0,1,2].forEach(function(i){var a=i*2.094;K.leg([Math.sin(a)*(W/2-.06),0,Math.cos(a)*(W/2-.06)],[Math.sin(a)*(W/2-.06),Hh-.03,Math.cos(a)*(W/2-.06)],.018,.022,w)})};
/* C型のサイドテーブル：ソファの下に差し込めるスチールの枠 */
F4.cside=function(K,it,W,Hh,D){var st=K.tx("blacksteel"),tp=it.tex&&TEX[it.tex]?texMat(it.tex,it.col):K.tx("marble");K.box(W,.012,D,0,.006,0,st,.003);K.leg([0,.01,-D/2+.03],[0,Hh-.02,-D/2+.03],.012,.012,st);K.cyl(Math.min(W,D)/2,Math.min(W,D)/2,.02,0,Hh-.01,0,tp,56)};
/* 一本脚の丸テーブル（白） */
F4.tulip=function(K,it,W,Hh,D){var m=K.col("#f3f2ee",.3),tp=it.tex&&TEX[it.tex]?texMat(it.tex,it.col):K.tx("marble");K.lathe([[0,0],[.25,0],[.26,.012],[.08,.09],[.045,Hh*.45],[.08,Hh-.06],[.22,Hh-.02],[0,Hh-.02]],0,0,0,m,64);K.cyl(W/2,W/2-.004,.02,0,Hh-.01,0,tp,72)};

/* ============ 収納 ============ */
/* 脚付きのサイドボード（引き戸・木の取っ手） */
F4.board=function(K,it,W,Hh,D){var w=K.wood("teak"),dk=K.wood("walnut"),lg=.16,bh=Hh-lg;
 [-1,1].forEach(function(s){[-1,1].forEach(function(b){K.leg([s*(W/2-.06),0,b*(D/2-.06)],[s*(W/2-.05),lg,b*(D/2-.05)],.014,.02,w)})});
 K.box(W,bh,D,0,lg+bh/2,0,w,.006);var n=Math.max(2,Math.round(W/.42)),dw=(W-.04)/n;for(var i=0;i<n;i++){var x=-W/2+.02+dw*(i+.5);K.box(dw-.006,bh-.05,.012,x,lg+bh/2,D/2+.004,w,.003);K.box(.012,bh*.5,.016,x+(i%2?-1:1)*(dw/2-.04),lg+bh/2,D/2+.012,dk,.004)}};
/* 汎用オープンシェルフ：段数と背板 */
F4OPT.shelf=[["tiers","段数",[["2","2段"],["3","3段"],["4","4段"],["5","5段"]]],["back","背板",[["y","あり"],["n","なし"]]]];
F4.shelf=function(K,it,W,Hh,D){var w=K.wood("oak"),n=+(it.tiers||4),t=.02;[-1,1].forEach(function(s){K.box(t,Hh,D,s*(W/2-t/2),Hh/2,0,w,.004)});
 for(var i=0;i<=n;i++){var y=i===0?.05:t/2+(Hh-t)*i/n;if(i===n)y=Hh-t/2;K.box(W-2*t,t,D-.005,0,y,0,w,.004)}K.box(W-2*t,.05,.015,0,.025,D/2-.01,w,.003);if((it.back||"y")==="y")K.box(W-2*t,Hh-.06,.006,0,Hh/2+.02,-D/2+.004,w,.002)};
/* ウォールラック：細いスチールの支柱と木の棚板 */
F4.wrack=function(K,it,W,Hh,D){var st=K.tx("blacksteel"),w=K.wood("walnut");[-1,1].forEach(function(s){K.box(.012,Hh,.012,s*(W/2-.01),Hh/2,-D/2+.01,st,.002);K.box(.012,.012,D,s*(W/2-.01),.006,0,st,.002);
  for(var i=0;i<5;i++){var y=.32+i*(Hh-.4)/4;K.tube([[s*(W/2-.01),y,-D/2+.01],[s*(W/2-.01),y-.005,D/2-.02]],.003,st)}});
 for(var i=0;i<5;i++){var y=.32+i*(Hh-.4)/4;K.box(W-.04,.018,D-.03,0,y+.01,0,w,.004)}};
/* チェスト：引き出し5段、くぼみの取っ手 */
F4.chest=function(K,it,W,Hh,D){var w=K.wood("oak"),lg=.08,n=+(it.tiers||5),h=Hh-lg;K.box(W,h,D,0,lg+h/2,0,w,.006);[-1,1].forEach(function(s){K.box(.05,lg,D-.06,s*(W/2-.05),lg/2,0,w,.004)});
 for(var i=0;i<n;i++){var y=lg+(h-.03)*(i+.5)/n+.015;K.box(W-.04,(h-.03)/n-.008,.014,0,y,D/2,w,.003);K.box(.12,.012,.01,0,y+(h-.03)/n/2-.03,D/2+.008,K.col("#2a2622",.6),.004)}};
/* TVボード：ロータイプ、引き出し2つとオープン棚 */
F4.tvb=function(K,it,W,Hh,D){var w=K.wood("walnut"),lg=.12,h=Hh-lg;[-1,1].forEach(function(s){K.box(.04,lg,D-.08,s*(W/2-.08),lg/2,0,K.tx("blacksteel"),.004)});
 K.box(W,h,D,0,lg+h/2,0,w,.006);K.box(W*.36,h-.06,.012,-W/2+W*.2,lg+h/2,D/2+.002,w,.003);K.box(W*.36,h-.06,.012,W/2-W*.2,lg+h/2,D/2+.002,w,.003);K.box(W*.24,h-.07,D-.06,0,lg+h/2,.02,K.col("#3a2c22",.7),.004)};

/* ============ デスク・ベッド ============ */
F4OPT.desk=[["dr","引き出し",[["y","あり"],["n","なし"]]]];
F4.desk=function(K,it,W,Hh,D){var w=K.wood("oak"),tk=.025;K.box(W,tk,D,0,Hh-tk/2,0,w,.005);[-1,1].forEach(function(s){[-1,1].forEach(function(b){K.leg([s*(W/2-.05),0,b*(D/2-.05)],[s*(W/2-.05),Hh-tk,b*(D/2-.05)],.016,.02,w)})});
 if((it.dr||"y")==="y"){K.box(W*.42,.1,D-.08,W*.18,Hh-tk-.05,0,w,.004);K.box(.1,.01,.01,W*.18,Hh-tk-.05,D/2-.035,K.col("#2a2622",.6),.003)}};
F4OPT.bed=[["hb","ヘッドボード",[["p","板"],["u","布張り"],["n","なし"]]]];
F4.bed=function(K,it,W,Hh,D){var w=K.wood("oak"),fb=K.fab("linen","#e9e5dd"),bl=K.fab("linen",it.ccol||"#d8d3ca"),hb=it.hb||"p",fh=.26;
 K.box(W,.2,D,0,.13,0,w,.008);[-1,1].forEach(function(s){[-1,1].forEach(function(b){K.box(.06,.04,.06,s*(W/2-.08),.02,b*(D/2-.08),w,.004)})});
 K.cush(W-.04,.2,D-.06,0,fh+.07,.02,K.col("#f4f2ee",.9),.04,.01);K.cush(W-.02,.03,D*.66,0,fh+.18,D*.15,bl,.015,.012);
 var np=W>1.3?2:1,pw=np===2?W*.42:W*.66;for(var i=0;i<np;i++)K.cush(pw,.12,.36,np===2?(i?1:-1)*W*.23:0,fh+.24,-D/2+.27,fb,.05,.03);
 if(hb==="p")K.box(W,Hh-.05,.04,0,(Hh-.05)/2+.05,-D/2+.02,w,.006);else if(hb==="u")K.cush(W,Hh-.05,.1,0,(Hh-.05)/2+.05,-D/2+.05,bl,.04,.02)};

/* ============ 照明 ============ */
/* 3枚のシェードを重ねたペンダント */
F4.pend3=function(K,it,W,Hh,D){var m=K.col(it.col||"#f4f2ee",.35),y0=Math.max(1.5,K.Hc-.65);K.cyl(.003,.003,K.Hc-y0,0,(K.Hc+y0)/2,0,K.col("#222",.5),8);K.cyl(.05,.05,.02,0,K.Hc-.01,0,m,24);
 [[W/2,.12,0],[W*.37,.085,.12],[W*.22,.06,.2]].forEach(function(q,i){K.lathe([[q[0]*.18,0],[q[0]*.55,-.02],[q[0],-q[1]],[q[0]*.98,-q[1]-.006],[q[0]*.5,-.025],[q[0]*.16,-.004]],0,y0-q[2],0,m,48)});
 K.cyl(.03,.03,.05,0,y0-.16,0,new THREE.MeshStandardMaterial({color:0xfff3d8,emissive:0xffe2a8,emissiveIntensity:1.2}),16);K.light(0,y0-.25,0)};
/* アーチ型フロアランプ：大理石の台と、大きく弧を描く支柱 */
F4.arc=function(K,it,W,Hh,D){var st=K.tx("steel"),mb=K.tx("marble"),x0=-W/2+.15;K.box(.3,.4,.2,x0,.2,0,mb,.01);var pts=[],ar=(W-.3)/1.37;for(var i=0;i<=24;i++){var t=i/24,a=t*Math.PI*.62;pts.push([x0+(1-Math.cos(a))*ar,.4+Math.sin(a)*(Hh-.75),0])}K.tube(pts,.012,st);
 var e=pts[pts.length-1];K.lathe([[.02,0],[.12,-.04],[.19,-.13],[.185,-.135],[.11,-.05],[.02,-.006]],e[0],e[1]-.02,0,K.tx("steel"),48);K.light(e[0],e[1]-.15,0)};
/* 和紙の提灯形スタンド */
F4.paper=function(K,it,W,Hh,D){var pp=new THREE.MeshStandardMaterial({color:0xf6f1e4,emissive:0xffdca0,emissiveIntensity:.45,roughness:.95,side:THREE.DoubleSide}),bk=K.col("#222",.5);
 [0,1,2].forEach(function(i){var a=i*2.094;K.leg([Math.sin(a)*.12,0,Math.cos(a)*.12],[Math.sin(a)*.05,.18,Math.cos(a)*.05],.003,.003,bk)});var prof=[];for(var i=0;i<=20;i++){var t=i/20;prof.push([W/2*(.55+.45*Math.sin(Math.PI*t)),.18+t*(Hh-.2)])}K.lathe(prof,0,0,0,pp,40);
 K.light(0,Hh*.55,0,.7);for(var j=1;j<10;j++){var t=j/10,r=W/2*(.55+.45*Math.sin(Math.PI*t))+.001;K.tube(K.arc(0,0,0,r,r,0,6.283,.18+t*(Hh-.2),32),.0012,K.col("#d9ccb0",.8))}};
/* 乳白ガラスの球のペンダント */
F4.globe=function(K,it,W,Hh,D){var gm=new THREE.MeshStandardMaterial({color:0xfbfaf6,emissive:0xfff0d0,emissiveIntensity:.7,roughness:.25});var yc=Math.max(1.5,K.Hc-.6)-W/2;K.cyl(.003,.003,K.Hc-yc-W/2,0,(K.Hc+yc+W/2)/2,0,K.col("#222",.5),8);K.cyl(.05,.05,.02,0,K.Hc-.01,0,K.col("#efeeea",.4),24);K.cyl(.025,.03,.04,0,yc+W/2+.01,0,K.tx("brass"),20);H4part(K,new THREE.SphereGeometry(W/2,40,24),0,yc,0,gm);K.light(0,yc,0)};
function H4part(K,g,x,y,z,m){return K._P?K._P(g,x,y,z,m,true):null}

/* ============ 一覧（家具を選ぶ） ============ */
var F4T=[
 {g:"椅子",name:"Y字背のペーパーコードチェア",f4:"wish",fs:"chair",w:550,d:520,h:760,wtex:"oak"},
 {g:"椅子",name:"シェルチェア（木脚）",f4:"shell",fs:"chair",w:465,d:550,h:810,col:"#ecebe7"},
 {g:"椅子",name:"曲げ木チェア",f4:"bent",fs:"chair",w:420,d:520,h:880,wtex:"beech"},
 {g:"椅子",name:"ウィンザーチェア",f4:"windsor",fs:"chair",w:460,d:450,h:860,wtex:"ash"},
 {g:"椅子",name:"カンチレバーチェア（ケーン）",f4:"cant",fs:"chair",w:460,d:570,h:800},
 {g:"椅子",name:"成形合板のスタッキングチェア",f4:"ply",fs:"chair",w:500,d:520,h:780},
 {g:"椅子",name:"ラウンドバックアームチェア",f4:"round",fs:"chair",w:630,d:520,h:760,wtex:"teak"},
 {g:"スツール・ベンチ",name:"カウンタースツール",f4:"bar",fs:"chair",w:380,d:380,h:650},
 {g:"ソファ",name:"成形合板と革のラウンジチェア",f4:"lounge",fs:"sofa",w:840,d:850,h:840},
 {g:"ソファ",name:"ラウンジチェアのオットマン",f4:"otto",fs:"sofa",w:660,d:540,h:420},
 {g:"ソファ",name:"X脚の革のチェア",f4:"xframe",fs:"sofa",w:750,d:760,h:760},
 {g:"ソファ",name:"スチールフレームのキューブチェア",f4:"cube",fs:"sofa",w:760,d:700,h:670},
 {g:"ソファ",name:"スチールフレームのキューブソファ 2人掛け",f4:"cube",fs:"sofa",w:1300,d:700,h:670},
 {g:"ソファ",name:"北欧の木フレーム・イージーチェア",f4:"danish",fs:"sofa",w:700,d:760,h:780,ccol:"#8a8a86"},
 {g:"ソファ",name:"北欧の木フレームソファ 3人掛け",f4:"dsofa",fs:"sofa",w:1900,d:800,h:780},
 {g:"ソファ",name:"ソファ（細い肘・木脚）2人掛け",f4:"sofa",fs:"sofa",w:1600,d:880,h:780,arm:"t",leg:"w",bk:"l",ccol:"#cfc8ba"},
 {g:"ソファ",name:"ソファ（細い肘・木脚）3人掛け",f4:"sofa",fs:"sofa",w:2100,d:880,h:780,arm:"t",leg:"w",bk:"l",ccol:"#cfc8ba"},
 {g:"ソファ",name:"ソファ（太い肘・台座）3人掛け",f4:"sofa",fs:"sofa",w:2200,d:950,h:720,arm:"k",leg:"p",bk:"l",ftex:"boucle"},
 {g:"ソファ",name:"ソファ（肘なし・金属脚）2人掛け",f4:"sofa",fs:"sofa",w:1500,d:850,h:760,arm:"n",leg:"m",bk:"h",ftex:"velvet",ccol:"#3f5f52"},
 {g:"テーブル",name:"ダイニングテーブル（4本脚）",f4:"table",fs:"table",w:1600,d:850,h:720,top:"r",lg:"4"},
 {g:"テーブル",name:"楕円のダイニングテーブル",f4:"table",fs:"table",w:1800,d:1000,h:720,top:"o",lg:"4"},
 {g:"テーブル",name:"トレッスル脚のダイニングテーブル",f4:"table",fs:"table",w:2000,d:900,h:720,top:"r",lg:"t",wtex:"walnut"},
 {g:"テーブル",name:"一本脚の丸テーブル（大理石）",f4:"tulip",fs:"table",w:1000,d:1000,h:730},
 {g:"テーブル",name:"丸いダイニングテーブル（3本脚）",f4:"table",fs:"table",w:1100,d:1100,h:720,top:"c",lg:"4"},
 {g:"ローテーブル",name:"ガラス天板のコーヒーテーブル",f4:"glasst",fs:"lt",w:1270,d:920,h:400},
 {g:"ローテーブル",name:"丸いローテーブル",f4:"ctab",fs:"lt",w:800,d:800,h:350},
 {g:"ローテーブル",name:"C型サイドテーブル",f4:"cside",fs:"lt",w:400,d:400,h:550},
 {g:"収納",name:"脚付きサイドボード",f4:"board",fs:"shelf",w:1600,d:450,h:780,wtex:"teak"},
 {g:"収納",name:"オープンシェルフ",f4:"shelf",fs:"shelf",w:900,d:320,h:1500,tiers:"4"},
 {g:"収納",name:"ウォールラック",f4:"wrack",fs:"shelf",w:800,d:300,h:1900},
 {g:"収納",name:"チェスト（5段）",f4:"chest",fs:"shelf",w:800,d:450,h:1050,tiers:"5"},
 {g:"収納",name:"TVボード",f4:"tvb",fs:"shelf",w:1600,d:420,h:420},
 {g:"デスク",name:"木製デスク",f4:"desk",fs:"desk",w:1200,d:600,h:720},
 {g:"ベッド",name:"ローベッド シングル",f4:"bed",fs:"bed",w:1000,d:2050,h:800,hb:"p"},
 {g:"ベッド",name:"ローベッド セミダブル",f4:"bed",fs:"bed",w:1220,d:2050,h:800,hb:"u",ccol:"#cdc6b8"},
 {g:"ベッド",name:"ローベッド ダブル",f4:"bed",fs:"bed",w:1420,d:2050,h:800,hb:"p"},
 {g:"照明",name:"3枚シェードのペンダント",f4:"pend3",fs:"l",lst:"p",w:500,d:500,h:300},
 {g:"照明",name:"乳白ガラスの球ペンダント",f4:"globe",fs:"l",lst:"p",w:350,d:350,h:350},
 {g:"照明",name:"アーチ型フロアランプ",f4:"arc",fs:"l",lst:"a",w:1900,d:400,h:2300},
 {g:"照明",name:"和紙のフロアランプ",f4:"paper",fs:"l",w:450,d:450,h:1300}];
/* 旧モデルは一覧から外す（保存済みの家具はそのまま表示できる）。ソファM・N、家電、什器、ラグ、キッチンは残す */
(function(){var keep={"ソファM":1,"ソファN":1,"ラグA":1,"キッチンA":1,"冷蔵庫B":1};
 MJ.forEach(function(m){if(!keep[m.name])m.old=1});LMP.forEach(function(m){m.old=1});SMP.forEach(function(m){if(!keep[m.name])m.old=1});
 NEWT.forEach(function(m){if(m.g!=="什器"&&m.g!=="家電"&&m.g!=="観葉植物")m.old=1});
 F4T.forEach(function(m){NEWT.push(m)})})();
