"""p2: 「渡す」画面の集約、部屋画面の並び、無料プランの上限（保存数・案の比較・画像の透かし）。"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)

# ---------- 部屋：平面図を上に、「家具を置く」と置いた家具はその下 ----------
blk = ('<button id="plb" class="pri plb" data-ic="plus"><span class="lb">家具を置く</span></button>\n'
       '<div class="sect" id="chipst">置いた家具<small>押すと、もう1つ部屋の中央に置きます（右下＝置いた数／数量）</small></div>\n<div class="chips" id="chips"></div>\n')
rep(blk, '')
rep('<p class="lead" id="ptot" style="margin:4px 0 0;color:var(--acc);font-weight:700"></p>\n',
    '<p class="lead" id="ptot" style="margin:4px 0 0;color:var(--acc);font-weight:700"></p>\n' + blk)
# 「広さ・形」は自動で開かない（はじめの画面で選ぶため）
rep('if(n===2&&!tab.rf){tab.rf=1;var rf=document.getElementById("roomf");if(rf&&plan&&!(plan.p||[]).length)rf.open=true}', '')

# ---------- 家具を選ぶ：room はソファ、vmd は什器から ----------
rep(' if(G.indexOf(TPLS.g)<0)TPLS.g=G[0];q("tplc")',
    ' var dg=store()?"什器":"ソファ";if(tplOpen.k!==dg){tplOpen.k=dg;TPLS.g=dg}if(G.indexOf(TPLS.g)<0)TPLS.g=G[0];q("tplc")')

# ---------- 渡す ----------
a = s.index('<div id="v5" hidden>')
b = s.index('<div id="imp" class="mdl"')
s = s[:a] + '''<div id="v5" hidden>
<p class="lead">家族やお客さまに渡す・手元に残すための画面です。</p>
<label style="display:block;margin-bottom:12px">タイトル（PDFの表紙に入ります）<input type="text" id="bt" placeholder="例：リビング案A"></label>
<div class="tiles shmain">
<button class="tile" id="shpb" data-ic="grid"><b class="lb">リンク・QRコード</b><small>スマホで3D・図面・金額を見られます</small></button>
<button class="tile" id="shest" data-ic="clip"><b class="lb">お見積り<i class="ptag tp">Pro</i></b><small>見積書PDF・共有・QRコード</small></button>
<button class="tile" id="shpdf" data-ic="pdf"><b class="lb"><span class="biz-only">提案書PDF</span><span class="gen-only">プランをPDFに</span></b><small>表紙・3D・平面図・家具・金額</small></button>
<button class="tile" id="shpt" data-ic="camera"><b class="lb">きれいな画像</b><small>光の反射まで計算した1枚</small></button>
</div>
<p class="lead" id="shm" style="margin-top:10px"></p>
<details class="fold"><summary>その他の書き出し</summary>
<div class="tiles">
<button class="tile" id="shelv" data-ic="plan"><b class="lb">展開図（4面）</b><small>壁ごとの立面図を1枚に</small></button>
<button class="tile" id="shb" data-ic="image"><b class="lb">まとめ画像</b><small>3D・平面図・家具を1枚に</small></button>
</div>
<div class="icobar" style="margin-top:10px"><button id="sh3" class="ib" data-ic="cube">3D下絵</button><button id="shp" class="ib" data-ic="plan">平面図</button><button id="shc" class="ib" data-ic="grid">家具一覧</button><button id="sht" class="ib" data-ic="text">指示文</button></div>
</details>
<details class="fold"><summary>画像生成AIに渡す（上級）</summary>
<p class="lead" style="font-size:.76rem;margin:0 0 8px">ほかの画像生成AIで、写真のようなパースに仕上げるための素材です。生成された画像は家具の形や寸法が変わることがあるため、お客さまへの提示には「きれいな画像」をおすすめします。</p>
<button id="genb" class="aibtn genbtn" data-ic="spark"><b class="lb">画像生成AIで仕上げる</b><small>画像を保存→指示文をコピーして、選んだAIを開きます</small></button>
<div class="tiles">
<button class="tile" id="shz" data-ic="zip"><b class="lb">AIセット（ZIP）</b><small>画像3枚と指示文</small></button>
<button class="tile" id="shs" data-ic="share"><b class="lb">共有シートで送る</b><small>AIアプリへ直接</small></button>
<button class="tile" id="shcp" data-ic="clip"><b class="lb">指示文をコピー</b><small>AIに貼り付ける文章</small></button>
</div>
<label style="display:block;margin:10px 0 6px">雰囲気<select id="sty" style="width:100%"><option>ナチュラル</option><option>北欧</option><option>モダン</option><option>ミッドセンチュリー</option><option>和モダン</option></select></label><p class="lead">画像A・B・Cを添付し、この文を貼り付けて送ります。</p>
<textarea id="pr2" rows="10" class="ta"></textarea>
<div class="row" style="margin-top:8px"><button id="shr">指示文を作り直す</button></div>
</details>
</div>
''' + s[b:]
rep('.est-t{grid-template-columns:repeat(2,minmax(0,1fr))!important}',
    '.est-t{grid-template-columns:repeat(2,minmax(0,1fr))!important}\n.shmain #shpb{background:var(--acc);border-color:var(--acc);color:var(--accink)}.shmain #shpb small{color:inherit;opacity:.8}.shmain #shpb svg{color:inherit}')
rep(' q("shest").onclick=estOpen', ' q("shest").onclick=function(){if(!isBiz()){needPlan("pro","お見積り（PDF・お客さま用QR）はProプランで使えます。");return}estOpen()}')
rep(' if(q("ptb"))q("ptb").onclick=open;', ' if(q("ptb"))q("ptb").onclick=open;if(q("shpt"))q("shpt").onclick=function(){tab(3);setTimeout(open,700)};')
rep('{t:5,s:"#v5 .tiles",', '{t:5,s:"#v5 .shmain",')

# ---------- 無料プラン：高品位画像は透かし入り ----------
rep('  toBlob(cv).then(function(b){if(!DL){var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="3d-photo.png";',
    '  toBlob(wmark(cv)).then(function(b){try{ev("export",{k:"photo"})}catch(x){}if(!DL){var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="3d-photo.png";')
rep('/* ===== AIと話して3Dモデルをつくる（PRO・β・Claude版） ===== */',
    '/* 無料プランの高品位画像には小さな透かしを入れる（Plus以上はなし） */\n'
    'function wmark(cv){if(isPro())return cv;var c=document.createElement("canvas");c.width=cv.width;c.height=cv.height;var x=c.getContext("2d");x.drawImage(cv,0,0);\n'
    ' var f=Math.max(14,Math.round(c.width/48));x.font="700 "+f+"px sans-serif";x.textAlign="right";x.textBaseline="bottom";x.fillStyle="rgba(255,255,255,.75)";x.strokeStyle="rgba(0,0,0,.25)";x.lineWidth=Math.max(1,f/10);\n'
    ' var t="BIMini Free";x.strokeText(t,c.width-f*.8,c.height-f*.6);x.fillText(t,c.width-f*.8,c.height-f*.6);return c}\n'
    '/* ===== AIと話して3Dモデルをつくる（PRO・β・Claude版） ===== */')
rep('<p class="lead" style="font-size:.76rem;margin:8px 0 0">光が壁や床に当たって跳ね返る様子まで計算するので、',
    '<p class="lead gen-free" style="font-size:.76rem;margin:8px 0 0">無料プランでは右下に小さな透かしが入ります（Plus以上はなし）。</p><p class="lead" style="font-size:.76rem;margin:8px 0 0">光が壁や床に当たって跳ね返る様子まで計算するので、')
rep('.pc-only{display:none}', 'body.pro .gen-free{display:none}\n.pc-only{display:none}')

# ---------- 無料プラン：名前をつけて保存は1つまで（控えは数えない） ----------
rep(' var same=pjRows.filter(function(r){return r.name===n})[0];\n',
    ' var same=pjRows.filter(function(r){return r.name===n})[0];\n'
    ' if(!same&&!isPro()&&pjRows.filter(function(r){return!/^控え /.test(r.name||"")}).length>=1){needPlan("plus","無料プランで名前をつけて保存できるのは1つまでです。Plusなら無制限に保存して、案を比べられます。");return}\n')
rep('  return busy(b,function(){return pjWrite(same,n)}).then(function(){inp.value="";toast("「"+n+"」を保存しました。");rproj()},pjFail)})};',
    '  return busy(b,function(){return pjWrite(same,n)}).then(function(){inp.value="";toast("「"+n+"」を保存しました。");try{ev("save",{n:pjRows.length+1})}catch(x){}rproj()},pjFail)})};')

# ---------- 無料プラン：案を比べるは1回だけお試し ----------
rep('document.getElementById("cmpg").onclick=function(){var b=this,',
    'document.getElementById("cmpg").onclick=function(){if(!isPro()){var u=0;try{u=+localStorage.getItem("bimini-cmp1")||0}catch(e){}if(u>=1){needPlan("plus","案を比べるのはPlusプランの機能です（無料プランは1回お試しできます）。");return}try{localStorage.setItem("bimini-cmp1",String(u+1))}catch(e){}}try{ev("compare")}catch(e){}var b=this,')
rep('<p class="lead">保存した案どうし、または「いまの内容」と並べて、3D・平面図・金額を見比べます。</p>',
    '<p class="lead">保存した案どうし、または「いまの内容」と並べて、3D・平面図・金額を見比べます。<span class="gen-free">無料プランでは1回お試しできます。</span></p>')

open(P, "w", encoding="utf-8").write(s); print("p2 OK")
