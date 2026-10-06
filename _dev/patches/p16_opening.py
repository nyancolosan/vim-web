"""p16: 起動時のオープニング（ロゴが組み上がる。1.9秒・タップで飛ばせる・同じタブでは1回だけ・動きを減らす設定では短く）"""
import os
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=os.path.join(D,"furniture-catalog.html")
s=open(P,encoding="utf-8").read()
SVG='''<svg viewBox="300 225 640 740" aria-hidden="true"><defs><linearGradient id="opf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9d6d2"/><stop offset="1" stop-color="#a9a49f"/></linearGradient><linearGradient id="opr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a39d98"/><stop offset="1" stop-color="#6f6965"/></linearGradient><radialGradient id="opg" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff3d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient></defs>
<path class="op-glow" d="M624 450 L470 700 L800 700 Z" fill="url(#opg)"/>
<path class="op-l" d="M380 372 L630 243 L630 258 L488 334 L488 690 L380 612 Z" fill="#fff"/>
<path class="op-f" d="M488 690 L640 560 L838 640 L622 742 Z" fill="url(#opf)"/>
<path class="op-r" d="M722 325 L868 390 L868 634 L722 580 Z" fill="url(#opr)"/>
<g class="op-lamp"><rect x="621" y="246" width="8" height="142" fill="#fff"/><path d="M569 442 A55 55 0 0 1 679 442 Z" fill="#fff"/></g>
<g class="op-w" fill="#fff"><path d="M330 688 H368 L438 842 L508 688 H546 L458 866 H418 Z"/><rect x="589" y="688" width="35" height="178"/><path d="M690 866 V688 H727 L800 808 L873 688 H910 V866 H876 V744 L813 846 H787 L724 744 V866 Z"/></g>
<text class="op-t" x="620" y="945" fill="#fff" font-family="-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif" font-size="40" letter-spacing="7" text-anchor="middle">Visual × Interior × Modeling</text></svg>'''
HTML='<div id="opening" translate="no" aria-hidden="true">'+SVG+'</div><script>(function(){var o=document.getElementById("opening"),seen=false;try{seen=sessionStorage.getItem("vim-op")==="1";sessionStorage.setItem("vim-op","1")}catch(e){}'\
 'if(seen||/[?&]cview=|#b=/.test(location.href)){o.parentNode.removeChild(o);return}'\
 'var rm=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches,T=rm?500:1900,done=false;'\
 'function end(){if(done)return;done=true;o.classList.add("op-out");setTimeout(function(){if(o.parentNode)o.parentNode.removeChild(o)},450)}'\
 'if(rm)o.classList.add("op-rm");o.addEventListener("pointerdown",end);setTimeout(end,T)})();</script>'
assert s.count("</style></head><body><main>")==1
s=s.replace("</style></head><body><main>","""#opening{position:fixed;inset:0;z-index:9999;background:#0a0a0a;display:flex;align-items:center;justify-content:center;transition:opacity .45s ease,visibility .45s}
#opening svg{width:min(56vw,300px);height:auto;overflow:visible}#opening.op-out{opacity:0;visibility:hidden}
#opening .op-l,#opening .op-f,#opening .op-r,#opening .op-lamp,#opening .op-w,#opening .op-t,#opening .op-glow{opacity:0;transform-box:fill-box}
#opening .op-l{transform-origin:100% 50%;animation:opIn .55s cubic-bezier(.2,.8,.2,1) .05s forwards,opSlideL .55s cubic-bezier(.2,.8,.2,1) .05s backwards}
#opening .op-r{transform-origin:0 50%;animation:opIn .55s cubic-bezier(.2,.8,.2,1) .2s forwards,opSlideR .55s cubic-bezier(.2,.8,.2,1) .2s backwards}
#opening .op-f{transform-origin:50% 0;animation:opIn .5s ease .35s forwards,opRise .5s cubic-bezier(.2,.8,.2,1) .35s backwards}
#opening .op-lamp{transform-origin:50% 0;animation:opIn .3s ease .55s forwards,opDrop .5s cubic-bezier(.3,1.4,.5,1) .55s backwards}
#opening .op-glow{animation:opGlow .7s ease .9s forwards}
#opening .op-w{animation:opIn .5s ease 1s forwards,opUp .5s cubic-bezier(.2,.8,.2,1) 1s backwards}
#opening .op-t{animation:opIn .5s ease 1.25s forwards}
#opening.op-rm *{animation:none!important;opacity:1!important}#opening.op-rm .op-glow{opacity:.6!important}
@keyframes opIn{to{opacity:1}}@keyframes opGlow{0%{opacity:0}40%{opacity:1}100%{opacity:.6}}
@keyframes opSlideL{from{transform:translateX(-14%)}}@keyframes opSlideR{from{transform:translateX(14%)}}@keyframes opRise{from{transform:translateY(18%) scaleY(.6)}}
@keyframes opDrop{from{transform:translateY(-40%)}}@keyframes opUp{from{transform:translateY(16%)}}
</style></head><body>"""+HTML+"<main>")
open(P,"w",encoding="utf-8").write(s);print("ok")
