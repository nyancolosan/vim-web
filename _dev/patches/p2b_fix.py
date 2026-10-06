"""p2b: 「渡す」の強調をリンク・QRコードに。"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
old='#shpdf{background:var(--acc);color:var(--accink);box-shadow:none}'
assert s.count(old)==1; s=s.replace(old,'#shpb{background:var(--acc);color:var(--accink);box-shadow:none}')
old='#shpdf svg,#shpdf small{color:var(--accink)}'
assert s.count(old)==1; s=s.replace(old,'#shpb svg,#shpb small{color:var(--accink)}')
open(P,"w",encoding="utf-8").write(s);print("p2b OK")
