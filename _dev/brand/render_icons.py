"""ロゴの SVG（_dev/brand）からアプリのアイコン PNG を作る：python3 _dev/brand/render_icons.py"""
import os
from playwright.sync_api import sync_playwright
from PIL import Image
B=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(B))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":1024,"height":1024})
    pg.set_content('<body style="margin:0;background:#0a0a0a">'+open(os.path.join(B,'icon.svg')).read()+'</body>');pg.screenshot(path=os.path.join(B,'icon-1024.png'));b.close()
im=Image.open(os.path.join(B,'icon-1024.png')).convert('RGB')
for s in (180,192,512):im.resize((s,s),Image.LANCZOS).save(os.path.join(ROOT,"vim-icon-%d.png"%s))
print("ok")
