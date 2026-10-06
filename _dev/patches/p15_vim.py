"""p15: アプリ名を VIM に（文字の置きかえは一括で済み）。ロゴを画面・PDFに入れる。中身は src/vim.js"""
import os
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=os.path.join(D,"furniture-catalog.html")
s=open(P,encoding="utf-8").read()
def R(a,b):
    global s
    assert s.count(a)==1,a[:90]; s=s.replace(a,b)
R("/*@@END mat5@@*/\n","/*@@END mat5@@*/\n/*@@BEGIN vim@@*/\n/*@@END vim@@*/\n")
R('<h1><b>VIM</b>','<h1><b class="vlogo" data-vim role="img" aria-label="VIM"></b>')
R('<div class="m3h"><b id="stmt">','<div class="stmbrand"><span class="vlogo" data-vim role="img" aria-label="VIM"></span><small translate="no">Visual × Interior × Modeling</small></div>\n<div class="m3h"><b id="stmt">')
R('<small class="ver">','<div class="verlogo"><span class="vlogo" data-vim role="img" aria-label="VIM"></span><small translate="no">Visual × Interior × Modeling</small></div><small class="ver">')
R('function setTheme(t,c){c="#2b2b2b";','function setTheme(t,c){c="#141414";')
R('mono:"#2b2b2b"})[t]','mono:"#141414"})[t]')
# PDF：提案書の帯の右上、見積書の左上にロゴ
R('x.textAlign="right";x.font="bold 32px "+F;x.fillText("VIM",PW-60,56);fn(x);','x.textAlign="right";x.font="bold 32px "+F;if(!vimDraw(x,AI==="#111"?"#111111":"#ffffff",PW-60,56,56,"right"))x.fillText("VIM",PW-60,56);fn(x);')
R('if(pi===0){x.fillStyle="#111";x.textAlign="center";','if(pi===0){vimDraw(x,"#111111",80,72,58);x.fillStyle="#111";x.textAlign="center";')
R('x.fillText("VIM　"+(pi+1)+" / "+chunks.length,PW/2,PH-40)','x.fillText("VIM  Visual × Interior × Modeling　"+(pi+1)+" / "+chunks.length,PW/2,PH-40)')
# 見た目
R('h1 b{color:var(--logo);background:var(--logobg);font-weight:900;font-size:1.5rem;letter-spacing:.01em;display:inline-block;padding:0 6px;margin-left:-6px}',
  'h1 b{color:var(--logo);background:var(--logobg);font-weight:900;font-size:1.5rem;letter-spacing:.01em;display:inline-block;padding:0 6px;margin-left:-6px}\n'
  '.vlogo{display:inline-flex!important;align-items:center;gap:9px;vertical-align:middle;line-height:0}.vlogo svg{display:block;width:auto}.vlogo .vm{height:34px}.vlogo .vw{height:17px}h1 .vlogo{padding:4px 8px!important;margin-left:-8px!important;border-radius:6px}\n'
  '.stmbrand{display:flex;flex-direction:column;align-items:center;gap:6px;margin:2px 0 14px;color:#111}.stmbrand .vm{height:44px}.stmbrand .vw{height:21px}.stmbrand small{font-size:.66rem;letter-spacing:.14em;color:#6b6b6b}\n'
  '.verlogo{display:flex;flex-direction:column;align-items:center;gap:6px;margin:18px 0 8px;color:#111}.verlogo .vm{height:36px}.verlogo .vw{height:16px}.verlogo small{font-size:.62rem;letter-spacing:.14em;color:#8a8a8a}')
open(P,"w",encoding="utf-8").write(s);print("ok")
