"""衣服（MUJI STORE app の「衣服」。データは clothing.json＝ネットストアから）を組み立てる。"""
import os
H = os.path.dirname(os.path.abspath(__file__))

def build():
    s = open(os.path.join(H, "clothing.src.html"), encoding="utf-8").read()
    d = open(os.path.join(H, "clothing.json"), encoding="utf-8").read()
    s = s.replace("/*%%CLOTHING%%*/null", d, 1)
    assert "%%" not in s
    return ('<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
            + s + '</body></html>')

if __name__ == "__main__":
    import sys
    open(sys.argv[1], "w", encoding="utf-8").write(build())
