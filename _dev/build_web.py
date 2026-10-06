import os,shutil,json,zipfile
SDIR=os.path.dirname(os.path.abspath(__file__))
from PIL import Image,ImageDraw,ImageFont
OUT="/mnt/user-data/outputs/bimini-web";shutil.rmtree(OUT,ignore_errors=True);os.makedirs(OUT)
s=open("/mnt/user-data/outputs/furniture-catalog.html",encoding="utf-8").read()
import re
s=re.sub(r'インテリア・売場プランナー　v\d+','インテリア・売場プランナー　Web版 2.2',s)
head='''<meta name="description" content="家具の配置を平面図と3Dで検討し、見積書や提案書まで作れるインテリア・売場プランナー">
<script src="config.js"></script>
<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#0058a3"><link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" href="icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default">
'''
assert s.count("<title>BIMini</title>")==1
s=s.replace("<title>BIMini</title>","<title>BIMini</title>\n"+head)
reg='''<script>if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost"||location.hostname==="127.0.0.1")){navigator.serviceWorker.register("sw.js").then(function(r){r.addEventListener("updatefound",function(){var w=r.installing;if(w)w.addEventListener("statechange",function(){if(w.state==="activated"&&navigator.serviceWorker.controller){try{toast("アプリが最新版になりました")}catch(e){}}})})}).catch(function(){})}</script>
</body></html>'''
assert s.rstrip().endswith("</body></html>")
s=s.rstrip()[:-len("</body></html>")]+reg
open(OUT+"/index.html","w",encoding="utf-8").write(s)
json.dump({"name":"BIMini インテリア・売場プランナー","short_name":"BIMini","start_url":"./","scope":"./","display":"standalone","orientation":"any","background_color":"#f7f5f0","theme_color":"#0058a3","lang":"ja",
 "icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},open(OUT+"/manifest.webmanifest","w",encoding="utf-8"),ensure_ascii=False,indent=1)
open(OUT+"/sw.js","w").write('''// BIMini service worker: 更新時は V の番号を上げてください
const V="bimini-web-2.2.0";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-180.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
 if(u.origin===location.origin&&u.pathname.startsWith("/api/"))return;
 if(u.origin!==location.origin&&!/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.host))return;
 if(u.origin===location.origin&&u.pathname.endsWith("config.js")){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r)));return}
 if(r.mode==="navigate"||(u.origin===location.origin&&u.pathname.endsWith(".html"))){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put("./index.html",cp));return res}).catch(()=>caches.match("./index.html")));return}
 e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})))});
''')
def icon(n):
    S=1024;im=Image.new("RGB",(S,S),"#0058a3");d=ImageDraw.Draw(im)
    c=(S//2,S//2+20);r=300
    top=[(c[0],c[1]-r),(c[0]+int(r*.87),c[1]-r//2),(c[0],c[1]),(c[0]-int(r*.87),c[1]-r//2)]
    d.polygon(top,fill="#ffda1a")
    d.polygon([(c[0]-int(r*.87),c[1]-r//2),(c[0],c[1]),(c[0],c[1]+r),(c[0]-int(r*.87),c[1]+r//2)],fill="#f7f5f0")
    d.polygon([(c[0]+int(r*.87),c[1]-r//2),(c[0],c[1]),(c[0],c[1]+r),(c[0]+int(r*.87),c[1]+r//2)],fill="#d9d4c8")
    im.resize((n,n),Image.LANCZOS).save(OUT+"/icon-%d.png"%n)
for n in (180,192,512):icon(n)
shutil.copy("/mnt/user-data/outputs/bimini-pt.js",OUT+"/bimini-pt.js")
for f in ("config.js","tokushoho.html","privacy.html"):shutil.copy(SDIR+"/webextra/"+f,OUT+"/"+f)
shutil.copy("/mnt/user-data/outputs/bimini-billing/worker.js",OUT+"/_worker.js")
open(OUT+"/README.md","w",encoding="utf-8").write(open("readme_web.md",encoding="utf-8").read())
z=zipfile.ZipFile("/mnt/user-data/outputs/bimini-web.zip","w",zipfile.ZIP_DEFLATED)
for f in sorted(os.listdir(OUT)):z.write(OUT+"/"+f,"bimini-web/"+f)
z.close();print(os.listdir(OUT))
