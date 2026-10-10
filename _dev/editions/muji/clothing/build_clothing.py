"""衣服（MUJI STORE app の「衣服」。モック）を組み立てる。"""
import os
H = os.path.dirname(os.path.abspath(__file__))

def build():
    s = open(os.path.join(H, "clothing.src.html"), encoding="utf-8").read()
    return ('<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
            + s + '</body></html>')

if __name__ == "__main__":
    import sys
    open(sys.argv[1], "w", encoding="utf-8").write(build())
