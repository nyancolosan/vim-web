"""Claude 上で動くベータ版（1ファイル）を作る：python3 _dev/make_beta.py 出力先.html
課金サーバー・サービスワーカー・アイコン類を外し、プランは「プラン」ボタンで自由に切り替え。"""
import re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
s = re.sub(r'<!DOCTYPE html>\s*<html[^>]*>\s*<head>', '', s, count=1, flags=re.I)
s = s.replace('<title>VIM</title>', '<title>VIM Beta</title>', 1)
s = s.replace('<script src="config.js"></script>', '<script>window.BIMINI_BILLING={api:"",price:"月額 1,480円（税込）",prices:{plus_m:"月額 480円（税込）",plus_y:"3,800円・月あたり約317円",plus_pass:"600円",pro:"月額 1,480円（税込）"},tokushoho:""};window.VIM_BETA=true;</script>', 1)
s = re.sub(r'<link rel="(manifest|apple-touch-icon|icon)"[^>]*>', '', s)
s = re.sub(r'<script>if\("serviceWorker" in navigator.*?</script>', '', s, count=1, flags=re.S)
s = s.replace('</head><body>', '', 1)
s = re.sub(r'</body>\s*</html>\s*$', '', s)
badge = '<style>.betatag{position:fixed;right:10px;bottom:calc(74px + env(safe-area-inset-bottom,0px));z-index:60;background:#141414;color:#fff;font:700 10px/1 -apple-system,"Hiragino Sans",sans-serif;letter-spacing:.12em;padding:5px 8px;border-radius:999px;opacity:.85;pointer-events:none}</style><div class="betatag" aria-hidden="true">BETA</div>'
s = s.replace('<main>', badge + '<main>', 1)
open(sys.argv[1], 'w', encoding='utf-8').write(s)
print("ok", len(s.encode()) // 1024, "KB")
