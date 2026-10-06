/* ===== 観葉植物 v4：パキラ・エバーフレッシュ・モンステラ・フィカス =====
 * 葉は「切り抜きの葉のテクスチャ」を曲げた板に貼る方式（輪郭・葉脈・切れ込みを正確に、軽く）。
 * 幹は先細りの曲がった管、鉢は回転体。すべて手続き的に作る（外部データなし）。 */
var PL4={tx:{},m:{},sp:{
 ficus:{n:"フィカス",w:700,d:300,h:1500,pot:"grey"},
 pachira:{n:"パキラ",w:800,d:300,h:1600,pot:"white"},
 everfresh:{n:"エバーフレッシュ",w:850,d:300,h:1600,pot:"stone"},
 monstera:{n:"モンステラ",w:850,d:320,h:950,pot:"egg"}},
 pots:{grey:"グレーの鉢（受け皿付き）",black:"黒の鉢（受け皿付き）",white:"白い鉢",stone:"石目の丸鉢",egg:"白い陶器の鉢"}};
function pl4R(seed){var s=(seed>>>0)||1;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}

/* ---------- 葉のテクスチャ（切り抜き） ---------- */
function pl4Leaf(kind){if(PL4.tx[kind])return PL4.tx[kind];
 var W=256,H=400,c=document.createElement("canvas");if(kind==="monstera"){W=512;H=512}if(kind==="pinna"){W=160;H=512}if(kind==="pachira"){W=144;H=512}c.width=W;c.height=H;
 var x=c.getContext("2d"),R=pl4R(kind.length*7919+13),i,j;
 function shape(){x.beginPath();
  if(kind==="ficus"){/* 卵形・先が丸い（ベンガレンシス） */x.moveTo(W/2,H*.98);x.bezierCurveTo(W*.02,H*.86,W*.0,H*.38,W*.2,H*.16);x.bezierCurveTo(W*.34,H*.02,W*.66,H*.02,W*.8,H*.16);x.bezierCurveTo(W*1,H*.38,W*.98,H*.86,W/2,H*.98)}
  else if(kind==="pachira"){/* 披針形の小葉 */x.moveTo(W/2,H*.99);x.bezierCurveTo(W*.14,H*.8,W*.06,H*.38,W/2,H*.02);x.bezierCurveTo(W*.94,H*.38,W*.86,H*.8,W/2,H*.99)}
  else if(kind==="pinna"){/* エバーフレッシュの羽片：細い軸に小さな楕円の小葉が並ぶ */return}
  else{/* モンステラ：ハート形 */x.moveTo(W*.5,H*.97);x.bezierCurveTo(W*.18,H*.86,W*.0,H*.62,W*.03,H*.38);x.bezierCurveTo(W*.06,H*.12,W*.3,H*.02,W*.47,H*.12);x.lineTo(W*.5,H*.2);x.lineTo(W*.53,H*.12);x.bezierCurveTo(W*.7,H*.02,W*.94,H*.12,W*.97,H*.38);x.bezierCurveTo(W*1,H*.62,W*.82,H*.86,W*.5,H*.97)}
  x.closePath()}
 var base={ficus:[62,104,58],pachira:[70,128,54],pinna:[104,152,74],monstera:[24,74,38]}[kind];
 function col(k,a){return"rgba("+Math.round(base[0]*k)+","+Math.round(base[1]*k)+","+Math.round(base[2]*k)+","+(a===undefined?1:a)+")"}
 if(kind==="pinna"){
  x.strokeStyle="rgb(96,120,60)";x.lineWidth=4;x.beginPath();x.moveTo(W/2,H);x.lineTo(W/2,8);x.stroke();
  for(i=0;i<34;i++){var t=i/33,y=H*.975-t*H*.94,L=W*.43*(1-Math.pow(Math.abs(t-.42)*1.55,2.4)*.4)*(.92+R()*.16),wd=W*.062*(1-t*.2);
   [-1,1].forEach(function(sg){x.save();x.translate(W/2+sg*2.5,y+sg*2);x.rotate(sg*(1.25-t*.3+(R()-.5)*.08));x.beginPath();x.ellipse(0,-L/2,wd,L/2,0,0,6.283);
    var g=x.createLinearGradient(0,0,0,-L);var tone=.95+R()*.1;g.addColorStop(0,col(.9*tone));g.addColorStop(1,col(1.0*tone));x.fillStyle=g;x.fill();
    x.strokeStyle=col(1.15,.18);x.lineWidth=.6;x.beginPath();x.moveTo(0,0);x.lineTo(0,-L*.92);x.stroke();x.restore()})}
  x.beginPath();x.ellipse(W/2,10,W*.07,H*.022,0,0,6.283);x.fillStyle=col(1.05);x.fill()}
 else{
  shape();x.save();x.clip();
  var g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,col(.72));g.addColorStop(.5,col(1.05));g.addColorStop(1,col(.72));x.fillStyle=g;x.fillRect(0,0,W,H);
  var g2=x.createLinearGradient(0,H,0,0);g2.addColorStop(0,"rgba(255,255,230,.10)");g2.addColorStop(1,"rgba(0,0,0,.10)");x.fillStyle=g2;x.fillRect(0,0,W,H);
  for(i=0;i<220;i++){var rx=R()*W,ry=R()*H,rr=6+R()*26,gg=x.createRadialGradient(rx,ry,0,rx,ry,rr);gg.addColorStop(0,R()<.5?"rgba(255,255,220,.05)":"rgba(0,20,0,.06)");gg.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=gg;x.fillRect(rx-rr,ry-rr,rr*2,rr*2)}
  /* 葉脈：中央の主脈と、左右に弧を描く側脈 */
  var vc=kind==="ficus"?"rgba(214,226,190,":"rgba(190,220,160,",mid=kind==="monstera"?W*.5:W/2;
  x.lineCap="round";x.strokeStyle=vc+(kind==="ficus"?".62)":kind==="monstera"?".5)":".45)");x.lineWidth=kind==="monstera"?6:kind==="ficus"?3.6:2.6;x.beginPath();x.moveTo(mid,H*.98);x.quadraticCurveTo(mid+W*.01,H*.5,mid,kind==="monstera"?H*.2:H*.05);x.stroke();
  var nv=kind==="ficus"?7:kind==="pachira"?14:9;
  for(j=0;j<nv;j++){var tt=(j+.6)/nv,vy=H*(.92-tt*(kind==="monstera"?.68:.82));[-1,1].forEach(function(sg){x.strokeStyle=vc+(kind==="ficus"?".45)":".25)");x.lineWidth=kind==="ficus"?1.8:kind==="monstera"?2.4:1;
   x.beginPath();x.moveTo(mid,vy);x.quadraticCurveTo(mid+sg*W*.22,vy-H*.03,mid+sg*W*(kind==="ficus"?.4:.44),vy-H*(kind==="ficus"?.12:.07));x.stroke();
   if(kind==="ficus"){x.strokeStyle=vc+".25)";x.lineWidth=1;for(var q=0;q<5;q++){var qx=mid+sg*W*(.08+q*.07),qy=vy-H*(.015+q*.02);x.beginPath();x.moveTo(qx,qy);x.lineTo(qx+sg*W*.03,qy+H*.035);x.stroke()}}})}
  /* ふち：わずかに暗く、明るい縁取り */
  x.restore();shape();x.strokeStyle=col(.6,.9);x.lineWidth=3;x.stroke();
  if(kind==="monstera"){/* 切れ込み（側脈に沿って、ふちから内側へ細くなる）と、主脈ぞいの穴 */x.globalCompositeOperation="destination-out";x.fillStyle="#000";
   [-1,1].forEach(function(sg){var ys=[.33,.43,.53,.62,.71,.79];for(j=0;j<ys.length;j++){var t=j/(ys.length-1),vy=H*(ys[j]+(R()-.5)*.02),inn=.12+.05*R()+.06*t,ang=.18+.1*t,ww=H*(.012+.008*R()),
     ax=W*.5+sg*W*inn,ay=vy,bx=W*.5+sg*W*.66,by=vy+H*ang;
    x.beginPath();x.moveTo(ax,ay);x.quadraticCurveTo(ax+sg*W*.12,ay+H*.01-ww,bx,by-ww*2.6);x.lineTo(bx,by+ww*2.6);x.quadraticCurveTo(ax+sg*W*.12,ay+H*.01+ww,ax,ay+ww*.4);x.closePath();x.fill();
    x.beginPath();x.arc(ax,ay+ww*.2,ww*.9,0,6.283);x.fill();
    if(j>0&&j<ys.length-1&&R()<.8){x.beginPath();x.ellipse(W*.5+sg*W*(.075+R()*.02),vy-H*.035,W*(.01+R()*.006),H*(.022+R()*.012),sg*.55,0,6.283);x.fill()}}});
   x.globalCompositeOperation="source-over"}
 }
 var t=new THREE.CanvasTexture(c);t.anisotropy=4;t.encoding=THREE.sRGBEncoding;PL4.tx[kind]=t;return t}
