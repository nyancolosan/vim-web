"""オーダーカーテン見積（idea の「オーダーカーテン見積」）を組み立てる。
build(embed=False) … 単体で開くページ
build(embed=True)  … idea の中で開くページ（ヘッダーに「戻る」）"""
import json, os
C = os.path.dirname(os.path.abspath(__file__))

EMBED_HEAD = '''<header class="hd">
  <button class="back" id="cu-back" type="button" aria-label="住空間のメニューに戻る"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>戻る</button>
  <span class="hdt"><b>オーダーカーテン見積</b><small>idea・住空間</small></span>
</header>'''
EMBED_CSS = '''.back{display:flex;align-items:center;gap:2px;border:1px solid var(--line);background:var(--card);color:var(--acc);border-radius:999px;min-height:40px;padding:0 14px 0 8px;font-weight:700;font-size:.85rem}
'''
EMBED_JS = '''
/* idea の中で開いたとき：戻る・準備できたことを知らせる */
(function(){var b=document.getElementById("cu-back");function tell(m){try{parent.postMessage({mj:m},"*")}catch(e){}}
 if(b)b.addEventListener("click",function(){tell("sub-close")});tell("sub-ready")})();
'''

def build(embed=False):
    s = open(os.path.join(C, "curtain.src.html"), encoding="utf-8").read()
    P = json.load(open(os.path.join(C, "parts.json"), encoding="utf-8"))
    if embed:
        a = s.index('<header class="hd">'); b = s.index('</header>', a) + len('</header>')
        s = s[:a] + EMBED_HEAD + s[b:]
        s = s.replace("</style>", EMBED_CSS + "</style>", 1)
        i = s.rindex('</script>'); s = s[:i] + EMBED_JS + s[i:]
    s = s.replace('%%VIMW%%', P["W"])
    assert '%%' not in s
    if embed:
        s = '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}html{-webkit-text-size-adjust:100%}</style></head><body>' + s + '</body></html>'
    return s

if __name__ == "__main__":
    import sys
    open(sys.argv[1], "w", encoding="utf-8").write(build(embed=len(sys.argv) > 2 and sys.argv[2] == "embed"))
