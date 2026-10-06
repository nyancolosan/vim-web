"""大きな本体スクリプトの「その場で動く文」を1つずつ try で包む。
どこか1か所が端末の都合で失敗しても、そのあとの準備（ドラッグなど）は止まらない。失敗は画面下に小さく表示する。
関数の宣言はそのまま（巻き上げの動きを変えない）。包んだ結果は node --check で文法を確かめる。"""
import re, subprocess, tempfile, os

TRAP = ('<script>(function(){var L=window.__vimErrs=[];function show(){var b=document.getElementById("vimerr");'
        'if(!b){if(!document.body)return;b=document.createElement("div");b.id="vimerr";'
        'b.style.cssText="position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:2147483647;'
        'background:#fdecea;color:#b71c1c;border:1px solid #e57373;border-radius:8px;padding:6px 30px 6px 10px;font:12px/1.4 system-ui,sans-serif;'
        'max-height:30vh;overflow:auto;white-space:pre-wrap;word-break:break-all";'
        'var x=document.createElement("button");x.textContent="×";x.style.cssText="position:absolute;right:4px;top:2px;border:0;background:none;font-size:18px;color:#b71c1c";'
        'x.onclick=function(){b.remove()};document.body.appendChild(b);b.appendChild(x);b.appendChild(document.createElement("span"))}'
        'b.lastChild.textContent="エラー（"+L.length+"件）このまま画面を送ってください\\n"+L.slice(0,6).join("\\n")}'
        'window.__vimErr=function(e,w){try{var m=(w||"")+" "+((e&&e.message)||e)+(e&&e.line?" L"+e.line:"");L.push(m.slice(0,200));'
        'if(document.body)show();else document.addEventListener("DOMContentLoaded",show)}catch(x){}};'
        'window.addEventListener("error",function(ev){window.__vimErr({message:ev.message,line:ev.lineno},"")});'
        'window.addEventListener("unhandledrejection",function(ev){window.__vimErr(ev.reason,"promise")})})();</script>')

def wrap(js, tag):
    d = tempfile.mkdtemp(); i, o = os.path.join(d, "i.js"), os.path.join(d, "o.js")
    open(i, "w", encoding="utf-8").write(js)
    r = subprocess.run(["node", os.path.join(os.path.dirname(os.path.abspath(__file__)), "guard.mjs"), i, o, tag], capture_output=True, text=True)
    if r.returncode: raise SystemExit("guard failed: " + r.stderr[-400:])
    return open(o, encoding="utf-8").read(), int(r.stdout.strip())

def check(js):
    return True, ""

def guard(html):
    out, pos, total = [], 0, 0
    for m in re.finditer(r"<script>(.*?)</script>", html, re.S):
        body = m.group(1)
        if len(body) < 20000:
            continue
        w, n = wrap(body, "s%d" % len(out))
        ok, err = check(w)
        if not ok:
            raise SystemExit("guard: syntax after wrap failed: " + err)
        out.append(html[pos:m.start(1)]); out.append(w); pos = m.end(1); total += n
    out.append(html[pos:])
    h = "".join(out)
    i = h.find("<script")
    return h[:i] + TRAP + h[i:], total