function pl4LeafMat(kind,gloss){var k="L"+kind;if(PL4.m[k])return PL4.m[k];var tx=pl4Leaf(kind),m=new THREE.MeshStandardMaterial({map:tx,alphaTest:.45,side:THREE.DoubleSide,roughness:gloss,metalness:0,envMapIntensity:.6});
 m.bumpMap=tx;m.bumpScale=.0006;m._lin=1;m.userData.keep=1;
 var dm=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:tx,alphaTest:.45});m.userData.depth=dm;PL4.m[k]=m;return m}

/* ---------- 幹・樹皮 ---------- */
function pl4Bark(kind){var k="B"+kind;if(PL4.tx[k])return PL4.tx[k];var S=256,c=document.createElement("canvas");c.width=c.height=S;var x=c.getContext("2d"),R=pl4R(kind.length*131+3),i;
 var b={ficus:[205,198,182],pachira:[132,124,104],everfresh:[128,100,74],monstera:[96,130,64]}[kind];x.fillStyle="rgb("+b+")";x.fillRect(0,0,S,S);
 for(i=0;i<900;i++){var v=(R()-.5)*40;x.fillStyle="rgba("+(b[0]+v|0)+","+(b[1]+v|0)+","+(b[2]+v|0)+","+(.35+R()*.4)+")";x.fillRect(R()*S,R()*S,1+R()*2,4+R()*18)}
 if(kind==="ficus"||kind==="pachira")for(i=0;i<40;i++){x.strokeStyle="rgba(60,50,40,"+(.08+R()*.12)+")";x.lineWidth=1;var y=R()*S;x.beginPath();x.moveTo(R()*S,y);x.lineTo(R()*S,y+(R()-.5)*6);x.stroke()}
 var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;PL4.tx[k]=t;return t}
