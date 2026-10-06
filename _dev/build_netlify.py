import os,shutil,json,zipfile
SD=os.path.dirname(os.path.abspath(__file__))
W="/mnt/user-data/outputs/bimini-web";OUT="/mnt/user-data/outputs/bimini-netlify"
shutil.rmtree(OUT,ignore_errors=True);os.makedirs(OUT+"/netlify/functions")
for f in os.listdir(W):
    if f in("_worker.js","README.md"):continue
    shutil.copy(W+"/"+f,OUT+"/"+f)
shutil.copy(SD+"/netlifyextra/api.mjs",OUT+"/netlify/functions/api.mjs")
shutil.copy(SD+"/netlifyextra/README.md",OUT+"/README.md")
json.dump({"name":"bimini-web","private":True,"type":"module","dependencies":{"@netlify/blobs":">=8.1.0"}},open(OUT+"/package.json","w"),indent=1)
open(OUT+"/netlify.toml","w").write('''[build]
  publish = "."
  command = ""

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

# 開発用の元ファイル（_dev）は公開しない
[[redirects]]
  from = "/_dev/*"
  to = "/404.html"
  status = 404
  force = true

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"
''')
c=open(OUT+"/config.js",encoding="utf-8").read()
c=c.replace("課金サーバーはアプリと一緒にアップロードされる _worker.js です。","課金サーバーは netlify/functions/api.mjs です。").replace("Cloudflare側でStripeの設定","Netlify側でStripeの設定")
open(OUT+"/config.js","w",encoding="utf-8").write(c)
z=zipfile.ZipFile("/mnt/user-data/outputs/bimini-netlify.zip","w",zipfile.ZIP_DEFLATED)
for root,_,fs in os.walk(OUT):
    for f in fs:p=os.path.join(root,f);z.write(p,os.path.relpath(p,OUT))
z.close();print(sorted(os.listdir(OUT)))
