"""p6b: 色の扱い（sRGB）を各レンダラーに確実に効かせる（r128 は render がインスタンスごとの関数のため）。"""
import os, re, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
old = ('(function(){if(typeof THREE==="undefined"||THREE.WebGLRenderer.prototype._linp)return;var R=THREE.WebGLRenderer.prototype.render;THREE.WebGLRenderer.prototype._linp=1;\n'
       ' THREE.WebGLRenderer.prototype.render=function(sc,cam){if(this.outputEncoding!==THREE.sRGBEncoding)this.outputEncoding=THREE.sRGBEncoding;if(sc&&sc.isScene)linMats(sc);return R.call(this,sc,cam)}})();')
assert s.count(old) == 1
s = s.replace(old, 'function linR(r){if(!r||r._linp)return r;var R=r.render;r._linp=1;r.outputEncoding=THREE.sRGBEncoding;r.render=function(sc,cam){if(sc&&sc.isScene)linMats(sc);return R.call(this,sc,cam)};return r}')
s, n = re.subn(r'new THREE\.WebGLRenderer\((\{[^}]*\})\)', r'linR(new THREE.WebGLRenderer(\1))', s)
assert n == 5, n
open(P, "w", encoding="utf-8").write(s); print("p6b OK", n)