function pl4BarkMat(kind){var k="M"+kind;if(PL4.m[k])return PL4.m[k];var t=pl4Bark(kind),m=new THREE.MeshStandardMaterial({map:t,bumpMap:t,bumpScale:.0012,roughness:kind==="monstera"?.55:.9});m._lin=1;m.userData.keep=1;PL4.m[k]=m;return m}
/* 先細りの管（曲線に沿う）。r(t) で太さ */
function pl4Tube(pts,r0,r1,rs,ls){var cv=new THREE.CatmullRomCurve3(pts),n=ls||Math.max(6,pts.length*5),fr=cv.computeFrenetFrames(n,false),P=[],N=[],U=[],I=[],i,j;
 for(i=0;i<=n;i++){var t=i/n,p=cv.getPointAt(t),r=r0+(r1-r0)*Math.pow(t,.8),Nn=fr.normals[i],Bb=fr.binormals[i];
  for(j=0;j<=rs;j++){var a=j/rs*Math.PI*2,cx=Math.cos(a),sx=Math.sin(a),nx=cx*Nn.x+sx*Bb.x,ny=cx*Nn.y+sx*Bb.y,nz=cx*Nn.z+sx*Bb.z;P.push(p.x+r*nx,p.y+r*ny,p.z+r*nz);N.push(nx,ny,nz);U.push(j/rs,t*cv.getLength()*4)}}
 for(i=0;i<n;i++)for(j=0;j<rs;j++){var a0=i*(rs+1)+j,b0=a0+rs+1;I.push(a0,b0,a0+1,a0+1,b0,b0+1)}
 var g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(P,3));g.setAttribute("normal",new THREE.Float32BufferAttribute(N,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(U,2));g.setIndex(I);return{g:g,cv:cv}}

