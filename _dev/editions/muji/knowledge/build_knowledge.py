"""素材知識（POAD の「素材知識」）を組み立てる。カーテン生地の説明は curtain.src.html のデータをそのまま使う。"""
import os, re
K = os.path.dirname(os.path.abspath(__file__)); C = os.path.join(os.path.dirname(K), "curtain")

def build():
    s = open(os.path.join(K, "knowledge.src.html"), encoding="utf-8").read()
    c = open(os.path.join(C, "curtain.src.html"), encoding="utf-8").read()
    f = re.search(r"var F=\[.*?\n\];", c, re.S).group(0)
    sw = re.search(r"var SW=\{.*?\};", c, re.S).group(0)
    info = c[c.index("var MOODS="):c.index("function moodsOf")]
    data = "(function(){" + sw + "\n" + info + "\n" + f + "\nwindow.CU={F:F,INFO:INFO,MOODS:MOODS,SW:SW}})();"
    s = s.replace("/* %%CURTAIN_DATA%% */", data, 1)
    return ('<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
            + s + '</body></html>')

if __name__ == "__main__":
    import sys
    open(sys.argv[1], "w", encoding="utf-8").write(build())
