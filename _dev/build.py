"""VIM Web版を、このリポジトリの中だけで組み立てるスクリプト。

使い方（リポジトリ直下で）:
    python3 _dev/build.py 3.0.0

- 元ファイル _dev/furniture-catalog.html から、公開用の index.html を作ります。
- sw.js のキャッシュ番号を引数のバージョンに合わせます（利用者が開き直すと最新版になります）。
- 古い build_web.py / build_netlify.py（/mnt/user-data 前提）は使わなくて大丈夫です。
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "_dev", "furniture-catalog.html")
VER = sys.argv[1] if len(sys.argv) > 1 else None
if not VER or not re.fullmatch(r"\d+\.\d+\.\d+", VER):
    sys.exit("バージョンを 3.0.0 の形で指定してください。")
SHORT = ".".join(VER.split(".")[:2])
THEME = "#141414"

s = open(SRC, encoding="utf-8").read()
s, n = re.subn(r"インテリア・売場プランナー　(v\d+|Web版 [\d.]+)", "インテリア・売場プランナー　Web版 " + SHORT, s, count=1)
assert n == 1, "版表示が見つかりません"

head = (
    '<meta name="description" content="置ける？ 通れる？ いくら？ が、その場でわかる。実寸で確かめるインテリア・売場プランナー">\n'
    '<script src="config.js"></script>\n'
    '<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="' + THEME + '">'
    '<link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" href="icon-192.png">\n'
    '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
    '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n'
)
assert s.count("<title>VIM</title>") == 1
s = s.replace("<title>VIM</title>", "<title>VIM</title>\n" + head)

reg = (
    '<script>if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost"||location.hostname==="127.0.0.1"))'
    '{navigator.serviceWorker.register("sw.js").then(function(r){r.addEventListener("updatefound",function(){var w=r.installing;'
    'if(w)w.addEventListener("statechange",function(){if(w.state==="activated"&&navigator.serviceWorker.controller){try{toast("アプリが最新版になりました")}catch(e){}}})})})'
    '.catch(function(){})}</script>\n</body></html>'
)
assert s.rstrip().endswith("</body></html>")
s = s.rstrip()[: -len("</body></html>")] + reg
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(s)

sw_path = os.path.join(ROOT, "sw.js")
sw = open(sw_path, encoding="utf-8").read()
sw, n = re.subn(r'const V="bimini-web-[\d.]+";', 'const V="bimini-web-' + VER + '";', sw)
assert n == 1, "sw.js の版番号が見つかりません"
open(sw_path, "w", encoding="utf-8").write(sw)

mf_path = os.path.join(ROOT, "manifest.webmanifest")
mf = json.load(open(mf_path, encoding="utf-8"))
mf["theme_color"] = THEME
mf["background_color"] = "#0a0a0a"
json.dump(mf, open(mf_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# 管理画面（/admin）の「変更の履歴」：git の記録から作る
import subprocess
try:
    out = subprocess.run(["git", "-C", ROOT, "log", "-n", "120", "--date=iso-strict", "--pretty=format:%h%x09%ad%x09%s"], capture_output=True, text=True).stdout
    log = [dict(zip(("c", "at", "t"), l.split("\t", 2))) for l in out.splitlines() if l.count("\t") >= 2]
except Exception:
    log = []
import datetime
json.dump({"version": VER, "built": datetime.datetime.now(datetime.timezone.utc).isoformat(), "log": log}, open(os.path.join(ROOT, "changelog.json"), "w", encoding="utf-8"), ensure_ascii=False)
print("index.html / sw.js / manifest.webmanifest を更新しました（" + VER + "）")