/* ---------- 鉢 ---------- */
function pl4Pot(type,r,h){var g=new THREE.Group(),prof,col,rough,R=pl4R(type.length*97+5);
 if(type==="white"){prof=[[0,0],[r*.7,0],[r*.72,.01],[r*.92,h*.9],[r*.95,h*.9],[r,h*.94],[r,h],[r*.94,h],[r*.9,h*.96]];col="#f2f1ee";rough=.38}
 else if(type==="stone"){prof=[[0,0],[r*.62,0],[r*.66,.008],[r*.92,h*.3],[r,h*.58],[r*.95,h*.85],[r*.84,h*.99],[r*.8,h],[r*.76,h*.98]];col="#c9c6c0";rough=.92}
 else if(type==="egg"){prof=[[0,0],[r*.6,0],[r*.64,.01],[r*.86,h*.35],[r*.98,h*.75],[r,h*.97],[r*.97,h],[r*.92,h*.97]];col="#f4f3f0";rough=.18}
 else{prof=[[0,0],[r*.76,0],[r*.78,.01],[r*.97,h*.96],[r,h],[r*.95,h],[r*.93,h*.97]];col=type==="black"?"#2c2c2b":"#9d978f";rough=.86}
 var pts=prof.map(function(p){return new THREE.Vector2(p[0],p[1])}),lg=new THREE.LatheGeometry(pts,48);lg.computeVertexNormals();
 var pm;if(type==="stone"||type==="grey"||type==="black"){var S=256,c=document.createElement("canvas");c.width=c.height=S;var x=c.getContext("2d");x.fillStyle=col;x.fillRect(0,0,S,S);
  for(var i=0;i<(type==="stone"?1600:500);i++){var v=(R()-.5)*(type==="stone"?70:26),cc=new THREE.Color(col);x.fillStyle="rgba("+Math.max(0,Math.min(255,cc.r*255+v))+","+Math.max(0,Math.min(255,cc.g*255+v))+","+Math.max(0,Math.min(255,cc.b*255+v))+",.7)";var s0=type==="stone"?.5+R()*2.2:.6+R();x.fillRect(R()*S,R()*S,s0,s0)}
  var tx=new THREE.CanvasTexture(c);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(3,1);tx.encoding=THREE.sRGBEncoding;pm=new THREE.MeshStandardMaterial({color:0xffffff,map:tx,bumpMap:tx,bumpScale:.0008,roughness:rough});pm._lin=1}
 else pm=new THREE.MeshStandardMaterial({color:new THREE.Color(col),roughness:rough,metalness:0});
 var pot=new THREE.Mesh(lg,pm);pot.material.side=THREE.DoubleSide;pot.castShadow=true;pot.receiveShadow=true;g.add(pot);
 if(type==="grey"||type==="black"){var sp=new THREE.LatheGeometry([[0,0],[r*.9,0],[r*.92,.004],[r*.9,.022],[r*.86,.024],[r*.8,.012],[0,.012]].map(function(p){return new THREE.Vector2(p[0],p[1])}),48);var sm=new THREE.Mesh(sp,pm);sm.receiveShadow=true;sm.castShadow=true;g.add(sm);pot.position.y=.012}
 /* 土・バークチップ */
 var top=type==="egg"||type==="stone"?"bark":"soil",S2=128,c2=document.createElement("canvas");c2.width=c2.height=S2;var x2=c2.getContext("2d");x2.fillStyle=top==="bark"?"#6b4a33":"#3b2d22";x2.fillRect(0,0,S2,S2);
 for(var k=0;k<(top==="bark"?90:500);k++){var vv=R();x2.fillStyle=top==="bark"?"rgba("+(120+vv*60|0)+","+(80+vv*40|0)+","+(50+vv*30|0)+",.9)":"rgba("+(70+vv*50|0)+","+(55+vv*40|0)+","+(40+vv*30|0)+",.7)";if(top==="bark"){x2.save();x2.translate(R()*S2,R()*S2);x2.rotate(R()*3);x2.fillRect(-6,-3,8+R()*8,4+R()*4);x2.restore()}else x2.fillRect(R()*S2,R()*S2,1.5,1.5)}
 var st=new THREE.CanvasTexture(c2);st.encoding=THREE.sRGBEncoding;var sm2=new THREE.MeshStandardMaterial({map:st,bumpMap:st,bumpScale:.003,roughness:1});sm2._lin=1;
 var rt=prof[prof.length-1][0],sd=new THREE.Mesh(new THREE.CircleGeometry(rt*1.02,32),sm2);sd.rotation.x=-Math.PI/2;sd.position.y=pot.position.y+h*.94;sd.receiveShadow=true;g.add(sd);
 g.userData.top=pot.position.y+h*.94;return g}

