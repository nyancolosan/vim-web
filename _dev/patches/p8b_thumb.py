"""p8b: glTF のサムネイルが無いときは、手作りモデルのサムネイルで代わりに表示。"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
old=' TPLS.q=L.filter(function(e){return!e.m.glb&&!TPLS.c[e.id+"|"+e.m.name]});tplRun()}'
assert s.count(old)==1
s=s.replace(old,' TPLS.q=L.filter(function(e){return!e.m.glb&&!TPLS.c[e.id+"|"+e.m.name]});\n'
 ' L.filter(function(e){return e.m.glb}).forEach(function(e){var im=new Image();im.onerror=function(){TPLS.q.push(e);tplRun()};im.src="models/"+e.m.glb+"/thumb.png"});tplRun()}')
open(P,"w",encoding="utf-8").write(s);print("p8b OK")
