"""p12: 家具 v4（名作家具に似た形＋汎用モデル）を組み込む。中身は _dev/src/furn4.js"""
import os
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=os.path.join(D,"furniture-catalog.html")
s=open(P,encoding="utf-8").read()
def R(a,b,n=1):
    global s
    assert s.count(a)>=1,a[:80]; s=s.replace(a,b,n)
R("/*@@END tex4@@*/\n","/*@@END tex4@@*/\n/*@@BEGIN furn4@@*/\n/*@@END furn4@@*/\n")
R("  else if(catBuild(it,fs,bw,bh,bd,{part:part,","  else if(it.f4&&F4[it.f4]&&furn4(it,bw,bh,bd,{part:part,mat:mat,lt:lt,g:g})){}\n  else if(catBuild(it,fs,bw,bh,bd,{part:part,")
R('var TPLF=["sp","glb",','var TPLF=["f4","arm","leg","bk","cu","top","lg","back","dr","hb","ftex","sp","glb",')
# 旧モデルを一覧から外す
R('function tplList(){var L=[];','function tplList(all){var L=[];')
R('a[1].forEach(function(m,i){L.push({id:a[0]+":"+i,m:m,g:tplGroup(m)})})','a[1].forEach(function(m,i){if(!all&&m.old)return;L.push({id:a[0]+":"+i,m:m,g:tplGroup(m)})})')
R('function tplGet(id){var L=tplList();','function tplGet(id){var L=tplList(1);')
R('function add(m,v){var g=tplGroup(m);','function add(m,v){if(m.old)return;var g=tplGroup(m);')
# 詳細設定：v4 家具は形の選択肢を出す
R("     it.fs===\"sofa\"?'<label class=\"pro-only\">ソファのタイプ（PRO）'",
  "     it.f4?(F4OPT[it.f4]||[]).map(function(o){return'<label>'+o[1]+sel(o[0],o[2],it[o[0]]||o[2][0][0])+'</label>'}).join(\"\"):\n     it.fs===\"sofa\"?'<label class=\"pro-only\">ソファのタイプ（PRO）'")
# 選び直しのとき再描画（形が変わる）
R("if(f===\"kind\")render();","if(f===\"kind\")render();if(items[i].f4&&F4OPT[items[i].f4]&&F4OPT[items[i].f4].some(function(o){return o[0]===f})){try{after3d()}catch(_){}}\n if(f===\"fs\"&&items[i].f4)delete items[i].f4;")
R(' else if(geo.type==="CylinderGeometry"){var cr=Math.PI*2*(P.radiusTop||.1),ch=P.height||.5;for(i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*cr/TS,uv.getY(i)*ch/TS)}',' else if(geo.type==="CylinderGeometry"){var rr=Math.max(P.radiusTop||0,P.radiusBottom||0)||.1,cr=Math.PI*2*rr,ch=P.height||.5,nT=((P.radialSegments||8)+1)*((P.heightSegments||1)+1),sw2=ch>rr*2;\n  for(i=0;i<uv.count;i++){var u1=uv.getX(i),v1=uv.getY(i);if(i>=nT)uv.setXY(i,u1*2*rr/TS,v1*2*rr/TS);else if(sw2)uv.setXY(i,v1*ch/TS,u1*cr/TS);else uv.setXY(i,u1*cr/TS,v1*ch/TS)}}')
R(' for(var i=0;i<p.count;i++){q[0]=mp(p.getX(i),E[0]);q[1]=mp(p.getY(i),E[1]);q[2]=mp(p.getZ(i),E[2]);var L=0;',' /* UV も寄せた位置に合わせる（真ん中の面に模様が引き伸ばされないように） */var uvA=g.attributes.uv,PF=uvA.count/6,AX=[[2,1],[2,1],[0,2],[0,2],[0,1],[0,1]];\n for(var i0=0;i0<uvA.count;i0++){var ax=AX[Math.min(5,Math.floor(i0/PF))],o=[p.getX(i0),p.getY(i0),p.getZ(i0)];for(var c0=0;c0<2;c0++){var A=ax[c0],fo=(o[A]+E[A])/(2*E[A]),fn=(mp(o[A],E[A])+E[A])/(2*E[A]),cu=c0?uvA.getY(i0):uvA.getX(i0),nv=Math.abs(cu-fo)<1e-3?fn:1-fn;if(c0)uvA.setY(i0,nv);else uvA.setX(i0,nv)}}uvA.needsUpdate=true;\n for(var i=0;i<p.count;i++){q[0]=mp(p.getX(i),E[0]);q[1]=mp(p.getY(i),E[1]);q[2]=mp(p.getZ(i),E[2]);var L=0;')
open(P,"w",encoding="utf-8").write(s);print("ok")