/* ---------- 葉の板を集めて1つの形に ---------- */
function pl4Batch(){return{p:[],uv:[],ix:[]}}
var _pv=new THREE.Vector3(),_pe=new THREE.Euler(),_pq=new THREE.Quaternion(),_pm=new THREE.Matrix4(),_ps=new THREE.Vector3(1,1,1);
/* 葉1枚：基部 (x,y,z)、向き(yaw)、起き上がり(pitch)、ひねり(roll)。len×wid、droop で垂れ、fold で中央に折れ */
function pl4Card(B,x,y,z,yaw,pitch,roll,len,wid,droop,fold,nv){nv=nv||5;_pe.set(-pitch,yaw,roll,"YXZ");_pq.setFromEuler(_pe);_pv.set(x,y,z);_pm.compose(_pv,_pq,_ps);var st=B.p.length/3,j,i;
 for(j=0;j<=nv;j++){var t=j/nv,zz=t*len,yy=-droop*t*t*len;for(i=0;i<3;i++){var u=i/2,xx=(u-.5)*wid,fy=fold*Math.abs(xx);var v=new THREE.Vector3(xx,yy+fy,zz).applyMatrix4(_pm);B.p.push(v.x,v.y,v.z);B.uv.push(u,t)}}
 for(j=0;j<nv;j++){var a=st+j*3;B.ix.push(a,a+3,a+1,a+1,a+3,a+4,a+1,a+4,a+2,a+2,a+4,a+5)}}
function pl4Mesh(B,mat){var g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(B.p,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(B.uv,2));g.setIndex(B.ix);g.computeVertexNormals();
 var m=new THREE.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;if(mat.userData.depth)m.customDepthMaterial=mat.userData.depth;return m}

