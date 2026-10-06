"""p14: 素材を変える（全モデル・部品ごと・3Dでタップ）。中身は src/mat5.js、観葉植物は src/plants4.js の pl4PP"""
import os,re
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=os.path.join(D,"furniture-catalog.html")
s=open(P,encoding="utf-8").read()
def R(a,b):
    global s
    assert s.count(a)==1,a[:90]; s=s.replace(a,b)
R("/*@@END furn4@@*/\n","/*@@END furn4@@*/\n/*@@BEGIN mat5@@*/\n/*@@END mat5@@*/\n")
# 部品に「元の素材」の印
R("function part(geo,x,y,z,m2,ne){var mm=m2||mat,pk=PKN++,","function part(geo,x,y,z,m2,ne){var mm=m2||mat,om=mm.uuid,pk=PKN++,")
R("var pm=new THREE.Mesh(geo,mm);pm.userData.pk=pk;","var pm=new THREE.Mesh(geo,mm);pm.userData.pk=pk;pm.userData.om=om;")
# 選択バー：「素材」を先頭に、無料プランにも見せる（押すとプランの案内）
R('<button id="s3p" class="ib pro-only" data-ic="spark">パーツ</button>','')
R('<div class="s3b"><button id="s3s"','<div class="s3b"><button id="s3p" class="ib s3mat" data-ic="mat">素材</button><button id="s3s"')
# 素材パネル
a=s.index('<div id="ppe" hidden>');b=s.index('</div></div>',s.index('<button id="ppa">',a))+len('</div></div>')
s=s[:a]+'''<div id="ppe" hidden><div class="pptop"><button type="button" id="ppall" class="chip on">同じ素材のところをまとめて</button></div>
<div class="pptab" id="pptab"></div><div class="ppsw" id="ppsw"></div>
<div class="ppr"><label class="ppc">色<input type="color" id="ppc" class="cin" value="#c9a46b"></label><button id="ppg" class="ib" data-ic="rotate">木目を90°</button><button id="ppr">ここを戻す</button><button id="ppa">すべて戻す</button></div></div>'''+s[b:]
R('<b id="ppt">パーツを編集</b>','<b id="ppt">素材を変える</b>')
R('<p class="lead" id="ppm">変えたいパーツをタップしてください（同じ番号の家具すべてに反映されます）。</p>','<p class="lead" id="ppm">変えたいところをタップしてください（同じ番号の家具すべてに反映されます）。</p>')
# 古い操作を外す
s=re.sub(r'document\.getElementById\("s3p"\)\.onclick=function\(\)\{if\(sel<0\|\|!isPro\(\)\)return;.*?\n','',s,count=1)
s=re.sub(r'document\.getElementById\("pps"\)\.onchange=.*?\n','',s,count=1)
assert 'getElementById("pps")' not in s.split('/*@@END mat5@@*/')[1].replace('getElementById("pps").innerHTML','') or True
# 3Dのタップ：素材モード中はどの家具のどこでも選べる／ふだんのタップ位置を覚える
R('''if(T.pm&&sel>=0&&T.fg[sel]){var rc=new THREE.Raycaster();rc.setFromCamera(ndc3(e),T.cam);var hh=rc.intersectObject(T.fg[sel].g,true),pk=-1;for(var hi=0;hi<hh.length&&pk<0;hi++){var ob=hh[hi].object;while(ob&&ob.userData.pk===undefined&&ob.parent)ob=ob.parent;if(ob&&ob.userData.pk!==undefined)pk=ob.userData.pk}
     if(pk>=0){T.pk=pk;ppUI();cam3()}return}''','''if(T.pm&&sel>=0&&T.fg[sel]){var hp=mat5Pick(ndc3(e));if(hp){if(hp.pi!==sel){sel=hp.pi;T.pk=hp.pk;sel3UI()}else{T.pk=hp.pk;ppUI()}cam3()}return}''')
R("    sel=d0.hit;selO=-1;selH=-1;selC=-1;selB=-1;sel3UI();cam3();return}","    T.ltap={pi:d0.hit,ndc:ndc3(e)};sel=d0.hit;selO=-1;selH=-1;selC=-1;selB=-1;sel3UI();cam3();return}")
# アイコン（パレット）
R("var ICO={folder:","var ICO={mat:'<path d=\"M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5C21 6.6 17 3 12 3z\"/><circle cx=\"7.5\" cy=\"11\" r=\"1.2\"/><circle cx=\"10.5\" cy=\"7\" r=\"1.2\"/><circle cx=\"15.5\" cy=\"7.5\" r=\"1.2\"/>',folder:")
# 見た目
R(".ppr{display:flex;",""".pptop{margin:2px 0 6px}.ppn .chip{border:1px solid var(--line);border-radius:999px;background:var(--card);font:inherit;font-size:.74rem;min-height:30px;padding:2px 12px;color:var(--sub)}.ppn .chip.on{border-color:var(--acc);color:var(--acc);font-weight:700}.ppn .chip.on::before{content:"✓ "}
.pptab{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin:0 -2px 6px}.pptab::-webkit-scrollbar{display:none}.pptab button{flex:0 0 auto;border:0;background:none;font:inherit;font-size:.8rem;min-height:32px;padding:2px 10px;border-radius:8px;color:var(--sub)}.pptab button.on{background:var(--acc);color:var(--card);font-weight:700}
.ppsw{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.ppsw::-webkit-scrollbar{display:none}.ppsw button{flex:0 0 62px;border:0;background:none;padding:0;font:inherit;display:flex;flex-direction:column;align-items:center;gap:3px;min-height:0}
.ppsw i{display:block;width:52px;height:52px;border-radius:50%;background-size:cover;background-position:center;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12),0 1px 3px rgba(0,0,0,.12);transition:transform .12s}.ppsw i.nb{background:repeating-linear-gradient(45deg,#f2f1ee 0 6px,#e4e2dd 6px 12px)}
.ppsw button.on i{box-shadow:0 0 0 2px var(--card),0 0 0 4px var(--acc);transform:scale(1.04)}.ppsw span{font-size:.64rem;line-height:1.2;color:var(--sub);text-align:center;max-width:62px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.ppsw button.on span{color:var(--ink,#111);font-weight:700}
.ppr{display:flex;""")
open(P,"w",encoding="utf-8").write(s);print("ok")
