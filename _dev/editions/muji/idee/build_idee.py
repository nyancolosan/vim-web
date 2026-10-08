"""IDEE（idea の住空間「IDEE」）を組み立てる。データは idee.json（無印良品ネットストアのIDEE売場と各商品ページから）。"""
import json, os
K = os.path.dirname(os.path.abspath(__file__))

def build():
    s = open(os.path.join(K, "idee.src.html"), encoding="utf-8").read()
    d = json.load(open(os.path.join(K, "idee.json"), encoding="utf-8"))
    s = s.replace("/* %%IDEE%% */ null", json.dumps(d, ensure_ascii=False, separators=(",", ":")), 1)
    assert "%%" not in s
    return ('<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
            + s + '</body></html>')

if __name__ == "__main__":
    import sys
    open(sys.argv[1], "w", encoding="utf-8").write(build())