/* ---------- 種ごとの形 ---------- */
function plant4(it,seed){var sp=PL4.sp[it.sp]||PL4.sp.ficus,H=(+it.h||sp.h)/1000,Wd=(+it.w||sp.w)/1000,R=pl4R((seed||0)*7919+it.sp.length*104729+11),g=new THREE.Group(),
 pr=Math.max(.09,Math.min(.24,((+it.d||sp.d)/1000)/2)),ph=it.sp==="monstera"?Math.min(.36,H*.34):Math.min(.4,H*.22),pt=it.pot||sp.pot,pot=pl4Pot(pt,pr,ph),y0=pot.userData.top,sx=Wd/(sp.w/1000);g.add(pot);
 var LB=pl4Batch(),PB=pl4Batch(),bark=pl4BarkMat(it.sp),i,j,k;
 function trunk(pts,r0,r1){var tb=pl4Tube(pts,r0,r1,9);var m=new THREE.Mesh(tb.g,bark);m.castShadow=true;m.receiveShadow=true;g.add(m);return tb.cv}
 function P(x,y,z){return new THREE.Vector3(x*sx,y,z*sx)}
 if(it.sp==="ficus"){
  var top=H,cv=trunk([P(0,y0-.02,0),P(.035,y0+(top-y0)*.22,.01),P(-.03,y0+(top-y0)*.46,-.012),P(.025,y0+(top-y0)*.7,.02),P(-.005,top-.1,0)],.024,.009);
  var LM=pl4LeafMat("ficus",.5),tips=[];
  /* 上半分から枝を数本 */
  for(i=0;i<5;i++){var tb0=.42+.12*i+R()*.05,pb=cv.getPointAt(Math.min(.95,tb0)),yb=i*2.3+R()*.6,bl=(.12+R()*.1)*sx,tp=new THREE.Vector3(pb.x+Math.sin(yb)*bl,pb.y+.1+R()*.08,pb.z+Math.cos(yb)*bl);
   var bmm=new THREE.Mesh(pl4Tube([pb.clone(),new THREE.Vector3((pb.x+tp.x)/2,pb.y+.05,(pb.z+tp.z)/2),tp],.008,.004,6,5).g,bark);bmm.castShadow=true;g.add(bmm);tips.push({c:new THREE.CatmullRomCurve3([pb.clone(),tp]),yaw:yb})}
  tips.push({c:new THREE.CatmullRomCurve3([cv.getPointAt(.62),cv.getPointAt(1)]),yaw:0});
  for(i=0;i<64;i++){var br=tips[Math.floor(R()*tips.length)],t=.15+.85*R(),p=br.c.getPointAt(t),yaw=br.yaw+(R()-.5)*2.6+(R()<.5?Math.PI:0)*.4,
    L=(.14+R()*.08)*Math.sqrt(H/1.5),W2=L*.66,o=.02;
   pl4Card(LB,p.x+Math.sin(yaw)*o,p.y,p.z+Math.cos(yaw)*o,yaw,.15+R()*.55,(R()-.5)*.5,L,W2,.12+R()*.2,.1,5)}
  g.add(pl4Mesh(LB,LM))}
 else if(it.sp==="pachira"){
  var top2=H*.78,cv2=trunk([P(0,y0-.02,0),P(-.02,y0+(top2-y0)*.35,.012),P(.018,y0+(top2-y0)*.7,0),P(0,top2,.01)],.042,.02);
  var LM2=pl4LeafMat("pachira",.36),PM2=new THREE.MeshStandardMaterial({color:0x7a9a4a,roughness:.6}),np=16;
  for(i=0;i<np;i++){var t2=.78+.22*(i/np),p2=cv2.getPointAt(Math.min(1,t2)),yw=i*2.4+R()*.5,pl=(.16+R()*.12)*Math.sqrt(H/1.6)*sx,el=.45+R()*.6,ex=p2.x+Math.sin(yw)*Math.cos(el)*pl,ey=p2.y+Math.sin(el)*pl*.8,ez=p2.z+Math.cos(yw)*Math.cos(el)*pl;
   var pm=new THREE.Mesh(pl4Tube([p2.clone(),new THREE.Vector3((p2.x+ex)/2,Math.max(p2.y,ey)+.02,(p2.z+ez)/2),new THREE.Vector3(ex,ey,ez)],.0045,.003,5,6).g,PM2);pm.castShadow=true;g.add(pm);
   var nl=5+(R()<.5?2:0);for(j=0;j<nl;j++){var a=(j-(nl-1)/2)/((nl-1)/2),Ll=(.2+R()*.05)*(1-.35*Math.abs(a))*Math.sqrt(H/1.6);pl4Card(PB,ex,ey,ez,yw+a*1.2,.2+(R()-.5)*.3-.2*Math.abs(a),a*.3,Ll,Ll*.3,.3+R()*.2,.14,5)}}
  g.add(pl4Mesh(PB,LM2))}
 else if(it.sp==="everfresh"){
  var top3=H*.9,cv3=trunk([P(0,y0-.02,0),P(.05,y0+(top3-y0)*.3,.0),P(-.04,y0+(top3-y0)*.55,.02),P(.03,y0+(top3-y0)*.8,-.01),P(0,top3,0)],.018,.006);
  var LM3=pl4LeafMat("pinna",.5),RB=new THREE.MeshStandardMaterial({color:0x7a8a4a,roughness:.7}),nb=12;
  for(i=0;i<nb;i++){var t3=.35+.62*(i/(nb-1)),p3=cv3.getPointAt(t3),yw3=i*2.39+R()*.4,bl=(.18+R()*.12)*sx*(1.1-.4*t3),tip=new THREE.Vector3(p3.x+Math.sin(yw3)*bl,p3.y+.06+R()*.08,p3.z+Math.cos(yw3)*bl);
   var bm3=new THREE.Mesh(pl4Tube([p3.clone(),new THREE.Vector3((p3.x+tip.x)/2,p3.y+.05,(p3.z+tip.z)/2),tip],.006,.003,5,5).g,bark);bm3.castShadow=true;g.add(bm3);
   /* 2回羽状複葉：葉軸の左右に羽片（小葉の並ぶ板）を並べる */
   var nl3=3+(R()<.5?1:0);for(k=0;k<nl3;k++){var ay=yw3+(k-(nl3-1)/2)*.9,rl=.26+R()*.1,rx=tip.x,ry=tip.y,rz=tip.z,dx=Math.sin(ay),dz=Math.cos(ay);
    var ra=new THREE.Mesh(pl4Tube([new THREE.Vector3(rx,ry,rz),new THREE.Vector3(rx+dx*rl*.5,ry+.02,rz+dz*rl*.5),new THREE.Vector3(rx+dx*rl,ry-.03,rz+dz*rl)],.0022,.0012,4,5).g,RB);g.add(ra);
    for(j=0;j<6;j++){var tj=(j+.5)/6,px=rx+dx*rl*tj,py=ry+.02*Math.sin(Math.PI*tj)-.03*tj*tj,pz=rz+dz*rl*tj,pl3=(.1+.05*Math.sin(Math.PI*tj))*Math.sqrt(H/1.6);
     [-1,1].forEach(function(sg){pl4Card(LB,px,py,pz,ay+sg*1.25,-.05+(R()-.5)*.2,sg*.15,pl3,pl3*.36,.1,0,3)})}}}
  g.add(pl4Mesh(LB,LM3))}
 else{/* monstera */
  var LM4=pl4LeafMat("monstera",.24),SM=new THREE.MeshStandardMaterial({color:0x557f3c,roughness:.45}),nl4=9;
  for(i=0;i<nl4;i++){var yw4=i*2.4+R()*.5,lp=(.42+R()*.34)*Math.sqrt(H/.95),bx4=Math.sin(yw4)*.025,bz4=Math.cos(yw4)*.025,rr=(.3+R()*.25)*sx,
    mid=new THREE.Vector3(bx4+Math.sin(yw4)*lp*rr*.45,y0+lp*.7,bz4+Math.cos(yw4)*lp*rr*.45),end=new THREE.Vector3(bx4+Math.sin(yw4)*lp*rr,y0+lp*.92,bz4+Math.cos(yw4)*lp*rr);
   var st=new THREE.Mesh(pl4Tube([new THREE.Vector3(bx4,y0-.02,bz4),mid,end],.008,.005,6,8).g,SM);st.castShadow=true;g.add(st);
   var Lm=(.28+R()*.14)*Math.sqrt(H/.95);pl4Card(LB,end.x,end.y,end.z,yw4+(R()-.5)*.3,.35+R()*.45,(R()-.5)*.35,Lm,Lm*.96,.28+R()*.12,.14,7)}
  g.add(pl4Mesh(LB,LM4))}
 g.userData.plant4=1;pl4PP(g,it);return g}
