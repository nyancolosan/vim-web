import os,shutil,json,re,zipfile
from PIL import Image,ImageDraw
SD=os.path.dirname(os.path.abspath(__file__))
OUT="/mnt/user-data/outputs/bimini-ios";shutil.rmtree(OUT,ignore_errors=True)
W=OUT+"/www";os.makedirs(W+"/lib");os.makedirs(OUT+"/scripts");os.makedirs(OUT+"/resources")
BUNDLE="com.example.bimini"
s=open("/mnt/user-data/outputs/furniture-catalog.html",encoding="utf-8").read()
s=re.sub(r'インテリア・売場プランナー　v\d+','インテリア・売場プランナー　iOS版 1.0',s)
# CDNをやめてアプリ内のファイルを使う（オフラインでも完全に動く）
for a,b in [("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js","lib/three.min.js"),
            ("https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js","lib/pdf-lib.min.js"),
            ("https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js","lib/qrcode.js")]:
    assert a in s,a;s=s.replace(a,b)
assert "cdnjs.cloudflare.com" not in s
s=s.replace("<title>BIMini</title>",'<title>BIMini</title>\n<script src="ios-config.js"></script>',1)
open(W+"/index.html","w",encoding="utf-8").write(s)
shutil.copy(SD+"/th128/build/three.min.js",W+"/lib/three.min.js")
shutil.copy("/opt/npm-tools/node_modules/pdf-lib/dist/pdf-lib.min.js",W+"/lib/pdf-lib.min.js")
shutil.copy(SD+"/qrg/js/dist/qrcode.js",W+"/lib/qrcode.js")
shutil.copy("/mnt/user-data/outputs/bimini-pt.js",W+"/bimini-pt.js")
for f in os.listdir(SD+"/iosextra/www"):shutil.copy(SD+"/iosextra/www/"+f,W+"/"+f)
for f in os.listdir(SD+"/iosextra/root"):shutil.copy(SD+"/iosextra/root/"+f,OUT+"/"+f)
shutil.copy(SD+"/iosextra/ios-setup.sh",OUT+"/scripts/ios-setup.sh")
# ライセンス表記
open(W+"/lib/LICENSES.txt","w").write("three.js r128 — MIT License, Copyright © 2010-2021 three.js authors\npdf-lib 1.17.1 — MIT License, Copyright (c) 2019 Andrew Dillon\nqrcode-generator — MIT License, Copyright (c) 2009 Kazuhiko Arase\nthree-gpu-pathtracer / three-mesh-bvh / three.js r185 — see bimini-pt.js header (MIT)\n")
# アイコン（1024・透過なし）と起動画面
def icon(S=1024):
    im=Image.new("RGB",(S,S),"#1f5c99");d=ImageDraw.Draw(im);c=(S//2,S//2+20);r=300
    d.polygon([(c[0],c[1]-r),(c[0]+int(r*.87),c[1]-r//2),(c[0],c[1]),(c[0]-int(r*.87),c[1]-r//2)],fill="#ffda1a")
    d.polygon([(c[0]-int(r*.87),c[1]-r//2),(c[0],c[1]),(c[0],c[1]+r),(c[0]-int(r*.87),c[1]+r//2)],fill="#f7f5f0")
    d.polygon([(c[0]+int(r*.87),c[1]-r//2),(c[0],c[1]),(c[0],c[1]+r),(c[0]+int(r*.87),c[1]+r//2)],fill="#d9d4c8")
    return im
icon().save(OUT+"/resources/icon.png")
sp=Image.new("RGB",(2732,2732),"#f7f5f0");sp.paste(icon(600),(1066,1066));sp.save(OUT+"/resources/splash.png")
z=zipfile.ZipFile("/mnt/user-data/outputs/bimini-ios.zip","w",zipfile.ZIP_DEFLATED)
for root,_,fs in os.walk(OUT):
    for f in fs:
        p=os.path.join(root,f);z.write(p,"bimini-ios/"+os.path.relpath(p,OUT))
z.close();print("ok",sorted(os.listdir(OUT)),sorted(os.listdir(W)))
