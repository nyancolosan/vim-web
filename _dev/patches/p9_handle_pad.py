"""p9: 回転ハンドルのデザイン刷新と、平面図の操作パッド（利き手に合わせて左右）。
- 回転：家具のまわりに細いリング＋黒い丸のつまみ（両向きの矢印）。回している間は角度のラベル
- 操作パッド：家具を選ぶと画面の下に出る。真ん中のつまみをドラッグで連続移動、矢印タップで1cm、長押しで連続。左右に回転ボタン
- 設定：操作パッドの位置（右手・左手・表示しない）"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)

# ---------- 回転ハンドル（平面図） ----------
a = s.index('function rotHandle(EX,W){')
b = s.index('var sv=document.getElementById("svg");', a)
s = s[:a] + (
    'function rotHandle(EX,W){if(VIEW||sel<0||!plan.p[sel]||selO>=0||selH>=0)return"";var pc=plan.p[sel],s=size(pc),el=document.getElementById("svg"),cw=(el&&el.clientWidth)||360,k=(W+EX.l+EX.r)/cw,\n'
    ' on=drag&&drag.rot!==undefined,rr=Math.hypot(s.bw,s.bh)/2+10*k,R=13*k,ang=-90,hx=pc.x+rr*Math.cos(ang*Math.PI/180),hy=pc.y+rr*Math.sin(ang*Math.PI/180);\n'
    ' if(hy-R<-EX.t+2*k){hy=pc.y+rr;}\n'
    ' var ic=R*.5,sw=1.6*k,ar=function(a0,a1){var p=function(a){return[hx+ic*Math.cos(a),hy+ic*Math.sin(a)]},s0=p(a0),s1=p(a1);return"M"+s0[0]+" "+s0[1]+" A"+ic+" "+ic+" 0 0 1 "+s1[0]+" "+s1[1]},\n'
    '  hd=function(a,dir){var x=hx+ic*Math.cos(a),y=hy+ic*Math.sin(a),tx=-Math.sin(a)*dir,ty=Math.cos(a)*dir,h=R*.26,nx=-ty,ny=tx;return x+tx*h+","+(y+ty*h)+" "+(x-tx*h*.3+nx*h*.9)+","+(y-ty*h*.3+ny*h*.9)+" "+(x-tx*h*.3-nx*h*.9)+","+(y-ty*h*.3-ny*h*.9)};\n'
    ' var a0=-2.35,a1=-.8,b0=.8,b1=2.35;\n'
    ' return\'<g class="roth\'+(on?" on":"")+\'" data-rot="1">\'\n'
    '  +\'<circle cx="\'+pc.x+\'" cy="\'+pc.y+\'" r="\'+rr+\'" fill="none" stroke="#111" stroke-opacity="\'+(on?.55:.22)+\'" stroke-width="\'+(1.2*k)+\'" stroke-dasharray="\'+(on?"none":(2*k)+" "+(4*k))+\'" style="pointer-events:none"/>\'\n'
    '  +\'<circle cx="\'+hx+\'" cy="\'+hy+\'" r="\'+(R*1.9)+\'" fill="transparent"/>\'\n'
    '  +\'<circle cx="\'+hx+\'" cy="\'+(hy+.8*k)+\'" r="\'+R+\'" fill="#000" fill-opacity=".18" style="filter:blur(\'+(1.5*k)+\'px)"/>\'\n'
    '  +\'<circle cx="\'+hx+\'" cy="\'+hy+\'" r="\'+R+\'" fill="#111"/>\'\n'
    '  +\'<path d="\'+ar(a0,a1)+" "+ar(b0,b1)+\'" fill="none" stroke="#fff" stroke-width="\'+sw+\'" stroke-linecap="round"/>\'\n'
    '  +\'<polygon points="\'+hd(a1,1)+\'" fill="#fff"/><polygon points="\'+hd(b1,1)+\'" fill="#fff"/>\'\n'
    '  +(on?\'<g style="pointer-events:none"><rect x="\'+(hx-22*k)+\'" y="\'+(hy-R-26*k)+\'" width="\'+(44*k)+\'" height="\'+(18*k)+\'" rx="\'+(9*k)+\'" fill="#111"/><text x="\'+hx+\'" y="\'+(hy-R-13.2*k)+\'" text-anchor="middle" style="font-size:\'+(11*k)+\'px;font-weight:700;fill:#fff;letter-spacing:.02em">\'+pc.r+\'°</text></g>\':\'\')+\'</g>\'}\n'
) + s[b:]

# ---------- 操作パッド ----------
rep('<div id="tov" hidden>',
    '<div id="mpad" class="mpad" hidden aria-label="選んだ家具を動かす">'
    '<button class="mpr" data-r="-1" aria-label="左に回す"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/></svg></button>'
    '<div class="mpj" id="mpj"><button class="mpa u" data-dx="0" data-dy="-1" aria-label="上へ"></button><button class="mpa r" data-dx="1" data-dy="0" aria-label="右へ"></button>'
    '<button class="mpa d" data-dx="0" data-dy="1" aria-label="下へ"></button><button class="mpa l" data-dx="-1" data-dy="0" aria-label="左へ"></button><span class="mpk" id="mpk"></span></div>'
    '<button class="mpr" data-r="1" aria-label="右に回す"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/></svg></button>'
    '</div>\n<div id="tov" hidden>')
rep('<div class="setg"><b>使い方</b>',
    '<div class="setg"><b>操作パッドの位置</b><div class="seg" id="padseg"><button data-pad="r">右手</button><button data-pad="l">左手</button><button data-pad="off">表示しない</button></div>'
    '<small class="lead" style="display:block;margin-top:6px;font-size:.72rem">平面図で家具を選ぶと、画面の下に移動・回転のパッドが出ます。小さい家具も動かしやすくなります。</small></div>\n'
    '<div class="setg"><b>使い方</b>')
rep('.roth{cursor:grab;touch-action:none}.roth.on{cursor:grabbing}',
    '.roth{cursor:grab;touch-action:none}.roth.on{cursor:grabbing}\n'
    '.mpad{position:fixed;bottom:calc(70px + env(safe-area-inset-bottom,0px));right:12px;z-index:25;display:flex;align-items:center;gap:8px;padding:8px;border-radius:999px;background:rgba(255,255,255,.82);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);box-shadow:0 6px 24px rgba(0,0,0,.14),0 0 0 1px rgba(0,0,0,.05);touch-action:none;user-select:none;-webkit-user-select:none}\n'
    '.mpad[hidden]{display:none}.mpad.left{right:auto;left:12px;flex-direction:row-reverse}\n'
    '.mpr{width:40px;height:40px;min-height:0;padding:0;border-radius:50%;border:0;background:#fff;color:#111;display:grid;place-items:center;box-shadow:0 1px 3px rgba(0,0,0,.12)}\n'
    '.mpr:active{background:#111;color:#fff}\n'
    '.mpj{position:relative;width:112px;height:112px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#fff,#f1f0ee);box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}\n'
    '.mpa{position:absolute;width:36px;height:36px;min-height:0;padding:0;border:0;background:transparent;color:#111}\n'
    '.mpa:before{content:"";position:absolute;left:50%;top:50%;width:9px;height:9px;border-top:2px solid currentColor;border-left:2px solid currentColor;transform:translate(-50%,-30%) rotate(45deg)}\n'
    '.mpa.u{left:38px;top:2px}.mpa.d{left:38px;bottom:2px}.mpa.d:before{transform:translate(-50%,-70%) rotate(225deg)}\n'
    '.mpa.l{left:2px;top:38px}.mpa.l:before{transform:translate(-30%,-50%) rotate(-45deg)}.mpa.r{right:2px;top:38px}.mpa.r:before{transform:translate(-70%,-50%) rotate(135deg)}\n'
    '.mpa:active{color:#888}\n'
    '.mpk{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:#111;box-shadow:0 3px 10px rgba(0,0,0,.28);transition:transform .15s}\n'
    '.mpk.on{transition:none}')
rep('/* 起動時は「部屋」を開く */',
    '/* ===== 操作パッド（平面図で選んだ家具を動かす・回す） ===== */\n'
    'var MPAD={side:"r",raf:0,v:[0,0],rep:0};\n'
    '(function(){try{MPAD.side=localStorage.getItem("bimini-pad")||"r"}catch(e){}})();\n'
    'function mpadTarget(){return plan.p[sel]||plan.hm[selH]||plan.cols[selC]||null}\n'
    'function mpadUI(){var p=document.getElementById("mpad");if(!p)return;var on=MPAD.side!=="off"&&!document.getElementById("v2").hidden&&!!mpadTarget()&&!VIEW&&document.getElementById("stm").hidden;p.hidden=!on;p.classList.toggle("left",MPAD.side==="l");\n'
    ' [].forEach.call(p.querySelectorAll(".mpr"),function(b){b.hidden=!plan.p[sel]});\n'
    ' [].forEach.call(document.querySelectorAll("#padseg [data-pad]"),function(b){b.className=b.getAttribute("data-pad")===MPAD.side?"on":""})}\n'
    'function mpadMove(dx,dy){var o=mpadTarget();if(!o)return;var bd=bnd();o.x=Math.round(o.x+dx);o.y=Math.round(o.y+dy);if(plan.p[sel]===o)clampPc(o);else{o.x=Math.max(bd.x0,Math.min(bd.x1,o.x));o.y=Math.max(bd.y0,Math.min(bd.y1,o.y))}rplan()}\n'
    '(function(){var p=document.getElementById("mpad"),k=document.getElementById("mpk"),j=document.getElementById("mpj");if(!p)return;\n'
    ' var _rp=rplan;rplan=function(){_rp.apply(this,arguments);mpadUI()};var _t=tab;tab=function(n){_t(n);mpadUI()};\n'
    ' document.getElementById("padseg").addEventListener("click",function(e){var b=e.target.closest("[data-pad]");if(!b)return;MPAD.side=b.getAttribute("data-pad");try{localStorage.setItem("bimini-pad",MPAD.side)}catch(x){}mpadUI()});\n'
    ' /* 矢印：タップで1cm、押し続けると速くなる */\n'
    ' p.addEventListener("pointerdown",function(e){var a=e.target.closest(".mpa"),r=e.target.closest(".mpr");if(!a&&!r)return;e.preventDefault();var n=0;\n'
    '  var step=function(){n++;if(a){var d=n<6?10:n<20?30:60;mpadMove(+a.getAttribute("data-dx")*d,+a.getAttribute("data-dy")*d)}else{var pc=plan.p[sel];if(!pc)return;pc.r=rotSnap(pc.r+ +r.getAttribute("data-r")*(n<4?15:5));if(n<4)pc.r=Math.round(pc.r/15)*15%360;clampPc(pc);rplan()}};\n'
    '  step();clearInterval(MPAD.rep);var t0=setTimeout(function(){MPAD.rep=setInterval(step,70)},380);\n'
    '  var up=function(){clearTimeout(t0);clearInterval(MPAD.rep);document.removeEventListener("pointerup",up);document.removeEventListener("pointercancel",up);psave();after3d()};document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up)});\n'
    ' /* 真ん中のつまみ：ドラッグした方向へ、離した距離に応じた速さで動く */\n'
    ' k.addEventListener("pointerdown",function(e){e.preventDefault();e.stopPropagation();var r=j.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,mx=r.width*.32;k.classList.add("on");try{k.setPointerCapture(e.pointerId)}catch(x){}\n'
    '  var last=performance.now(),acc=[0,0];\n'
    '  var mv=function(ev){var dx=ev.clientX-cx,dy=ev.clientY-cy,L=Math.hypot(dx,dy);if(L>mx){dx*=mx/L;dy*=mx/L}k.style.transform="translate("+dx+"px,"+dy+"px)";MPAD.v=[dx/mx,dy/mx]};\n'
    '  var loop=function(t){var dt=Math.min(.05,(t-last)/1000);last=t;var sp=900;acc[0]+=MPAD.v[0]*Math.abs(MPAD.v[0])*sp*dt;acc[1]+=MPAD.v[1]*Math.abs(MPAD.v[1])*sp*dt;\n'
    '   var ix=Math.trunc(acc[0]/5)*5,iy=Math.trunc(acc[1]/5)*5;if(ix||iy){acc[0]-=ix;acc[1]-=iy;mpadMove(ix,iy)}MPAD.raf=requestAnimationFrame(loop)};\n'
    '  var up=function(){cancelAnimationFrame(MPAD.raf);MPAD.v=[0,0];k.classList.remove("on");k.style.transform="";k.removeEventListener("pointermove",mv);k.removeEventListener("pointerup",up);k.removeEventListener("pointercancel",up);psave();after3d()};\n'
    '  k.addEventListener("pointermove",mv);k.addEventListener("pointerup",up);k.addEventListener("pointercancel",up);mv(e);MPAD.raf=requestAnimationFrame(loop)})})();\n'
    '/* 起動時は「部屋」を開く */')
open(P, "w", encoding="utf-8").write(s); print("p9 OK")
