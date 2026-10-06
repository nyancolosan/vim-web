"""i18n-dict.json（日本語 → [英語, 韓国語]）から src/i18nd.js を作る。
訳を直すときは i18n-dict.json を直して：python3 _dev/i18n_build.py && python3 _dev/sync_src.py"""
import json, os
D0 = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(D0, "i18n-dict.json"), encoding="utf-8"))
OV = {"渡す": ["Share", "공유"], "解除": ["Deselect", "선택 해제"], "寄る": ["Zoom", "확대"], "様": ["", "님"], "人": ["People", "사람"],
      "・": [" · ", " · "], "mm・": ["mm · ", "mm · "], "mm・梁成": ["mm · beam depth ", "mm · 보 춤 "],
      "mm・葉張り": ["mm · leaf spread ", "mm · 잎 폭 "], "mm・鉢径": ["mm · pot dia. ", "mm · 화분 지름 "]}
D.update(OV)
def un(s): return s.replace("\\n", "\n").replace("\\'", "'").replace('\\"', '"')
out = {}
for k, v in D.items():
    out[un(k)] = [un(v[0]), un(v[1])]
js = "/* 自動生成：_dev/i18n_build.py（元は _dev/i18n-dict.json） */\nvar I18ND=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
open(os.path.join(D0, "src", "i18nd.js"), "w", encoding="utf-8").write(js)
print(len(out), "entries,", len(js.encode()), "bytes")
