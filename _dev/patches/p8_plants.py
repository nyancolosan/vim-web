"""p8: リアルな観葉植物（Poly Haven・CC0 の glTF）。
- 「家具を選ぶ」に「観葉植物」を追加（パキラ・カラテア・アンスリウムなど6種）
- 3Dでは公開時に同梱したモデル（models/）を読み込む。読めないときは今までの手作りの植物で表示
- 初めて読み込んだとき、モデルの実寸に合わせて幅・高さを入れる（高さを変えると全体が比例して変わる）"""
import os, sys
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "furniture-catalog.html")
s = open(P, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit("一致数 %d（期待 %d）: %s" % (c, n, old[:120]))
    s = s.replace(old, new)

rep('var TPLF=["col",', 'var TPLF=["glb","col",')
rep('var TPG=["什器","テーブル",', 'var TPG=["什器","観葉植物","テーブル",')
rep('var NEWT=[\n',
    'var NEWT=[\n'
    ' {g:"観葉植物",name:"パキラ",kind:"p",shape:"r",w:700,d:300,h:1300,pot:"white",glb:"pachira_aquatica_01"},\n'
    ' {g:"観葉植物",name:"観葉植物A",kind:"p",shape:"u",w:500,d:250,h:800,pot:"white",glb:"potted_plant_01"},\n'
    ' {g:"観葉植物",name:"観葉植物B",kind:"p",shape:"r",w:450,d:220,h:600,pot:"white",glb:"potted_plant_02"},\n'
    ' {g:"観葉植物",name:"観葉植物C",kind:"p",shape:"p",w:550,d:260,h:1000,pot:"white",glb:"potted_plant_04"},\n'
    ' {g:"観葉植物",name:"カラテア",kind:"p",shape:"w",w:600,d:240,h:600,pot:"white",glb:"calathea_orbifolia_01"},\n'
    ' {g:"観葉植物",name:"アンスリウム",kind:"p",shape:"t",w:450,d:200,h:550,pot:"white",glb:"anthurium_botany_01"},\n')
rep('function tplGroup(m){if(m.g)return m.g;', 'function tplGroup(m){if(m.g)return m.g;if(m.kind==="p")return"観葉植物";')

# 一覧のサムネイル：glb は同梱の写真
rep("g.innerHTML=L.map(function(e){var u=TPLS.c[e.id+\"|\"+e.m.name];",
    "g.innerHTML=L.map(function(e){var u=e.m.glb?\"models/\"+e.m.glb+\"/thumb.png\":TPLS.c[e.id+\"|\"+e.m.name];")
rep(' TPLS.q=L.filter(function(e){return!TPLS.c[e.id+"|"+e.m.name]});tplRun()}',
    ' TPLS.q=L.filter(function(e){return!e.m.glb&&!TPLS.c[e.id+"|"+e.m.name]});tplRun()}')

# glTF の読み込み
rep('function plant3d(sc,pc,it){',
    '/* ===== glTF（Poly Haven の観葉植物など）：公開時に models/ に同梱したものを読む ===== */\n'
    'var GLB={c:{},p:{},bad:{},L:null};\n'
    'function glbLoader(){if(GLB.L)return GLB.L;GLB.L=(THREE.GLTFLoader?Promise.resolve():new Promise(function(res,rej){var sc=document.createElement("script");sc.src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";sc.onload=res;sc.onerror=rej;document.head.appendChild(sc)}))\n'
    ' .then(function(){return new THREE.GLTFLoader()});GLB.L.catch(function(){GLB.L=null});return GLB.L}\n'
    'function glbLoad(id){if(GLB.c[id])return Promise.resolve(GLB.c[id]);if(GLB.p[id])return GLB.p[id];\n'
    ' GLB.p[id]=glbLoader().then(function(L){return new Promise(function(res,rej){L.load("models/"+id+"/"+id+".gltf",res,undefined,rej)})}).then(function(gl){var s=gl.scene;\n'
    '  s.traverse(function(o){if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;var M=o.material;(Array.isArray(M)?M:[M]).forEach(function(m){m._lin=1;if(m.envMapIntensity!==undefined)m.envMapIntensity*=.35})});\n'
    '  var bb=new THREE.Box3().setFromObject(s);GLB.c[id]={s:s,sz:bb.getSize(new THREE.Vector3()),ct:bb.getCenter(new THREE.Vector3()),min:bb.min.clone()};return GLB.c[id]})\n'
    ' .catch(function(e){delete GLB.p[id];GLB.bad[id]=1;throw e});return GLB.p[id]}\n'
    '/* 高さに合わせて全体を比例で大きさを変え、床に置く（足もと中心が原点） */\n'
    'function glbObj(it){var c=GLB.c[it.glb];if(!c)return null;var k=(+it.h?+it.h/1000:c.sz.y)/(c.sz.y||1),o=c.s.clone(true),g=new THREE.Group();o.scale.setScalar(k);o.position.set(-c.ct.x*k,-c.min.y*k,-c.ct.z*k);g.add(o);g.userData.glb=1;return g}\n'
    '/* 初めて読んだとき、モデルの実寸を一覧に入れる（葉張り・鉢径の目安・樹高） */\n'
    'function glbFit(it){var c=GLB.c[it.glb];if(!c||it.glbz)return false;it.h=Math.round(c.sz.y*100)*10;it.w=Math.round(Math.max(c.sz.x,c.sz.z)*100)*10;it.d=Math.max(120,Math.round(Math.min(c.sz.x,c.sz.z)*45)*10);it.glbz=1;return true}\n'
    'function glbSync(id){if(GLB.bad[id])return;glbLoad(id).then(function(){var ch=false;items.forEach(function(x){if(x.glb===id&&glbFit(x))ch=true});if(ch){save();render();table();if(!document.getElementById("v2").hidden)rplan()}\n'
    ' if(!document.getElementById("v3").hidden)r3d()}).catch(function(){})}\n'
    'function plant3d(sc,pc,it){\n'
    ' if(it.glb&&!GLB.bad[it.glb]){var gg=glbObj(it);if(gg){gg.position.set(pc.x/1000,0,pc.y/1000);gg.rotation.y=-(pc.r||0)*Math.PI/180;sc.add(gg);return}glbSync(it.glb)}')
# 置いたときにも読み込んで、実寸を一覧に反映
rep(' plan.p.push({n:k,x:cx+z,y:cy+z,r:0});sel=plan.p.length-1;psave();rplan();after3d();',
    ' plan.p.push({n:k,x:cx+z,y:cy+z,r:0});sel=plan.p.length-1;psave();rplan();after3d();if(e.glb)glbSync(e.glb);')
open(P, "w", encoding="utf-8").write(s); print("p8 OK")