/* 部品ごとの素材・色（鉢・土・幹・葉…）。葉は形を残すため色だけ */
function pl4PP(g,it){var n=0,ov0=isPro()&&it.pp?it.pp:null;g.traverse(function(o){if(!o.isMesh)return;var pk=n++;o.userData.pk=pk;o.userData.om=o.material.uuid;var ov=ov0&&ov0[pk];if(!ov)return;
 var leaf=o.material.alphaTest>0||!!o.material.alphaMap,m;
 if(ov.tx&&TEX[ov.tx]&&!leaf){m=texMat(ov.tx,ov.c||null);var gg=o.geometry.clone(),uv=gg.attributes.uv;if(uv){gg.computeBoundingBox();var b=gg.boundingBox,z=b.getSize(new THREE.Vector3()),ts=TEX[ov.tx].s||.5,cu=Math.PI*Math.max(z.x,z.z)/ts,cv=Math.max(z.y,.05)/ts*(gg.type==="LatheGeometry"?2.2:1);for(var i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(ov.r?cv:cu),uv.getY(i)*(ov.r?cu:cv));uv.needsUpdate=true}o.geometry=gg}
 else if(ov.c){m=o.material.clone();m._lin=0;m.color=new THREE.Color(ov.c);if(leaf){m.color.multiplyScalar(1.6)}}
 if(m)o.material=m})}
