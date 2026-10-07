"""v4.3：①部屋→②家具→③3D の案内、家具の編集パネル（平面図・3D共通）、3Dで壁を隠す、
3D 画面の閉じタグ1つ多い不具合（3Dの設定が全ページに出る）を直す。1回だけ実行。"""
import os
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); P = os.path.join(D, "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) >= 1, a[:80]
    s = s.replace(a, b, n)
# 1) 閉じタグ
rep('<button id="ppr">ここを戻す</button><button id="ppa">すべて戻す</button></div></div></div></div></div>',
    '<button id="ppr">ここを戻す</button><button id="ppa">すべて戻す</button></div></div></div></div>')
# 2) 壁に目印（隠すときに使う）
rep('var mm=new THREE.Mesh(gq,wm(THREE.FrontSide));mm.receiveShadow=true;mm.castShadow=true;return mm}',
    'var mm=new THREE.Mesh(gq,wm(THREE.FrontSide));mm.receiveShadow=true;mm.castShadow=true;mm.userData.wl=1;mm.userData.wlm=1;return mm}')
rep('b.position.set(x,y,z);b.receiveShadow=true;sc.add(b)}', 'b.position.set(x,y,z);b.receiveShadow=true;if(c&&c.isColor)b.userData.wl=1;sc.add(b)}')
rep('cb.castShadow=tall;sc.add(cb)', 'cb.castShadow=tall;if(tall)cb.userData.wl=1;sc.add(cb)')
rep('ao.renderOrder=1;sc.add(ao);', 'ao.renderOrder=1;ao.userData.wl=1;sc.add(ao);')
rep('aw.renderOrder=1;sc.add(aw)', 'aw.renderOrder=1;aw.userData.wl=1;sc.add(aw)')
# 3) 新しい部品の入れ物
rep('</script></body></html>', '/*@@BEGIN ux6@@*/\n/*@@END ux6@@*/\n</script></body></html>')
# 4) 見た目
CSS = r'''
/* ===== v4.3 案内・編集パネル ===== */
.ux6w{margin:0 0 10px}
.ux6s{display:flex;align-items:stretch;gap:4px;background:var(--card);border-radius:var(--rc);box-shadow:0 0 0 1px var(--line);padding:6px}
.ux6s button{flex:1 1 0;min-width:0;display:flex;align-items:center;gap:6px;border:0;background:transparent;padding:6px 4px;border-radius:calc(var(--rc)*.7);color:var(--sub);text-align:left;min-height:48px}
.ux6s button em{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-weight:800;font-size:.85rem;box-shadow:0 0 0 1.5px var(--line)}
.ux6s button em svg{width:16px;height:16px}
.ux6s button span{display:flex;flex-direction:column;min-width:0}
.ux6s button b{font-size:.8rem;color:inherit;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ux6s button small{font-size:.66rem;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ux6s button.done{color:var(--ink)}
.ux6s button.done em{background:var(--acc);color:#fff;box-shadow:none}
.ux6s button.now{background:var(--accbg,rgba(0,0,0,.05));color:var(--acc)}
.ux6s button.now em{background:var(--hi);color:var(--hiink);box-shadow:none}
.ux6a{flex:none;width:8px;align-self:center;height:8px;border-top:2px solid var(--line);border-right:2px solid var(--line);transform:rotate(45deg)}
.ux6h{margin:6px 2px 0;font-size:.78rem;color:var(--sub)}
.plb.ux6go{animation:ux6p 1.8s ease-in-out infinite}
@keyframes ux6p{0%,100%{box-shadow:0 0 0 0 rgba(0,0,0,0)}50%{box-shadow:0 0 0 6px var(--accbg,rgba(0,0,0,.08))}}
@media (prefers-reduced-motion:reduce){.plb.ux6go{animation:none}}
.ux6ed{color:var(--acc)!important;font-weight:800}
.fed{position:fixed;left:0;right:0;bottom:0;z-index:45;display:flex;justify-content:center;pointer-events:none}
.fedb{pointer-events:auto;width:100%;max-width:720px;max-height:62vh;overflow:auto;background:var(--card);border-radius:calc(var(--rc)*1.2) calc(var(--rc)*1.2) 0 0;box-shadow:0 -8px 30px rgba(0,0,0,.18);padding:12px 16px calc(16px + env(safe-area-inset-bottom,0px))}
.fedh{display:flex;align-items:center;justify-content:space-between;gap:8px;position:sticky;top:-12px;background:var(--card);padding:4px 0;z-index:1}
.fedh b{font-size:1rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fedh .pri{min-width:76px}
.fedn{margin:0 0 8px;font-size:.74rem;color:var(--sub)}
.feds{margin:10px 0 0}.feds>b{display:block;font-size:.82rem;margin-bottom:6px}
.fedz{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.fedz label{font-size:.7rem;color:var(--sub)}
.fedp{display:flex;align-items:center;margin-top:2px;border:1.5px solid var(--line);border-radius:calc(var(--rc)*.6);overflow:hidden;background:var(--fill)}
.fedp button{flex:none;width:30px;min-height:40px;border:0;background:transparent;font-size:1.1rem;color:var(--acc);padding:0}
.fedp input{flex:1 1 0;min-width:0;border:0!important;background:transparent!important;text-align:center;padding:6px 0;font-variant-numeric:tabular-nums;border-radius:0!important}
.fedu{display:block;margin-top:4px;font-size:.66rem;color:var(--sub)}
.fedc{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.fedc>button[data-fc]{width:32px;height:32px;min-height:32px;border-radius:50%;border:0;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15);padding:0}
.fedc>button.on{box-shadow:0 0 0 2px var(--card),0 0 0 4px var(--acc)}
.fedcc{display:flex;align-items:center;gap:4px;font-size:.72rem;color:var(--ink)}
.fedcc input{width:32px;height:32px;padding:0;border-radius:50%}
.fedr{min-height:32px;font-size:.72rem;padding:0 10px;border:1.5px solid var(--line);background:transparent;border-radius:999px}
.fedpp{margin-top:14px;width:100%;min-height:44px;border:1.5px dashed var(--acc);background:transparent;color:var(--acc);font-weight:800;border-radius:var(--rb,10px)}
body.fedon .tabs{visibility:hidden}
#fed .pptab{margin-bottom:8px}
#vwall.on{color:var(--acc);box-shadow:inset 0 0 0 2px var(--acc)}
'''
rep('</style></head>', CSS + '</style></head>')
open(P, "w", encoding="utf-8").write(s)
print("ok")
