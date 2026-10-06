"""p5: 3Dモデルの刷新。
- 角の立った箱を、なめらかな角丸（法線もなめらか）に置き換え（パーツごとの色・素材の仕組みはそのまま）
- 色の扱いを正しく（sRGB）し、光と影をやわらかく。家具の足もとに接地の影
- 写真のように仕上げる（パストレーサー）側の色は元のまま渡す"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)

# ---------- 角丸の箱（なめらか） ----------
a = s.index('function rbx(w,h,d,r){')
b = s.index('function r3d(){', a)
s = s[:a] + (
    '/* なめらかな角丸の箱：BoxGeometry を細かく分け、角を球面に寄せる（UV は箱のまま、法線は面に沿ってなめらか） */\n'
    'function rbx(w,h,d,r,m){r=Math.max(.0012,Math.min(r||.004,w*.45,h*.45,d*.45));m=m||(r>=.02?5:r>=.008?3:2);var n=2*m+1,g=new THREE.BoxGeometry(w,h,d,n,n,n),p=g.attributes.position,nr=g.attributes.normal,\n'
    ' E=[w/2,h/2,d/2],I=[w/2-r,h/2-r,d/2-r],q=[0,0,0],u=[0,0,0];\n'
    ' function mp(x,hh){var t=Math.round((x+hh)/(2*hh)*n);if(t<=m)return-hh+r-r*Math.cos(t/m*Math.PI/2);if(t>=n-m)return hh-r+r*Math.cos((n-t)/m*Math.PI/2);return x}\n'
    ' for(var i=0;i<p.count;i++){q[0]=mp(p.getX(i),E[0]);q[1]=mp(p.getY(i),E[1]);q[2]=mp(p.getZ(i),E[2]);var L=0;\n'
    '  for(var k=0;k<3;k++){var c=Math.max(-I[k],Math.min(I[k],q[k]));u[k]=q[k]-c;L+=u[k]*u[k]}L=Math.sqrt(L);\n'
    '  if(L>1e-9){for(k=0;k<3;k++){var c2=q[k]-u[k];q[k]=c2+u[k]/L*r;u[k]/=L}p.setXYZ(i,q[0],q[1],q[2]);nr.setXYZ(i,u[0],u[1],u[2])}else p.setXYZ(i,q[0],q[1],q[2])}\n'
    ' p.needsUpdate=true;nr.needsUpdate=true;g.computeBoundingSphere();return g}\n'
) + s[b:]

# 家具の中の「箱」も角丸に（細い板・脚も角がわずかに丸い）
rep('  function bx(w,h,d){return new THREE.BoxGeometry(w,h,d)}',
    '  function bx(w,h,d){return rbx(w,h,d,Math.min(.006,Math.min(w,h,d)*.22))}')
rep('  else part(new THREE.BoxGeometry(bw,bh,bd),0,bh/2,0);',
    '  else part(rbx(bw,bh,bd,Math.min(.02,Math.min(bw,bh,bd)*.12)),0,bh/2,0);')
rep('NE=false;part(new THREE.BoxGeometry(bw,bh,bd),0,bh/2,0,new THREE.MeshStandardMaterial({color:col,roughness:.75}))}',
    'NE=false;part(rbx(bw,bh,bd,Math.min(.02,Math.min(bw,bh,bd)*.12)),0,bh/2,0,new THREE.MeshStandardMaterial({color:col,roughness:.75}))}')
rep(' function B(w,h,d,x,y,z,m,r){return P(rbx(Math.max(.004,w),Math.max(.004,h),Math.max(.004,d),r||.004),x,y,z,m||null,true)}',
    ' function B(w,h,d,x,y,z,m,r){w=Math.max(.004,w);h=Math.max(.004,h);d=Math.max(.004,d);return P(rbx(w,h,d,Math.max(r||0,Math.min(.01,Math.min(w,h,d)*.2))),x,y,z,m||null,true)}')

# UV：分割された箱でも面ごとに直す
rep(' if(geo.type==="BoxGeometry"){var w=P.width,h=P.height,d=P.depth,F=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];\n'
    '  for(var f=0;f<6;f++){var a=F[f][0]/TS,b=F[f][1]/TS,sw=(f<2||f>3)&&F[f][1]>F[f][0]*1.5;\n'
    '   for(i=f*4;i<f*4+4;i++){',
    ' if(geo.type==="BoxGeometry"){var w=P.width,h=P.height,d=P.depth,F=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]],PF=Math.floor(uv.count/6)||4;\n'
    '  for(var f=0;f<6;f++){var a=F[f][0]/TS,b=F[f][1]/TS,sw=(f<2||f>3)&&F[f][1]>F[f][0]*1.5;\n'
    '   for(i=f*PF;i<f*PF+PF;i++){')
# 図面風（輪郭線）は角丸の細かい線を拾わない
rep('new THREE.EdgesGeometry(geo)', 'new THREE.EdgesGeometry(geo,28)')

# ---------- 足もとの接地の影 ----------
rep('  }catch(er){if(window.console)console.warn(er);while(g.children.length)g.remove(g.children[0]);',
    '  if(R3REAL&&fs!=="g"&&fs!=="l"&&bh>.05){try{var cs=new THREE.Mesh(new THREE.PlaneGeometry(1,1),cShadowMat());cs.rotation.x=-Math.PI/2;cs.scale.set(bw+.18,bd+.18,1);cs.position.y=.0025;cs.renderOrder=-1;cs.raycast=function(){};cs.userData.cshadow=1;g.add(cs)}catch(x){}}\n'
    '  }catch(er){if(window.console)console.warn(er);while(g.children.length)g.remove(g.children[0]);')
rep('function r3d(){',
    '/* 接地の影（ぼかした角丸の影を1枚だけ作って使い回す） */\n'
    'var CSM=null;function cShadowMat(){if(CSM)return CSM;var S=128,c=document.createElement("canvas");c.width=c.height=S;var x=c.getContext("2d");\n'
    ' x.shadowColor="rgba(0,0,0,1)";x.shadowBlur=18;x.shadowOffsetX=S*4;x.fillStyle="#000";var p=26-S*4,q=26,ww=S-52,hh=S-52,rr=14;\n'
    ' x.beginPath();x.moveTo(p+rr,q);x.arcTo(p+ww,q,p+ww,q+hh,rr);x.arcTo(p+ww,q+hh,p,q+hh,rr);x.arcTo(p,q+hh,p,q,rr);x.arcTo(p,q,p+ww,q,rr);x.closePath();x.fill();\n'
    ' var t=new THREE.CanvasTexture(c);CSM=new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});CSM.userData.keep=1;return CSM}\n'
    'function r3d(){')

# ---------- 色の扱い（sRGB）：すべての描画で、色を正しく変換してから描く ----------
rep('var T={r:null,sc:null,cam:null,th:.6,ph:1.0,dist:7,tg:null};',
    'var T={r:null,sc:null,cam:null,th:.6,ph:1.0,dist:7,tg:null};\n'
    '/* 色はすべて画面の色（sRGB）で書かれているので、描く前に一度だけ光の計算用の色（リニア）に直し、出力をsRGBにする */\n'
    'function linMats(root){root.traverse(function(o){var M=o.material;if(!M)return;(Array.isArray(M)?M:[M]).forEach(function(m){if(m._lin)return;m._lin=1;\n'
    ' if(m.color&&m.color.convertSRGBToLinear)m.color.convertSRGBToLinear();if(m.emissive&&m.emissive.convertSRGBToLinear)m.emissive.convertSRGBToLinear();\n'
    ' ["map","emissiveMap"].forEach(function(k){var t=m[k];if(t&&t.encoding!==THREE.sRGBEncoding){t.encoding=THREE.sRGBEncoding;t.needsUpdate=true}});m.needsUpdate=true})})}\n'
    '(function(){if(typeof THREE==="undefined"||THREE.WebGLRenderer.prototype._linp)return;var R=THREE.WebGLRenderer.prototype.render;THREE.WebGLRenderer.prototype._linp=1;\n'
    ' THREE.WebGLRenderer.prototype.render=function(sc,cam){if(this.outputEncoding!==THREE.sRGBEncoding)this.outputEncoding=THREE.sRGBEncoding;if(sc&&sc.isScene)linMats(sc);return R.call(this,sc,cam)}})();')
# 色を変えるとき（パーツの色など）は、新しい色として変換し直す
rep('if(ov){if(ov.tx&&TEX[ov.tx])mm=texMat(ov.tx,ov.c||null);else if(ov.c){mm=mm.clone();mm.color=new THREE.Color(ov.c)}}',
    'if(ov){if(ov.tx&&TEX[ov.tx])mm=texMat(ov.tx,ov.c||null);else if(ov.c){mm=mm.clone();mm._lin=0;mm.color=new THREE.Color(ov.c)}}')
rep('  var lt=mat.clone();lt.color=mat.color.clone().offsetHSL(0,0,.07);', '  var lt=mat.clone();lt._lin=0;lt.color=mat.color.clone().offsetHSL(0,0,.07);')

# 写真のように仕上げる：元の色（sRGB）に戻して渡す
rep(' function mat(m){if(MC.has(m))return MC.get(m);var o=new N.MeshPhysicalMaterial();o.color.set(ptHex(m.color));o.side=side(m.side);\n'
    '  if(m.isMeshBasicMaterial){o.color.set("#000");o.emissive.set(ptHex(m.color));o.emissiveIntensity=1}',
    ' function sc0(c){return c&&m0lin?c.clone().convertLinearToSRGB():c}var m0lin=false;\n'
    ' function mat(m){if(MC.has(m))return MC.get(m);m0lin=!!m._lin;var o=new N.MeshPhysicalMaterial();o.color.set(ptHex(sc0(m.color)));o.side=side(m.side);\n'
    '  if(m.isMeshBasicMaterial){o.color.set("#000");o.emissive.set(ptHex(sc0(m.color)));o.emissiveIntensity=1}')
rep('if(m.emissive){o.emissive.set(ptHex(m.emissive));', 'if(m.emissive){o.emissive.set(ptHex(sc0(m.emissive)));')
rep('o.sheenColor.set(ptHex(m.color)).lerp(', 'o.sheenColor.set(ptHex(sc0(m.color))).lerp(')
rep('var d=new N.DirectionalLight(ptHex(new THREE.Color(0xffffff).lerp(l.color,.55)),l.intensity*2.6*(+plan.lb||1));',
    'var d=new N.DirectionalLight(ptHex(new THREE.Color(0xffffff).lerp(l.color,.55)),(l.userData.pti||l.intensity)*2.6*(+plan.lb||1));')
rep('else if(l.isPointLight){var p=new N.PointLight(ptHex(l.color),l.intensity*2.2,0,2);',
    'else if(l.isPointLight){var p=new N.PointLight(ptHex(l.color),(l.userData.pti||l.intensity)*2.2,0,2);')

# ---------- 光：やわらかく、白っぽく飛ばない ----------
rep('T.r.toneMapping=hqOn()&&R3REAL?THREE.ACESFilmicToneMapping:THREE.LinearToneMapping;T.r.toneMappingExposure=expo();',
    'T.r.toneMapping=R3REAL?THREE.ACESFilmicToneMapping:THREE.LinearToneMapping;T.r.toneMappingExposure=expo();')
rep('function expo(){return(+plan.lb||1)*(hqOn()&&R3REAL?1.3:1)}', 'function expo(){return(+plan.lb||1)*(R3REAL?1.05:1)}')
rep(' sc.add(new THREE.HemisphereLight(R3REAL?skyC:0xffffff,R3REAL?0xcbbca6:0xb8b0a5,R3REAL?.32:.75));\n'
    ' var dl=new THREE.DirectionalLight(R3REAL?sunC:0xffffff,R3REAL?.95:.8),',
    ' sc.add(new THREE.HemisphereLight(R3REAL?skyC:0xffffff,R3REAL?0xcfc6b8:0xb8b0a5,R3REAL?1.05:.75));\n'
    ' var dl=new THREE.DirectionalLight(R3REAL?sunC:0xffffff,R3REAL?1.9:.8),')
rep('T.dl=dl;dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);dl.shadow.bias=-.0005;',
    'T.dl=dl;dl.userData.pti=R3REAL?.95:.8;dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);dl.shadow.bias=-.0004;dl.shadow.normalBias=.012;dl.shadow.radius=5;')
rep('if(R3REAL&&typeof T!=="undefined"&&(T.nl=(T.nl||0)+1)<=4){var PL=new THREE.PointLight(0xffd2a0,.55,4,2);',
    'if(R3REAL&&typeof T!=="undefined"&&(T.nl=(T.nl||0)+1)<=4){var PL=new THREE.PointLight(0xffd2a0,1.2,4,2);PL.userData.pti=.55;')

open(P, "w", encoding="utf-8").write(s); print("p5 OK")
