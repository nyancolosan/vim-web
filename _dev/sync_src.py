"""_dev/src/*.js の中身を、元ファイルの目印（/*@@BEGIN 名前@@*/ 〜 /*@@END 名前@@*/）の間に差し込む。
使い方：python3 _dev/sync_src.py（そのあと build.py）"""
import os, re, sys
D = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(D, "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
for f in sorted(os.listdir(os.path.join(D, "src"))):
    if not f.endswith(".js"): continue
    name = f[:-3]; body = open(os.path.join(D, "src", f), encoding="utf-8").read().rstrip() + "\n"
    a, b = "/*@@BEGIN " + name + "@@*/\n", "/*@@END " + name + "@@*/"
    i, j = s.find(a), s.find(b)
    if i < 0 or j < 0: sys.exit("目印がありません: " + name)
    s = s[:i + len(a)] + body + s[j:]
    print("synced", name)
open(P, "w", encoding="utf-8").write(s)
