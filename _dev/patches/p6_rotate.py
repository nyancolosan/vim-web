"""p6: 回転ハンドル。
- 平面図：選んだ家具の上に円矢印。つかんで回すと、30°ごとに吸い付く（近いときだけ。それ以外は1°単位）
- 3D：選んだ家具の上に出る「回転」を、左右にドラッグして回す（タップは従来どおり30°）
- ついでに：3Dの部屋では接地の影が二重にならないように、パーツ色の初期値を正しい色で表示"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)

# 共通：30°への吸着と、部屋からはみ出さないように戻す
rep('var sv=document.getElementById("svg");',
    '/* 回転：30°の倍数に近いとき（±7°）は吸い付く。それ以外は1°単位 */\n'
    'function rotSnap(a){a=((a%360)+360)%360;var n=Math.round(a/30)*30;return Math.abs(a-n)<=7?n%360:Math.round(a)%360}\n'
    'function clampPc(pc){var s=size(pc),bd=bnd();pc.x=Math.max(bd.x0+s.bw/2,Math.min(bd.x1-s.bw/2,pc.x));pc.y=Math.max(bd.y0+s.bh/2,Math.min(bd.y1-s.bh/2,pc.y))}\n'
    '/* 平面図の回転ハンドル（選んだ家具の上に、画面上で一定の大きさで描く） */\n'
    'function rotHandle(EX,W){if(VIEW||sel<0||!plan.p[sel]||selO>=0||selH>=0)return"";var pc=plan.p[sel],s=size(pc),el=document.getElementById("svg"),cw=(el&&el.clientWidth)||360,k=(W+EX.l+EX.r)/cw,\n'
    ' R=17*k,gap=22*k,hx=pc.x,top=pc.y-s.bh/2,hy=top-gap-R;if(hy-R<-EX.t){top=pc.y+s.bh/2;hy=top+gap+R}\n'
    ' var r=R*.52,a1=-50*Math.PI/180,a2=215*Math.PI/180,sx=hx+r*Math.cos(a1),sy=hy+r*Math.sin(a1),ex=hx+r*Math.cos(a2),ey=hy+r*Math.sin(a2),tx=-Math.sin(a2),ty=Math.cos(a2),h=R*.34,\n'
    '  nx=-ty,ny=tx,p1=[ex+tx*h*.2,ey+ty*h*.2],p2=[ex-tx*h*.9+nx*h*.75,ey-ty*h*.9+ny*h*.75],p3=[ex-tx*h*.9-nx*h*.75,ey-ty*h*.9-ny*h*.75],sw=1.7*k,on=drag&&drag.rot!==undefined;\n'
    ' return\'<g class="roth\'+(on?" on":"")+\'" data-rot="1"><line x1="\'+hx+\'" y1="\'+top+\'" x2="\'+hx+\'" y2="\'+(hy+(hy<top?R:-R))+\'" stroke="#111" stroke-width="\'+sw+\'" stroke-dasharray="\'+(4*k)+\' \'+(3*k)+\'"/>\'\n'
    '  +\'<circle cx="\'+hx+\'" cy="\'+hy+\'" r="\'+(R*1.45)+\'" fill="transparent"/><circle cx="\'+hx+\'" cy="\'+hy+\'" r="\'+R+\'" fill="\'+(on?"#111":"#fff")+\'" stroke="#111" stroke-width="\'+sw+\'"/>\'\n'
    '  +\'<path d="M\'+sx+\' \'+sy+\' A\'+r+\' \'+r+\' 0 1 1 \'+ex+\' \'+ey+\'" fill="none" stroke="\'+(on?"#fff":"#111")+\'" stroke-width="\'+(sw*1.15)+\'" stroke-linecap="round"/>\'\n'
    '  +\'<polygon points="\'+[p1,p2,p3].map(function(p){return p[0]+","+p[1]}).join(" ")+\'" fill="\'+(on?"#fff":"#111")+\'"/>\'\n'
    '  +(on?\'<text x="\'+hx+\'" y="\'+(hy<top?hy-R*1.7:hy+R*2.3)+\'" text-anchor="middle" style="font-size:\'+(13*k)+\'px;font-weight:800;fill:#111">\'+pc.r+\'°</text>\':\'\')+\'</g>\'}\n'
    'var sv=document.getElementById("svg");')
rep('setAttribute("viewBox",(-EX.l)+" "+(-EX.t)+" "+(W+EX.l+EX.r)+" "+(D+EX.t+EX.b));svg.innerHTML=g;',
    'setAttribute("viewBox",(-EX.l)+" "+(-EX.t)+" "+(W+EX.l+EX.r)+" "+(D+EX.t+EX.b));g+=rotHandle(EX,W);svg.innerHTML=g;')
rep('sv.addEventListener("pointerdown",function(e){if(FLW>=0&&plan.fl[FLW]){',
    'sv.addEventListener("pointerdown",function(e){var rh=e.target.closest&&e.target.closest("[data-rot]");if(rh&&plan.p[sel]){var pr=plan.p[sel],qr=pt(e);drag={rot:sel,a0:Math.atan2(qr.y-pr.y,qr.x-pr.x)*180/Math.PI,r0:pr.r};sv.setPointerCapture(e.pointerId);e.preventDefault();rplan();return}\n'
    ' if(FLW>=0&&plan.fl[FLW]){')
rep('sv.addEventListener("pointermove",function(e){if(!drag)return;',
    'sv.addEventListener("pointermove",function(e){if(!drag)return;\n'
    ' if(drag.rot!==undefined){var pr=plan.p[drag.rot];if(!pr)return;var qr=pt(e),ar=Math.atan2(qr.y-pr.y,qr.x-pr.x)*180/Math.PI;pr.r=rotSnap(drag.r0+ar-drag.a0);clampPc(pr);rplan();return}')
rep('sv.addEventListener("pointerup",function(){if(drag){drag=null;psave()}});',
    'sv.addEventListener("pointerup",function(){if(drag){var wr=drag.rot!==undefined;drag=null;psave();if(wr){rplan();after3d()}}});')
rep('.sel3{position:absolute;', '.roth{cursor:grab;touch-action:none}.roth.on{cursor:grabbing}\n#s3r{touch-action:none;cursor:ew-resize}\n.sel3{position:absolute;')

# 3D：「回転」を左右にドラッグ
rep('document.getElementById("s3r").onclick=function(){rplan();document.getElementById("rot").click();r3d()};',
    '(function(){var b=document.getElementById("s3r"),st=null;b.title="左右にドラッグで回転（タップで30°）";\n'
    ' b.addEventListener("pointerdown",function(e){var pc=plan.p[sel];if(!pc)return;st={x:e.clientX,r0:pc.r,mv:false};try{b.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault();e.stopPropagation()});\n'
    ' b.addEventListener("pointermove",function(e){if(!st)return;var dx=e.clientX-st.x;if(Math.abs(dx)>5)st.mv=true;if(!st.mv)return;var pc=plan.p[sel],f=T.fg&&T.fg[sel];if(!pc||!f)return;\n'
    '  pc.r=rotSnap(st.r0+dx*.75);f.g.rotation.y=-pc.r*Math.PI/180;if(f.sh)f.sh.visible=false;if(T.hl&&T.hl.update)T.hl.update();var it=items[pc.n]||{};document.getElementById("sel3n").textContent=(it.name||"")+"　"+pc.r+"°";rend3()});\n'
    ' function end(){if(!st)return;var mv=st.mv;st=null;var pc=plan.p[sel];if(!pc)return;if(!mv)pc.r=(Math.round(pc.r/30)*30+30)%360;clampPc(pc);psave();rplan();r3d()}\n'
    ' b.addEventListener("pointerup",end);b.addEventListener("pointercancel",end)})();')

# 3Dの部屋では、部屋側の接地の影を使う（家具に付けた影は一覧のサムネイル用）
rep('  var g=furnGroup(pc,it),bh=(+it.h||500)/1000;',
    '  var g=furnGroup(pc,it),bh=(+it.h||500)/1000;g.children.filter(function(c){return c.userData.cshadow}).forEach(function(c){g.remove(c)});')
# パーツの色の初期値（リニアに直した色を画面の色に戻して表示）
rep('document.getElementById("ppc").value=ov.c||(ms.material&&ms.material.color?"#"+ms.material.color.getHexString():"#cccccc");',
    'document.getElementById("ppc").value=ov.c||(ms.material&&ms.material.color?"#"+(ms.material._lin?ms.material.color.clone().convertLinearToSRGB():ms.material.color).getHexString():"#cccccc");')

open(P, "w", encoding="utf-8").write(s); print("p6 OK")
