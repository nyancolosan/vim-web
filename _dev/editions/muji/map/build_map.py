"""店舗マップ（β版・AM川口のみ）を組み立てる。区画は zones.json（図面を読み取って区画分け）、図面画像は plan.jpg。"""
import os, json, base64
H = os.path.dirname(os.path.abspath(__file__))

def build():
    s = open(os.path.join(H, "map.src.html"), encoding="utf-8").read()
    z = open(os.path.join(H, "zones.json"), encoding="utf-8").read()
    img = "data:image/jpeg;base64," + base64.b64encode(open(os.path.join(H, "plan.jpg"), "rb").read()).decode()
    s = s.replace("/*%%ZONES%%*/null", z, 1).replace("%%PLAN%%", img, 1)
    assert "%%" not in s
    return ('<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
            + s + '</body></html>')

if __name__ == "__main__":
    import sys
    open(sys.argv[1], "w", encoding="utf-8").write(build())
