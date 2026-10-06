/* ===== VIM for MUJI：無印良品の家具の3Dモデル =====
 * 商品の名前から「形の種類（it.mj.t）」を決め、商品の寸法（W・D・H）どおりに組み立てる。
 * 部品はすべて K.box などで作るので、VIM の「素材を変える」はそのまま使える。
 * 前は +z、床は y=0、単位 m。VIM 本体（F4 の既存モデル）は変えない。 */
(function(){
if(typeof F4==="undefined")return;
if(typeof TPLF!=="undefined"&&TPLF.indexOf("mj")<0)TPLF.push("mj");
function O(it){return it.mj||{}}
function fabC(K,it,def){return K.fab("plain",it.col||def||"#b9b1a3")}
function steelC(K,hex){return K.col(hex||"#57585b",.4,.3)}
function ss(K){return K.tx("steel")}
/* 四隅の脚（角） */
function sqLegs(K,W,D,h,ins,s,m){[-1,1].forEach(function(a){[-1,1].forEach(function(b){K.box(s,h,s,a*(W/2-ins),h/2,b*(D/2-ins),m,.003)})})}
/* 四隅の脚（丸・先細り） */
function rdLegs(K,W,D,h,ins,r0,r1,m,spl){spl=spl||0;[-1,1].forEach(function(a){[-1,1].forEach(function(b){K.leg([a*(W/2-ins+spl),0,b*(D/2-ins+spl)],[a*(W/2-ins),h,b*(D/2-ins)],r0,r1,m)})})}
/* くぼみの取っ手（引き出しの上端） */
function grip(K,x,y,z,w){K.box(w||.1,.014,.012,x,y,z,K.col("#3a332c",.8),.005)}

/* ---------- 収納 ---------- */
/* スタッキングシェルフ・キャビネット：同じ厚みの板で格子をつくる（背板なし）。door: 下段に扉/引き出し */
F4.mjss=function(K,it,W,H,D){var o=O(it),w=K.wood("oak"),t=.018,c=o.c||Math.max(1,Math.round(W/.42)),r=o.r||Math.max(1,Math.round(H/.4)),cw=(W-t)/c,rh=(H-t)/r;
 for(var i=0;i<=c;i++)K.box(t,H,D,-W/2+t/2+i*cw,H/2,0,w,.003);
 for(var j=0;j<=r;j++)K.box(W,t,D,0,t/2+j*rh,0,w,.003);
 if(o.bk)K.box(W-t,H-t,.004,0,H/2,-D/2+.004,w,.001);
 (o.cells||[]).forEach(function(q){var x=-W/2+t+cw*(q[0]+.5)-t/2,y=t+rh*(q[1]+.5)-t/2,fw=cw-t-.004,fh=rh-t-.004;
  if(q[2]==="d"){K.box(fw,fh,.016,x,y,D/2-.009,w,.002);K.box(.012,.06,.014,x+fw/2-.03,y,D/2+.004,K.col("#2c2824",.6),.004)}
  else if(q[2]==="r"){for(var k=0;k<2;k++){var yy=y-fh/4+k*fh/2;K.box(fw,fh/2-.004,.016,x,yy,D/2-.009,w,.002);grip(K,x,yy+fh/4-.02,D/2+.001,.08)}}
  else if(q[2]==="b"){K.box(fw-.02,fh-.04,D-.06,x,y-.015,0,K.tx("basket"),.02)}})};
/* スタッキングチェスト：引き出しの箱を積む（ハーフは2列） */
F4.mjsc=function(K,it,W,H,D){var o=O(it),w=K.wood("oak"),n=o.r||Math.max(1,Math.round(H/.185)),c=o.c||1,t=.015;K.box(W,H,D,0,H/2,-.008,w,.004);
 var dw=(W-t*(c+1))/c,dh=(H-t*(n+1))/n;for(var i=0;i<c;i++)for(var j=0;j<n;j++){var x=-W/2+t+dw*(i+.5)+t*i,y=t+dh*(j+.5)+t*j;K.box(dw,dh,.014,x,y,D/2-.007,w,.002);grip(K,x,y+dh/2-.022,D/2+.001,Math.min(.1,dw*.4))}};
/* ユニットシェルフ：支柱4本と棚板、背と横の X ブレース。mt: s=スチール x=ステンレス p=パイン / sh: m=金属 w=木 */
F4.mjus=function(K,it,W,H,D){var o=O(it),n=o.n||Math.max(2,Math.round(H/.36)),mt=o.mt||"s",post,shm,th=.02;
 if(mt==="p"){post=K.wood("pine")}else post=mt==="x"?ss(K):K.col("#cfd0cf",.35,.75);
 shm=o.sh==="w"?K.wood(it.wtex||"oak"):mt==="p"?K.wood("pine"):post;
 [-1,1].forEach(function(a){[-1,1].forEach(function(b){var x=a*(W/2-.012),z=b*(D/2-.012);if(mt==="p")K.box(.03,H,.03,x,H/2,z,post,.003);else K.cyl(.0095,.0095,H,x,H/2,z,post,16)})});
 for(var i=0;i<n;i++){var y=i===0?.03+th/2:i===n-1?H-th/2:.03+(H-.03-th)*i/(n-1)+th/2;
  if(shm===post&&mt!=="p"){K.box(W-.03,.004,D-.03,0,y+.008,0,shm,.001);K.box(W-.03,.022,.006,0,y,D/2-.018,shm,.001);K.box(W-.03,.022,.006,0,y,-D/2+.018,shm,.001);[-1,1].forEach(function(a){K.box(.006,.022,D-.03,a*(W/2-.018),y,0,shm,.001)})}
  else K.box(W-.03,th,D-.03,0,y,0,shm,.003);
  if(mt==="p")[-1,1].forEach(function(a){K.box(.022,.03,D-.04,a*(W/2-.012),y-.03,0,post,.003)})}
 if(o.x!==0&&H>.7){var bm=mt==="p"?steelC(K,"#3b3b3b"):post,y0=.06,y1=Math.min(H-.06,1.25);K.leg([-W/2+.03,y0,-D/2+.012],[W/2-.03,y1,-D/2+.012],.003,.003,bm,6);K.leg([W/2-.03,y0,-D/2+.012],[-W/2+.03,y1,-D/2+.012],.003,.003,bm,6)}};
/* 木製キャビネット：台輪の上に箱、扉2枚（細いものは1枚）。glass: ガラス扉 */
F4.mjcab=function(K,it,W,H,D){var o=O(it),w=K.wood("oak"),pl=.06,h=H-pl,nd=W>.55?2:1,dw=(W-.006*(nd+1))/nd;K.box(W-.04,pl,D-.04,0,pl/2,-.01,w,.003);if(o.g){var dd=D-.018,t=.018;[-1,1].forEach(function(a){K.box(t,h,dd,a*(W/2-t/2),pl+h/2,-.009,w,.003)});K.box(W,t,dd,0,pl+t/2,-.009,w,.003);K.box(W,t,dd,0,H-t/2,-.009,w,.003);K.box(W-2*t,h,.006,0,pl+h/2,-D/2+.003,w,.002)}else K.box(W,h,D-.018,0,pl+h/2,-.009,w,.004);
 for(var i=0;i<nd;i++){var x=-W/2+.006+dw*(i+.5)+.006*i;if(o.g){[[dw,.04,0,h/2-.02],[dw,.04,0,-h/2+.02],[.04,h,-dw/2+.02,0],[.04,h,dw/2-.02,0]].forEach(function(f){K.box(f[0],f[1],.02,x+f[2],pl+h/2+f[3],D/2-.01,w,.002)});K.box(dw-.06,h-.06,.004,x,pl+h/2,D/2-.012,K.tx("glass"),.001);
   for(var s=1;s<4;s++)K.box(dw-.07,.012,D-.1,x,pl+h*s/4,-.01,w,.002)}
  else{K.box(dw,h-.006,.018,x,pl+h/2,D/2-.009,w,.002);K.box(.012,.12,.012,x+(nd===2?(i?-1:1)*(dw/2-.03):dw/2-.03),pl+h*.62,D/2+.004,K.col("#2c2824",.6),.004)}}};
/* 木製チェスト：台輪、引き出し（上端のくぼみで開ける） */
F4.mjch=function(K,it,W,H,D){var o=O(it),w=K.wood("oak"),pl=.05,n=o.r||Math.max(2,Math.round((H-pl)/.2)),c=W>.9&&n<=4?2:1,h=H-pl;K.box(W-.03,pl,D-.04,0,pl/2,-.01,w,.003);K.box(W,h,D-.02,0,pl+h/2,-.01,w,.004);
 var dw=(W-.006*(c+1))/c,dh=(h-.006*(n+1))/n;for(var i=0;i<c;i++)for(var j=0;j<n;j++){var x=-W/2+.006+dw*(i+.5)+.006*i,y=pl+.006+dh*(j+.5)+.006*j;K.box(dw,dh,.018,x,y,D/2-.01,w,.002);grip(K,x,y+dh/2-.02,D/2+.001,Math.min(.14,dw*.3))}};
/* 壁に付けられる家具：箱・棚（床から目安の高さに掛ける） */
F4.mjwall=function(K,it,W,H,D){var o=O(it),w=K.wood("oak"),t=.015,y0=o.y0==null?(H<.25?1.1:.9):o.y0;K.box(W,t,D,0,y0+t/2,0,w,.003);K.box(W,t,D,0,y0+H-t/2,0,w,.003);[-1,1].forEach(function(a){K.box(t,H,D,a*(W/2-t/2),y0+H/2,0,w,.003)});K.box(W-2*t,H-2*t,.006,0,y0+H/2,-D/2+.003,w,.002)};

/* ---------- ベッド ---------- */
/* 別売りの脚（脚付マットレス・ベッド共通）：lgm o=木製脚 ナチュラル w=木製脚 ブラウン s=スチール脚 / lgh 12・20・26cm。商品の高さは本体のみ、脚の分だけ持ち上げる */
function bedLegH(it){var v=+it.lgh;return(v===12||v===26?v:20)/100}
function bedLeg(K,it,x,z,h){var m=it.lgm||"o";if(m==="s")K.cyl(.014,.014,h,x,h/2,z,K.col("#2a2a2b",.4,.35),16);else K.leg([x,0,z],[x,h,z],.017,.022,K.tx(m==="w"?"walnut":"oak"),20)}
/* 脚付マットレス：マットレス本体の下に脚（長さ方向に3列、幅が広いものは中央にも） */
F4.mjlm=function(K,it,W,H,D){var L=bedLegH(it),cv=K.fab("plain",it.col||"#e3e1dc"),xs=W>1.1?[-1,0,1]:[-1,1];
 xs.forEach(function(a){[-1,0,1].forEach(function(b){bedLeg(K,it,a*(W/2-.12),b*(D/2-.18),L)})});
 K.box(W-.04,.03,D-.04,0,L+.015,0,K.col("#3a3a3a",.7),.004);K.cush(W,H-.02,D,0,L+.02+(H-.02)/2,0,cv,.035,.008);K.box(W+.002,.01,D+.002,0,L+H*.55,0,K.col("#cfccc6",.9),.005)};
/* 木製ベッドフレーム：脚の上にフレーム、ヘッドボード。高さは本体（ヘッドボード上端まで）のみ。マットレスは別売り（参考に表示） hb: p=板 r=もたれかかれる */
F4.mjbed=function(K,it,W,H,D){var o=O(it),w=K.wood("oak"),L=bedLegH(it),hb=o.hb||"p",hd=hb==="r"?.1:.035,fd=D-hd,fz=hd/2,rh=.14,t=.03;
 [-1,1].forEach(function(a){[-1,1].forEach(function(b){bedLeg(K,it,a*(W/2-.06),fz+b*(fd/2-.08),L)})});bedLeg(K,it,0,fz,L);
 [-1,1].forEach(function(a){K.box(t,rh,fd,a*(W/2-t/2),L+rh/2,fz,w,.004)});K.box(W,rh,t,0,L+rh/2,D/2-t/2,w,.004);
 for(var i=0;i<9;i++)K.box(W-2*t,.015,.07,0,L+.05,fz-fd/2+.1+i*(fd-.2)/8,w,.002);
 var mt=.2,my=L+.06;K.cush(W-2*t-.01,mt,fd-t-.02,0,my+mt/2,fz-t/2,K.col("#f4f2ee",.9),.04,.008);K.cush(W-2*t,.03,fd*.62,0,my+mt+.01,fz+fd*.17,K.fab("plain",it.ccol||"#d9d4ca"),.015,.01);
 var np=W>1.3?2:1,pw=np===2?W*.4:W*.62;for(var j=0;j<np;j++)K.cush(pw,.11,.34,np===2?(j?1:-1)*W*.23:0,my+mt+.05,-D/2+hd+.24,K.fab("plain","#efede8"),.05,.03);
 if(hb==="r"){var g=K.box(W,H,hd,0,L+H/2,-D/2+hd/2+.02,w,.01);g.rotation.x=-.1}else K.box(W,H,hd,0,L+H/2,-D/2+hd/2,w,.006)};
F4OPT.mjlm=F4OPT.mjbed=[["lgm","脚（別売り）",[["o","木製脚 ナチュラル"],["w","木製脚 ブラウン"],["s","スチール脚"]]],["lgh","脚の高さ",[["20","20cm"],["12","12cm"],["26","26cm"]]]];
/* スタッキングシェルフは横置きにもできる（置き方を変えると幅と高さが入れ替わる） */
F4.mjssh=function(K,it,W,H,D){F4.mjss(K,it,W,H,D)};
F4OPT.mjssh=[["lay","置き方",[["v","縦置き"],["h","横置き"]]]];
window.mjLay=function(it){if(!it||it.f4!=="mjssh")return false;var want=it.lay==="h",cur=!!it.layH;if(want===cur)return false;var w=it.w;it.w=it.h;it.h=w;it.layH=want;return true};
window.mjLegName=function(it){return{o:"木製脚 ナチュラル",w:"木製脚 ブラウン",s:"スチール脚"}[it.lgm||"o"]+" "+Math.round(bedLegH(it)*100)+"cm"};
window.mjTotalH=function(it){if(!it||(it.f4!=="mjlm"&&it.f4!=="mjbed"))return null;return(+it.h||0)+bedLegH(it)*1000};
if(typeof TPLF!=="undefined")["lgm","lgh","lay","layH","mjv"].forEach(function(k){if(TPLF.indexOf(k)<0)TPLF.push(k)});

/* ---------- ソファ ---------- */
/* arm: w=幅広アーム n=なし t=木のフレーム / leg: s=短い木脚 h=高い木脚（リビングでもダイニングでも） f=床置き */
F4.mjsofa=function(K,it,W,H,D){var o=O(it),f=fabC(K,it),w=K.wood("oak"),arm=o.arm||"w",lg=o.leg||"s",lh=lg==="h"?.16:lg==="f"?0:.05,sh=lg==="h"?.43:lg==="f"?.2:.4,aw=arm==="w"?Math.min(.2,W*.12):arm==="t"?.05:0,bd=Math.min(.22,D*.24),bh=Math.max(H,sh+.25);
 if(lg!=="f"){var ins=.06;if(lg==="h")rdLegs(K,W,D,lh,ins,.018,.022,w);else sqLegs(K,W,D,lh,ins,.04,w)}
 var bz=lh,baseH=sh-bz-.13;K.box(W-(arm==="t"?2*aw:0),baseH,D,0,bz+baseH/2,0,arm==="t"?w:f,arm==="t"?.004:.02);
 /* 背もたれの土台 */K.box(W-2*aw-(arm==="t"?0:0),bh-bz-baseH-.02,bd*.55,0,bz+baseH+(bh-bz-baseH-.02)/2,-D/2+bd*.28,f,.03);
 /* アーム */if(arm==="w")[-1,1].forEach(function(a){K.cush(aw,sh+.2-bz,D,a*(W/2-aw/2),bz+(sh+.2-bz)/2,0,f,.04,.004)});
 else if(arm==="t")[-1,1].forEach(function(a){var x=a*(W/2-aw/2);K.box(aw,sh+.2,.05,x,(sh+.2)/2,D/2-.04,w,.006);K.box(aw,sh+.2,.05,x,(sh+.2)/2,-D/2+.04,w,.006);K.box(aw,.04,D,x,sh+.2-.02,0,w,.006);K.box(.03,.25,D-.1,x-a*.005,sh-.05,0,w,.003)});
 var iw=W-2*aw,n=o.n||(iw>1.7?3:iw>1.05?2:1),cw=iw/n;for(var i=0;i<n;i++){var x=-iw/2+cw*(i+.5);K.cush(cw-.008,.14,D-bd*.55-.02,x,sh-.07,bd*.27,f,.04,.025);
  if(!o.nb)K.cush(cw-.012,Math.min(.42,bh-sh-.02),.17,x,sh+Math.min(.42,bh-sh-.02)/2,-D/2+bd*.55+.07,f,.06,.03).rotation.x=-.1}};
/* カウチ・オットマン：背のない長い座面（カウチは片側に低い背） */
F4.mjotto=function(K,it,W,H,D){var o=O(it),f=fabC(K,it),w=K.wood("oak"),lh=.05;sqLegs(K,W,D,lh,.06,.04,w);K.box(W,H-lh-.13,D,0,lh+(H-lh-.13)/2,0,f,.02);K.cush(W-.01,.14,D-.01,0,H-.07,0,f,.04,.025)};
/* 体にフィットするソファ：大きな角丸のクッション */
F4.mjbean=function(K,it,W,H,D){var g=K.cush(W,H,D,0,H/2,0,fabC(K,it,"#9a958c"),Math.min(W,H,D)*.32,H*.12);g.scale.y=.98};
/* フロアソファ・ソファベッド：床置きの座面と、傾いた背 */
F4.mjfloor=function(K,it,W,H,D){var f=fabC(K,it,"#8e8d89"),sh=Math.min(.22,H*.45),bk=Math.min(.6,D*.55);K.cush(W,sh,D,0,sh/2,0,f,.04,.02);var bh=Math.max(.25,H-sh),b=K.cush(W,bh,.14,0,sh+bh/2-.02,-D/2+.1,f,.05,.02);b.rotation.x=-.32;b.position.z+=-.02};

/* ---------- テーブル・デスク ---------- */
/* top: r=長方形 c=丸 / lg: sq=角脚 rd=丸脚 st=スチールパイプ fd=折りたたみ kt=こたつ（幕板が深い） cf=カフェ（ハの字の脚） / dr: 引き出し / sf: 下に棚 */
F4.mjtab=function(K,it,W,H,D){var o=O(it),w=K.wood("oak"),tk=o.tk||(H<.5?.03:.025),top=o.top||"r",lg=o.lg||"sq",ty=H-tk/2,m=lg==="st"?steelC(K,o.al?"#c9cacc":null):w;
 if(top==="c")K.cyl(Math.min(W,D)/2,Math.min(W,D)/2-.003,tk,0,ty,0,w,64);else K.box(W,tk,D,0,ty,0,w,.004);
 var lh=H-tk,ix=top==="c"?Math.min(W,D)*.3:Math.min(.08,W*.12),iz=top==="c"?Math.min(W,D)*.3:Math.min(.08,D*.15),ap=lg==="kt"?.09:lg==="cf"||lg==="fd"?0:.06;
 if(lg==="st"&&top==="c"){var rr=Math.min(W,D)*.3;rdLegs(K,rr*2,rr*2,lh,0,.012,.012,m);var rg2=[];for(var q2=0;q2<=24;q2++){var a2=q2/24*6.283;rg2.push([Math.sin(a2)*rr*1.42,lh-.03,Math.cos(a2)*rr*1.42])}K.tube(rg2,.01,m)}
 else if(lg==="st"){[-1,1].forEach(function(a){var x=a*(W/2-.05);K.tube([[x,0,D/2-.06],[x,lh-.01,D/2-.06]],.0125,m);K.tube([[x,0,-D/2+.06],[x,lh-.01,-D/2+.06]],.0125,m);K.tube([[x,.06,D/2-.06],[x,.06,-D/2+.06]],.0125,m);K.box(.025,.02,D-.1,x,lh-.012,0,m,.003)});K.box(W-.1,.025,.02,0,lh-.03,-D/2+.06,m,.003)}
 else if(lg==="fd"){[-1,1].forEach(function(a){var x=a*(W/2-.06);K.box(.035,lh,.035,x,lh/2,D/2-.06,w,.004);K.box(.035,lh,.035,x,lh/2,-D/2+.06,w,.004);K.box(.03,.04,D-.12,x,lh*.25,0,w,.004);K.box(.03,.05,D-.08,x,lh-.025,0,w,.004)})}
 else if(lg==="cf"){var r=Math.min(W,D)/2-.06;[0,1,2,3].forEach(function(i){var a=i*Math.PI/2+.785;K.leg([Math.sin(a)*(r+.04),0,Math.cos(a)*(r+.04)],[Math.sin(a)*r*.62,lh,Math.cos(a)*r*.62],.016,.02,w)});var rg=[];for(var q=0;q<=24;q++){var aa=q/24*6.283;rg.push([Math.sin(aa)*r*.8,lh*.32,Math.cos(aa)*r*.8])}K.tube(rg,.008,w)}
 else{if(lg==="rd")rdLegs(K,W,D,lh,top==="c"?Math.min(W,D)/2-Math.min(W,D)*.3:ix,.018,.024,w);else sqLegs(K,W,D,lh,top==="c"?Math.min(W,D)/2-Math.min(W,D)*.3:ix,lh<.5?.045:.04,w);
  if(ap>0&&top!=="c"){K.box(W-2*ix,ap,.018,0,lh-ap/2,D/2-iz,w,.002);K.box(W-2*ix,ap,.018,0,lh-ap/2,-D/2+iz,w,.002);[-1,1].forEach(function(a){K.box(.018,ap,D-2*iz,a*(W/2-ix),lh-ap/2,0,w,.002)})}}
 if(lg==="kt")K.box(.32,.07,.32,0,lh-.06,0,K.col("#3b3b3b",.6),.01);
 if(o.dr){var dw=Math.min(.5,W*.4);K.box(dw,.07,D*.7,0,lh-.045,0,w,.003);K.box(dw,.07,.016,0,lh-.045,D/2-iz+.01,w,.002);grip(K,0,lh-.02,D/2-iz+.019,.1)}
 if(o.sf)K.box(W-2*ix,.018,D-2*iz,0,Math.min(.15,lh*.35),0,w,.003)};
/* デスク：天板・脚・幕板、引き出し。st=スチールパイプの脚 */
F4.mjdesk=function(K,it,W,H,D){var o=O(it),w=K.wood(it.wtex||"oak"),st=o.lg==="st",m=st?steelC(K):w,tk=.025,lh=H-tk;K.box(W,tk,D,0,H-tk/2,0,w,.004);
 if(st){[-1,1].forEach(function(a){var x=a*(W/2-.03);K.box(.025,lh,.025,x,lh/2,D/2-.04,m,.004);K.box(.025,lh,.025,x,lh/2,-D/2+.04,m,.004);K.box(.025,.025,D-.06,x,.06,0,m,.004);K.box(.025,.03,D-.06,x,lh-.015,0,m,.004)});K.box(W-.06,.03,.02,0,lh-.04,-D/2+.04,m,.003)}
 else{sqLegs(K,W,D,lh,.025,.04,w);K.box(W-.1,.06,.018,0,lh-.03,-D/2+.03,w,.002);[-1,1].forEach(function(a){K.box(.018,.06,D-.1,a*(W/2-.03),lh-.03,0,w,.002)})}
 if(o.dr){var dw=Math.min(.55,W*.45);K.box(dw,.08,D-.08,0,lh-.04,0,w,.003);K.box(dw,.08,.016,0,lh-.04,D/2-.035,w,.002);grip(K,0,lh-.015,D/2-.026,.12)}
 if(o.sf)K.box(W-.08,.02,D*.5,0,.25,-D/4,w,.003)};

/* ---------- いす ---------- */
/* 木のダイニングチェア：先細りの角脚、座（布・ペーパーコード・板）、横桟の背、アーム */
F4.mjdc=function(K,it,W,H,D){var o=O(it),w=K.wood("oak"),sh=o.sh||.43,st=o.seat||"f",arm=!!o.arm,ls=.032;
 [-1,1].forEach(function(a){K.box(ls,sh-.04,ls,a*(W/2-.03),(sh-.04)/2,D/2-.04,w,.004);var p=K.box(ls,H,ls,a*(W/2-.03),H/2,-D/2+.04,w,.004);p.rotation.x=-.06});
 K.box(W-.06,.05,.02,0,sh-.07,D/2-.04,w,.003);K.box(W-.06,.05,.02,0,sh-.07,-D/2+.05,w,.003);[-1,1].forEach(function(a){K.box(.02,.05,D-.08,a*(W/2-.03),sh-.07,0,w,.003);K.box(.018,.025,D-.1,a*(W/2-.03),.15,0,w,.003)});
 if(st==="c")K.box(W-.08,.03,D-.1,0,sh-.02,0,K.tx("cord"),.006);else if(st==="w")K.box(W-.04,.025,D-.06,0,sh-.015,0,w,.006);else K.cush(W-.05,.06,D-.07,0,sh-.01,.005,fabC(K,it,"#9a958c"),.02,.012);
 K.box(W-.06,.08,.022,0,H-.05,-D/2+.035,w,.006);K.box(W-.06,.04,.02,0,sh+.18,-D/2+.045,w,.004);
 if(arm)[-1,1].forEach(function(a){K.box(.05,.025,D*.7,a*(W/2-.03),sh+.21,-D*.1,w,.006);K.box(.028,.2,.028,a*(W/2-.03),sh+.1,D/2-.1,w,.004)})};
/* ラウンジチェア：低く広い座、木の枠と布のクッション */
F4.mjlc=function(K,it,W,H,D){var o=O(it),w=K.wood("oak"),f=fabC(K,it,"#a29b8f"),sh=.38,arm=!!o.arm,aw=arm?.05:0;
 [-1,1].forEach(function(a){K.leg([a*(W/2-.04),0,D/2-.06],[a*(W/2-.04),sh-.04,D/2-.07],.018,.022,w);K.leg([a*(W/2-.04),0,-D/2+.06],[a*(W/2-.04),H-.04,-D/2+.1],.018,.022,w)});
 K.box(W-.06,.04,D-.12,0,sh-.08,0,w,.004);K.cush(W-.08-2*aw,.12,D-.14,0,sh,.02,f,.04,.02);var b=K.cush(W-.1-2*aw,H-sh-.06,.12,0,sh+(H-sh)/2,-D/2+.1,f,.05,.02);b.rotation.x=-.18;
 if(arm)[-1,1].forEach(function(a){K.box(.055,.025,D-.1,a*(W/2-.04),sh+.2,0,w,.008);K.leg([a*(W/2-.04),sh-.04,D/2-.07],[a*(W/2-.04),sh+.19,D/2-.07],.016,.018,w)})};
/* スチールパイプのいす（折りたたみ・樹脂座も） */
F4.mjpipe=function(K,it,W,H,D){var o=O(it),m=steelC(K,o.c||"#4d4e51"),sh=.44,sm=o.seat==="p"?K.col(o.pc||"#4a4a4a",.7):K.wood("beech");
 [-1,1].forEach(function(a){var x=a*(W/2-.03);K.tube([[x,0,D/2-.04],[x,sh-.02,D/2-.06],[x,sh-.02,-D/2+.08],[x,H,-D/2+.04]],.0095,m);K.tube([[x,0,-D/2+.03],[x,sh-.03,-D/2+.08]],.0095,m)});
 K.tube([[-W/2+.03,sh-.03,D/2-.07],[W/2-.03,sh-.03,D/2-.07]],.008,m);K.box(W-.04,.018,D-.1,0,sh,-.01,sm,.006);var bk=K.box(W-.06,.12,.012,0,H-.09,-D/2+.06,sm,.006);bk.rotation.x=-.1};
/* スツール：k: w=木（丸脚）、p=ポリプロピレン、s=スチールパイプ（スタッキング）、t=布張り（スタッキング） */
F4.mjstool=function(K,it,W,H,D){var o=O(it),k=o.k||"w",w=K.wood("beech");
 if(k==="p"){var pm=K.col(o.pc||"#efeeea",.55);K.box(W,.03,D,0,H-.015,0,pm,.01);[-1,1].forEach(function(a){K.box(.03,H-.02,D-.04,a*(W/2-.015),(H-.02)/2,0,pm,.008)});K.box(W-.06,.02,D-.08,0,H*.35,0,pm,.006);return}
 var m=k==="s"?steelC(K,o.c||"#cfd0cf"):w,rd=Math.min(W,D)/2;
 if(o.sq)K.box(W,.03,D,0,H-.015,0,k==="t"?fabC(K,it,"#9a958c"):w,.008);else K.cyl(rd,rd-.003,.03,0,H-.015,0,k==="t"?fabC(K,it,"#9a958c"):w,40);if(k==="t")K.cush(W*.92,.04,D*.92,0,H+.005,0,fabC(K,it,"#9a958c"),.015,.01);
 var r=rd*.8;[0,1,2,3].forEach(function(i){var a=i*Math.PI/2+.785;K.leg([Math.sin(a)*(r+.02),0,Math.cos(a)*(r+.02)],[Math.sin(a)*r*.78,H-.03,Math.cos(a)*r*.78],k==="s"?.009:.015,k==="s"?.009:.018,m)});
 var rg=[];for(var q=0;q<=24;q++){var aa=q/24*6.283;rg.push([Math.sin(aa)*r*.86,H*.32,Math.cos(aa)*r*.86])}K.tube(rg,k==="s"?.006:.01,m)};
/* ラタンのいす：籐の脚と輪、網代の座 */
F4.mjrat=function(K,it,W,H,D){var o=O(it),rt=K.col("#c49a62",.55),sh=.42,arm=!!o.arm;[-1,1].forEach(function(a){[-1,1].forEach(function(b){K.leg([a*(W/2-.04),0,b*(D/2-.05)],[a*(W/2-.05),b>0?sh:H*(arm?.9:1),b*(D/2-.06)],.016,.016,rt)})});
 K.box(W-.08,.025,D-.1,0,sh,0,K.tx("cane"),.006);var bk=[];for(var q=0;q<=16;q++){var t=q/16,a=-Math.PI/2+Math.PI*t;bk.push([Math.sin(a)*(W/2-.05),H*(arm?.9:1)-.01,-D/2+.06-Math.cos(a)*D*.1])}K.tube(bk,.014,rt);
 var mid=bk.map(function(p){return[p[0],p[1]-.16,p[2]]});K.tube(mid,.01,rt);if(arm)[-1,1].forEach(function(a){K.tube([[a*(W/2-.05),sh+.2,-D/2+.15],[a*(W/2-.04),sh+.2,D/2-.06],[a*(W/2-.04),sh,D/2-.06]],.013,rt)})};
/* ワーキングチェア：5本脚とキャスター、昇降の柱、座クッション、メッシュの背 */
F4.mjwork=function(K,it,W,H,D){var o=O(it),m=K.col("#3c3d40",.5,.3),f=fabC(K,it,"#55565a"),sh=.45,R=Math.min(W,D)/2-.02;
 for(var i=0;i<5;i++){var a=i/5*6.283;K.leg([0,.07,0],[Math.sin(a)*R,.06,Math.cos(a)*R],.015,.012,m);K.cyl(.025,.025,.03,Math.sin(a)*R,.025,Math.cos(a)*R,K.col("#222",.6),12)}
 K.cyl(.025,.025,sh-.12,0,.07+(sh-.12)/2,0,K.col("#9a9a9a",.3,.8),16);K.cush(W*.9,.07,D*.8,0,sh,.03,f,.025,.015);
 K.box(.05,.3,.03,0,sh+.08,-D*.4+.02,m,.006);var bk=K.box(W*.8,H-sh-.12,.03,0,sh+.12+(H-sh-.12)/2,-D*.42,o.mesh?K.col("#3f4043",.85):f,.03);bk.rotation.x=-.08;
 if(o.arm)[-1,1].forEach(function(a){K.box(.03,.2,.03,a*(W*.42),sh+.1,-.02,m,.006);K.box(.05,.025,.24,a*(W*.42),sh+.21,-.02,m,.01)})};
/* ベンチ：板の座面と脚 */
F4.mjbench=function(K,it,W,H,D){var o=O(it),w=K.wood("beech"),tk=.03;K.box(W,tk,D,0,H-tk/2,0,w,.006);if(o.lg==="rd")rdLegs(K,W,D,H-tk,.07,.017,.022,w,.015);else{sqLegs(K,W,D,H-tk,.05,.035,w);[-1,1].forEach(function(a){K.box(.025,.04,D-.12,a*(W/2-.05),.15,0,w,.003)})}};
/* ラグ：薄い布にキルティングの線 */
F4.mjrug=function(K,it,W,H,D){var f=fabC(K,it,"#d6ccbb"),h=Math.max(.006,Math.min(.015,H||.01));K.box(W,h,D,0,h/2,0,f,.003);if(O(it).q){var lm=K.col("#000",1);lm.transparent=true;lm.opacity=.06;for(var x=-W/2+.1;x<W/2;x+=.1)K.box(.003,.001,D-.04,x,h+.0005,0,lm,0)}};

/* ---------- 商品名 → 形 ---------- */
window.mjShape=function(p){var n=p.name+" "+(p.sub||""),c=p.cat,o={},f="",fs="";
 var col=/ライトグレー/.test(n)?"#c4c3be":/ダークグレー|チャコール/.test(n)?"#55565a":/グレー|GRAY/.test(n)?"#8e8d89":/ネイビー|NAVY/.test(n)?"#2f3a52":/ブラウン/.test(n)?"#6a5242":/ベージュ|生成|アイボリー/.test(n)?"#d5cab5":/グリーン|GREEN/.test(n)?"#6f7a62":/ブルー|BLUE/.test(n)?"#4f6f94":/ブラック|BLACK/.test(n)?"#2b2b2b":/ホワイト|白/.test(n)?"#eeece6":"";
 if(c==="shelf"){fs="shelf";
  if(/ユニットシェルフ/.test(n)){f="mjus";o.mt=/ステンレス/.test(n)?"x":/パイン/.test(n)?"p":"s";o.sh=/オーク材棚|ウォールナット材棚/.test(n)?"w":"";o.n=p.tiers||0}
  else if(/手軽に組み立てられる木製シェルフ/.test(n)){f="mjus";o.mt="p";o.x=0;o.n=p.tiers||0}
  else if(/スタッキングチェスト/.test(n)){f="mjsc";o.c=/ハーフ/.test(n)?2:1}
  else if(/スタッキングキャビネット/.test(n)){f="mjss";o.cells=[];var cc=Math.max(1,Math.round(p.w/420));for(var i=0;i<cc;i++)o.cells.push([i,0,i%2?"r":"d"])}
  else if(/スタッキングシェルフ/.test(n)){f="mjssh";o.bk=/背板/.test(n)?1:0}
  else if(/家具/.test(n)&&/壁/.test(n)){f="mjwall"}
  else if(/チェスト|引出/.test(n)){f="mjch"}
  else if(/キャビネット|扉/.test(n)){f="mjcab";o.g=/ガラス/.test(n)?1:0}
  else{f="mjss"}}
 else if(c==="bed"){fs="bed";if(/脚付マットレス/.test(n))f="mjlm";else{f="mjbed";o.hb=/もたれ/.test(n)?"r":"p"}}
 else if(c==="sofa"){fs="sofa";col=col||"#b9b1a3";
  if(/体にフィット|PUUF/.test(n)){f="mjbean";fs="bench"}
  else if(/オットマン|OTTOMAN/.test(n)){f="mjotto";fs="bench"}
  else if(/フロアソファ|ソファベッド/.test(n)){f="mjfloor"}
  else if(/ソファチェア|リビングでもダイニングでも/.test(n)){f="mjsofa";o.arm="t";o.leg="h";o.n=1}
  else{f="mjsofa";o.arm=/アームレス|カウチ/.test(n)?"n":/木製フレーム|木製アーム/.test(n)?"t":"w";o.leg="s";if(/カウチ/.test(n))o.nb=0;if(/ARM CHAIR|1シーター|１シーター/.test(n))o.n=1}}
 else if(c==="table"||c==="lt"){fs=c==="lt"?"lt":"table";f="mjtab";o.top=p.top==="round"||/丸テーブル|直径|ラウンド/.test(n)?"c":"r";
  o.al=/アルミ/.test(n)?1:0;o.lg=/スチールパイプ|アルミ脚/.test(n)?"st":/折りたたみ/.test(n)?"fd":/こたつ/.test(n)?"kt":/カフェテーブル/.test(n)?"cf":/丸脚/.test(n)?"rd":"sq";o.dr=/引出/.test(n)?1:0;o.sf=/棚付|ローテーブル.*棚/.test(n)?1:0}
 else if(c==="desk"){fs="desk";f="mjdesk";o.lg=/スチールパイプ/.test(n)?"st":"";o.dr=/引出|デスクセット|パイン材デスク/.test(n)?1:0}
 else if(c==="bench"){fs="bench";f="mjbench";o.lg=/丸脚/.test(n)?"rd":""}
 else if(c==="rug"){fs="g";f="mjrug";o.q=/キルティング/.test(n)?1:0;col=col||"#d6ccbb"}
 else if(c==="chair"){fs="chair";
  if(/曲げ木/.test(n)){f="bent"}
  else if(/ラウンドチェア/.test(n)){f="round"}
  else if(/ワーキング/.test(n)){f="mjwork";o.arm=/アーム/.test(n)?1:0;o.mesh=/メッシュ/.test(n)?1:0}
  else if(/ラタン/.test(n)){f="mjrat";o.arm=/アーム/.test(n)?1:0}
  else if(/ラウンジ/.test(n)){f="mjlc";o.arm=/アーム/.test(n)?1:0}
  else if(/スツール/.test(n)){f="mjstool";o.k=/ポリプロピレン/.test(n)?"p":/スチールパイプ/.test(n)?"s":/再生ポリエステル|布/.test(n)?"t":"w";o.sq=/ポリプロピレン/.test(n)?1:0}
  else if(/スチール|アルミ/.test(n)){f="mjpipe";o.seat=/樹脂|アルミ/.test(n)?"p":"w";if(/アルミ/.test(n)){o.c="#c9cacc";o.pc="#c9cacc"}}
  else if(/IDEE|\[/.test(n)){f="mjdc";o.seat="f"}
  else{f="mjdc";o.arm=/アーム/.test(n)?1:0;o.seat=/ペーパーコード/.test(n)?"c":/無垢材チェア|板座|木製アームチェア/.test(n)?"w":"f"}}
 var wt=/ブラック|BLACK|チャコール/.test(n)&&/chair|table|lt|desk|bench/.test(c)?"blackoak":"";
 return{f4:f,fs:fs,mj:o,col:col,wtex:wt}};
})();
