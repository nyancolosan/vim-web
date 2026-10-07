/* ===== idea：IA モード（売上管理） =====
 * 右上の「IA」から入る。はじめにユーザー名とパスワードを登録し、次からはそれでログインする。
 * 保存先：claude.ai の db（data/users/<Claudeのユーザーid>/ia_<ユーザー名> 以下。本人だけが読み書きできる）
 *   ia_<ユーザー名>                 … アカウント（パスワードは PBKDF2 のハッシュだけ）と、使っている期
 *   ia_<ユーザー名>/periods/<開始日> … 半期の予算と26週の予算
 *   ia_<ユーザー名>/days/<日付>      … その日の会計の一覧 entries（合計・消費税・配送料・付帯作業料・その他・売上・メモ）と、その日の合計 total・net
 * 売れ筋：window.IDEA_TREND（build_muji.py が ia/trend.json を埋め込む） */
(function(){
var $=function(i){return document.getElementById(i)};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var yen=function(n){n=Math.round(n||0);return(n<0?"−":"")+"¥"+Math.abs(n).toLocaleString("ja-JP")};
var pct=function(a,b){return b>0?Math.round(a/b*1000)/10+"%":"—"};
function num(v){v=String(v==null?"":v).replace(/[０-９]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-65248)}).replace(/[,，¥￥円\s]/g,"");var n=parseFloat(v);return isFinite(n)?n:0}
function ds(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function pd(s){var a=String(s).split("-");return new Date(+a[0],+a[1]-1,+a[2])}
function add(s,n){var d=pd(s);d.setDate(d.getDate()+n);return ds(d)}
function diff(a,b){return Math.round((pd(b)-pd(a))/864e5)}
function md(s){var d=pd(s);return(d.getMonth()+1)+"/"+d.getDate()}
var WD=["日","月","火","水","木","金","土"];
function wd(s){return WD[pd(s).getDay()]}
function today(){return ds(new Date())}
var IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';

/* ---------- 保存先 ---------- */
var DB=null,UID=null,READY=null,U=null,ACC=null,PER={},DAYS={},TAB="week";
function ready(){if(READY)return READY;
 READY=(window.claude&&window.claude.use?Promise.all([window.claude.use("db"),window.claude.use("user")]):Promise.resolve([null,null])).then(function(r){
  if(!r[0]||!r[1])return false;DB=r[0];return r[1].id().then(function(id){UID=id?String(id):null;return!!UID})}).catch(function(){return false});return READY}
function base(u){return DB.doc("data/users/"+UID+"/ia_"+(u||U))}
function hex(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return("0"+x.toString(16)).slice(-2)}).join("")}
function hash(pw,salt,it){var e=new TextEncoder();return crypto.subtle.importKey("raw",e.encode(pw),"PBKDF2",false,["deriveBits"]).then(function(k){
 return crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:e.encode(salt),iterations:it},k,256)}).then(hex)}
function load(){return Promise.all([base().collection("periods").get(),base().collection("days").get()]).then(function(r){
 PER={};r[0].docs.forEach(function(d){PER[d.id]=d.data()});DAYS={};r[1].docs.forEach(function(d){DAYS[d.id]=d.data()})})}

/* ---------- 画面の枠 ---------- */
var ov=null;
function shell(){if(ov)return;ov=document.createElement("div");ov.id="iaov";ov.hidden=true;ov.setAttribute("role","dialog");ov.setAttribute("aria-label","IA モード");
 ov.innerHTML='<div class="ia-in" id="iain"></div>';document.body.appendChild(ov);
 ov.addEventListener("click",onClick);ov.addEventListener("input",onInput)}
function open(){shell();ov.hidden=false;document.documentElement.style.overflow="hidden";
 var box=$("iain");box.innerHTML='<p class="ia-note" style="text-align:center;margin-top:40px">読み込んでいます…</p>';
 ready().then(function(ok){if(!ok){box.innerHTML=head(false)+'<div class="ia-login"><div class="ia-card"><b>この画面では売上を保存できません。</b><p class="ia-note">IA モードは、Claude にログインした状態でこのアプリを開いたときに使えます。売上はあなたの Claude アカウントにだけ保存されます。</p></div></div>';return}
  var s="";try{s=sessionStorage.getItem("idea-ia-user")||""}catch(e){}
  if(s){U=s;return base().get().then(function(d){if(!d.exists){U=null;return loginView()}ACC=d.data();return load().then(main)})}
  loginView()})}
function close(){if(ov)ov.hidden=true;document.documentElement.style.overflow=""}
function head(user){return'<div class="ia-hd"><div><b>IA モード</b><small>'+(user?esc(U)+' さん・売上管理':'インテリアアドバイザー向け')+'</small></div><div class="ia-x">'+(user?'<button type="button" class="ia-b" data-a="logout">ログアウト</button>':'')+'<button type="button" class="ia-b" data-a="close" aria-label="IA モードを閉じる">閉じる</button></div></div>'}

/* ---------- ログイン・登録 ---------- */
var LMODE="login";
function loginView(){var b=$("iain");
 b.innerHTML=head(false)+'<div class="ia-login"><div class="ia-logo" id="ialogo"></div>'+
 '<div class="ia-tab2"><button type="button" data-a="lm" data-m="login" class="'+(LMODE==="login"?"on":"")+'">ログイン</button><button type="button" data-a="lm" data-m="reg" class="'+(LMODE==="reg"?"on":"")+'">はじめて登録</button></div>'+
 '<form id="iaf" class="ia-card" style="display:flex;flex-direction:column;gap:12px" autocomplete="on">'+
 '<div><label for="iau">ユーザー名</label><input id="iau" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="半角英数字（例：sato_ginza）"></div>'+
 '<div><label for="iap">パスワード</label><input id="iap" type="password" name="password" autocomplete="'+(LMODE==="reg"?"new-password":"current-password")+'" placeholder="'+(LMODE==="reg"?"6文字以上":"")+'"></div>'+
 (LMODE==="reg"?'<div><label for="iap2">パスワード（確認）</label><input id="iap2" type="password" autocomplete="new-password"></div>':'')+
 '<button class="ia-p" type="submit" id="iago">'+(LMODE==="reg"?"登録してはじめる":"ログイン")+'</button><div class="ia-msg bad" id="iam" hidden></div></form>'+
 '<p class="ia-note">'+(LMODE==="reg"?"ユーザー名とパスワードは、次からのログインに使います。パスワードは元に戻せない形（ハッシュ）でだけ保存するので、忘れないようにしてください。":"はじめて使うときは「はじめて登録」から、ユーザー名とパスワードを決めてください。")+'</p></div>';
 try{$("ialogo").innerHTML=vimWord()}catch(e){}
 $("iaf").addEventListener("submit",function(e){e.preventDefault();submit()})}
function msg(t){var m=$("iam");m.hidden=!t;m.textContent=t||""}
function submit(){var u=$("iau").value.trim(),p=$("iap").value,go=$("iago");
 if(!/^[A-Za-z0-9_.-]{3,20}$/.test(u))return msg("ユーザー名は半角英数字と _ . - で3〜20文字にしてください。");
 if(LMODE==="reg"){if(p.length<6)return msg("パスワードは6文字以上にしてください。");if(p!==$("iap2").value)return msg("確認用のパスワードが一致しません。")}
 if(!p)return msg("パスワードを入れてください。");
 u=u.toLowerCase();go.disabled=true;msg("");
 base(u).get().then(function(d){
  if(LMODE==="reg"){if(d.exists){msg("このユーザー名はすでに登録されています。ログインしてください。");go.disabled=false;return}
   var salt=hex(crypto.getRandomValues(new Uint8Array(16)));
   return hash(p,salt,150000).then(function(h){ACC={username:u,salt:salt,hash:h,iter:150000,created:new Date().toISOString(),active:""};return base(u).set(ACC)}).then(function(){done(u)})}
  if(!d.exists){msg("ユーザー名かパスワードが違います。");go.disabled=false;return}
  var a=d.data();return hash(p,a.salt,a.iter||150000).then(function(h){if(h!==a.hash){msg("ユーザー名かパスワードが違います。");go.disabled=false;return}ACC=a;done(u)})
 }).catch(function(e){msg("保存先につながりませんでした。少し待ってから、もう一度お試しください。");go.disabled=false})}
function done(u){U=u;try{sessionStorage.setItem("idea-ia-user",u)}catch(e){}load().then(main)}

/* ---------- 計算 ---------- */
function per(){return ACC&&ACC.active&&PER[ACC.active]?PER[ACC.active]:null}
function wk(p,i){var s=add(p.start,i*7);return{i:i,start:s,end:add(s,6),budget:num(p.weeks&&p.weeks[i])}}
function dayNet(s){var d=DAYS[s];return d?num(d.net):null}
function wkActual(p,i){var w=wk(p,i),a=0,n=0,by=[];for(var k=0;k<7;k++){var v=dayNet(add(w.start,k));by.push(v);if(v!=null){a+=v;n++}}return{sum:a,n:n,by:by}}
function curIdx(p){return Math.floor(diff(p.start,today())/7)}
/* 曜日ごとの売れ方（終わった週のうち5日以上入力がある週の平均シェア。足りなければ均等） */
function weights(p,upto){var acc=[0,0,0,0,0,0,0],c=0;
 for(var i=0;i<Math.min(upto,26);i++){var a=wkActual(p,i);if(a.n>=5&&a.sum>0){a.by.forEach(function(v,k){acc[k]+=(v||0)/a.sum});c++}}
 if(c<2)return{w:[1,1,1,1,1,1,1].map(function(){return 1/7}),n:c};return{w:acc.map(function(x){return x/c}),n:c}}
function forecast(p,i){var w=wk(p,i),a=wkActual(p,i),W=weights(p,i),t=today(),S=0,rem=[],remW=0;
 for(var k=0;k<7;k++){var s=add(w.start,k);if(a.by[k]!=null)S+=W.w[k];else if(s>=t){rem.push(k);remW+=W.w[k]}}
 var proj=S>0?a.sum/S:null,need=w.budget-a.sum,status="none";
 if(proj!=null&&w.budget>0)status=proj>=w.budget?"ok":proj>=w.budget*.95?"mid":"bad";
 var perDay=rem.map(function(k){return{d:add(w.start,k),v:remW>0?Math.max(0,need)*W.w[k]/remW:0}});
 return{w:w,a:a,W:W,S:S,proj:proj,need:need,status:status,perDay:perDay,remN:rem.length}}

/* ---------- メイン ---------- */
function main(){var b=$("iain");
 if(!per()&&TAB!=="budget"&&TAB!=="rank")TAB="budget";
 b.innerHTML=head(true)+'<div class="ia-seg" id="iaseg">'+[["week","今週"],["input","入力"],["budget","予算"],["trend","傾向"],["rank","売れ筋"]].map(function(t){return'<button type="button" data-a="tab" data-t="'+t[0]+'" class="'+(TAB===t[0]?"on":"")+'">'+t[1]+'</button>'}).join("")+'</div><div id="iab"></div>';
 ({week:rWeek,input:rInput,budget:rBudget,trend:rTrend,rank:rRank})[TAB]()}
function needPer(){$("iab").innerHTML='<div class="ia-card" style="margin-top:16px"><b>まず半期の予算を登録してください。</b><p class="ia-note">「予算」で、期のはじまりの日と半期の予算、26週それぞれの予算を入れると、今週の進み具合が出ます。</p><button type="button" class="ia-p" data-a="tab" data-t="budget">予算を登録する</button></div>'}

/* 今週 */
function rWeek(){var p=per();if(!p)return needPer();var i=curIdx(p);
 if(i<0||i>25){$("iab").innerHTML='<div class="ia-card" style="margin-top:16px"><b>今日は「'+esc(p.name)+'」の期間外です。</b><p class="ia-note">期間：'+md(p.start)+'〜'+md(add(p.start,181))+'。「予算」で新しい期を登録してください。</p></div>';return}
 var f=forecast(p,i),w=f.w,a=f.a,ratio=w.budget>0?a.sum/w.budget:0,el=Math.min(7,diff(w.start,today())+1),pace=w.budget*el/7;
 var chip={ok:["ok","達成見込み"],mid:["mid","あと少し"],bad:["bad","このままだと届かない"],none:["none","入力すると見込みが出ます"]}[f.status];
 /* 半期 */
 var hb=0,ha=0;for(var k=0;k<=i;k++){hb+=wk(p,k).budget;ha+=wkActual(p,k).sum}
 var rates=[];for(var k2=0;k2<i;k2++){var bb=wk(p,k2).budget;if(bb>0)rates.push(wkActual(p,k2).sum/bb)}
 var ar=rates.length?rates.reduce(function(x,y){return x+y},0)/rates.length:1,fut=0;for(var k3=i+1;k3<26;k3++)fut+=wk(p,k3).budget;
 var thisLand=f.proj!=null?f.proj:w.budget,land=ha-a.sum+thisLand+fut*ar,total=num(p.total);
 var bars=svgDays(p,w,a,f);
 $("iab").innerHTML=
 '<h3>第'+(i+1)+'週<small>'+md(w.start)+'（'+wd(w.start)+'）〜'+md(w.end)+'（'+wd(w.end)+'）・'+esc(p.name)+'</small></h3>'+
 '<div class="ia-card"><div class="ia-big"><span><small style="display:block;font-size:.72rem;color:#7d7778">今週の売上</small><b>'+yen(a.sum)+'</b></span><span style="text-align:right"><small style="display:block;font-size:.72rem;color:#7d7778">予算 '+yen(w.budget)+'</small><b style="font-size:1.3rem">'+pct(a.sum,w.budget)+'</b></span></div>'+
 '<div class="ia-bar" role="img" aria-label="予算に対する進み具合"><i style="width:'+Math.min(100,ratio*100)+'%"></i><u style="left:'+Math.min(100,el/7*100)+'%" title="今日までのペース"></u></div>'+
 '<p class="ia-note" style="margin-top:6px">縦線は、今日までに積み上げたいペース（'+yen(pace)+'）です。</p></div>'+
 '<h3>このままだと</h3><div class="ia-card"><div class="ia-big"><span><small style="display:block;font-size:.72rem;color:#7d7778">今週の着地見込み</small><b>'+(f.proj!=null?yen(f.proj):"—")+'</b></span><span class="ia-chip '+chip[0]+'">'+chip[1]+'</span></div>'+
 (f.proj!=null?'<p class="ia-note">入力済みの日の売上と、'+(f.W.n>=2?"これまでの週の曜日ごとの売れ方（"+f.W.n+"週分）":"曜日ごとに均等な売れ方（過去の週が2週分たまると、曜日の傾向を使います）")+'から見込みを出しています。予算比 '+pct(f.proj,w.budget)+'。</p>':'')+
 (f.need>0&&f.remN>0?'<div class="ia-kpi" style="margin-top:10px"><div><small>予算まで あと</small><b>'+yen(f.need)+'</b></div><div><small>残り'+f.remN+'日で 1日あたり</small><b>'+yen(f.need/f.remN)+'</b></div></div><p class="ia-note">曜日の売れ方に合わせると：'+f.perDay.map(function(x){return md(x.d)+'（'+wd(x.d)+'）'+yen(x.v)}).join("、")+'</p>':f.need<=0&&w.budget>0?'<p class="ia-msg ok">今週の予算は達成しています（'+yen(-f.need)+' 上回り）。</p>':'')+'</div>'+
 '<h3>日ごとの売上</h3><div class="ia-card">'+bars+'</div>'+
 '<h3>半期の進み具合<small>'+esc(p.name)+'</small></h3><div class="ia-kpi"><div><small>今週までの予算の累計</small><b>'+yen(hb)+'</b></div><div><small>今週までの売上の累計</small><b>'+yen(ha)+'</b></div><div><small>半期予算</small><b>'+yen(total)+'</b></div><div><small>半期の着地見込み</small><b>'+yen(land)+'</b></div></div>'+
 '<p class="ia-note">着地見込みは、ここまでの実績に、今週の見込みと、来週以降の予算×これまでの平均達成率（'+Math.round(ar*1000)/10+'%）を足したものです。半期予算比 '+pct(land,total)+'。</p>'+
 '<button type="button" class="ia-p" style="width:100%;margin-top:14px" data-a="tab" data-t="input">今日の売上を入れる</button>'}
function svgDays(p,w,a,f){var W=380,H=190,pad=16,bw=(W-pad*2)/7,mx=1,tgt=[];for(var k=0;k<7;k++){var t=w.budget*f.W.w[k];tgt.push(t);mx=Math.max(mx,a.by[k]||0,t)}mx*=1.15;var y=function(v){return H-24-(H-44)*v/mx};
 var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="日ごとの売上と目安"><line x1="'+pad+'" y1="'+(H-24)+'" x2="'+(W-pad)+'" y2="'+(H-24)+'" stroke="#e3dfdf"/>';
 for(var k2=0;k2<7;k2++){var x=pad+bw*k2,d=add(w.start,k2),v=a.by[k2],isT=d===today();
  s+='<rect x="'+(x+bw*.18)+'" y="'+y(tgt[k2])+'" width="'+bw*.64+'" height="'+(H-24-y(tgt[k2]))+'" fill="#f3eaeb" rx="4"/>';
  if(v!=null)s+='<rect x="'+(x+bw*.28)+'" y="'+y(v)+'" width="'+bw*.44+'" height="'+Math.max(1,H-24-y(v))+'" fill="'+(v>=tgt[k2]?"#9f2a37":"#c98a92")+'" rx="3"/><text x="'+(x+bw/2)+'" y="'+(y(v)-5)+'" text-anchor="middle" font-size="11" fill="#333">'+(v>=10000?Math.round(v/1000)+"千":Math.round(v))+'</text>';
  s+='<text x="'+(x+bw/2)+'" y="'+(H-8)+'" text-anchor="middle" font-size="12" fill="'+(isT?"#9f2a37":"#7d7778")+'" font-weight="'+(isT?700:400)+'">'+md(d)+wd(d)+'</text>'}
 return s+'</svg><p class="ia-note" style="margin-top:4px">薄い棒は、その日の目安（週の予算×曜日の売れ方）。濃い棒は目安を超えた日です。</p>'}

/* 入力：1日に何件でも会計を登録できる。日のドキュメントに entries（会計の一覧）と、その合計（total・net）を持つ */
var IDATE=null,IEDIT=null,IITEMS=[],IQ="";
/* 売った商品：アプリに入っているネットストアの商品（window.IA_ITEMS = [[JAN,名前,分類,価格],…]）から探す */
function nz(t){return String(t||"").normalize("NFKC").toLowerCase().replace(/\s+/g," ")}
var IX=null;function idx(){if(!IX)IX=(window.IA_ITEMS||[]).map(function(r){return{jan:r[0],name:r[1],cat:r[2],price:r[3],k:nz(r[1]+" "+r[0]+" "+r[2])}});return IX}
function search(q){var t=nz(q).trim().split(" ").filter(Boolean);if(!t.length)return[];return idx().filter(function(x){return t.every(function(w){return x.k.indexOf(w)>=0})}).slice(0,8)}
function itemsBox(){var R=search(IQ);
 return'<div style="margin-top:14px"><label for="iaq">売った商品（任意）</label><input id="iaq" type="search" value="'+esc(IQ)+'" placeholder="商品名・JANで探す（例：スタッキングシェルフ、蒸篭）" autocomplete="off"></div>'+
 '<div id="iar">'+resHtml(R)+'</div>'+
 '<div id="iasel">'+selHtml()+'</div>'}
function resHtml(R){if(!IQ.trim())return"";if(!R.length)return'<p class="ia-note">見つかりませんでした。<button type="button" class="ia-lnk" data-a="free">「'+esc(IQ.trim())+'」を名前だけで追加</button></p>';
 return'<div class="ia-rk" style="margin-top:8px">'+R.map(function(x){return'<a href="#" data-a="addi" data-j="'+x.jan+'"><i>＋</i><span style="white-space:normal"><b>'+esc(x.name)+'</b><small>'+esc(x.cat)+'・JAN '+x.jan+'</small></span><span>'+(x.price?yen(x.price):"")+'</span></a>'}).join("")+'</div><button type="button" class="ia-lnk" data-a="free">見つからないときは「'+esc(IQ.trim())+'」を名前だけで追加</button>'}
function selHtml(){if(!IITEMS.length)return'<p class="ia-note">商品を選ぶと、傾向で「よく売れた商品」がわかるようになります。</p>';
 var t=0;IITEMS.forEach(function(x){t+=num(x.price)*num(x.qty)});
 return'<div class="ia-tw" style="margin-top:10px"><table><tr><th>この会計で売った商品</th><th>数</th><th></th></tr>'+IITEMS.map(function(x,i){return'<tr><td style="white-space:normal">'+esc(x.name)+'<br><small style="color:#7d7778">'+esc(x.cat)+(x.price?'・'+yen(x.price):'')+'</small></td><td><button type="button" class="ia-b" style="min-height:34px;padding:0 10px" data-a="qm" data-i="'+i+'" aria-label="1つ減らす">−</button> '+x.qty+' <button type="button" class="ia-b" style="min-height:34px;padding:0 10px" data-a="qp" data-i="'+i+'" aria-label="1つ増やす">＋</button></td><td><button type="button" class="ia-lnk" data-a="rmi" data-i="'+i+'">外す</button></td></tr>'}).join("")+'</table>'+(t?'<p class="ia-note">選んだ商品のネットストア価格の合計：'+yen(t)+'（参考）</p>':'')+'</div>'}
function redrawItems(){var r=$("iar"),l=$("iasel");if(r)r.innerHTML=resHtml(search(IQ));if(l)l.innerHTML=selHtml()}
function entries(d){var e=DAYS[d];if(!e)return[];if(e.entries)return e.entries;return e.total!=null?[{id:"e0",total:e.total,tax:e.tax,ship:e.ship,work:e.work,other:e.other,net:e.net,memo:e.memo||"",items:e.items||[],at:e.at||""}]:[]}
function rInput(){var d=IDATE||today(),L=entries(d),ed=IEDIT?L.filter(function(x){return x.id===IEDIT})[0]:null,e=ed||{};if(!ed)IEDIT=null;
 var f=function(id,lab,v){return'<div><label for="'+id+'">'+lab+'</label><input id="'+id+'" class="num" inputmode="decimal" autocomplete="off" value="'+(v?Math.round(num(v)).toLocaleString("ja-JP"):"")+'" placeholder="0"></div>'};
 var sum=L.reduce(function(s,x){return s+num(x.net)},0);
 $("iab").innerHTML='<h3>売上を入れる</h3><div class="ia-card"><div><label for="iad">日付</label><input id="iad" type="date" value="'+d+'"></div>'+
 (L.length?'<div class="ia-tw" style="margin-top:12px"><table><tr><th>この日の会計</th><th>合計金額</th><th>売上</th><th></th></tr>'+L.map(function(x,i){return'<tr class="'+(x.id===IEDIT?"cur":"")+'"><td>'+(i+1)+'件目'+(x.memo?'<br><small style="color:#7d7778;font-weight:400">'+esc(x.memo)+'</small>':'')+'</td><td>'+yen(x.total)+'</td><td>'+yen(x.net)+'</td><td><button type="button" class="ia-lnk" data-a="edit" data-e="'+esc(x.id)+'">直す</button></td></tr>'}).join("")+
  '<tr><td><b>この日の合計</b><br><small style="color:#7d7778;font-weight:400">'+L.length+'件</small></td><td></td><td><b>'+yen(sum)+'</b></td><td></td></tr></table></div>':'<p class="ia-note">この日の会計はまだありません。下から1件ずつ追加してください。</p>')+'</div>'+
 '<h3>'+(ed?'会計を直す':'会計を追加')+'<small>'+md(d)+'（'+wd(d)+'）'+(ed?'':'・'+(L.length+1)+'件目')+'</small></h3><div class="ia-card">'+
 '<div class="ia-row">'+f("iat","合計金額",e.total)+f("iax","消費税",e.tax)+f("iash","配送料",e.ship)+f("iaw","付帯作業料",e.work)+f("iao","その他",e.other)+'</div>'+
 '<button type="button" class="ia-lnk" data-a="tax">合計金額から消費税（10%）を計算して入れる</button>'+
 itemsBox()+
 '<div style="margin-top:12px"><label for="iamemo">メモ（任意）</label><input id="iamemo" value="'+esc(e.memo||"")+'" placeholder="例：ソファ配送あり・カーテン注文"></div>'+
 '<div class="ia-net"><span>売上（合計−消費税−配送料−付帯作業料−その他）</span><b id="ianet"></b></div>'+
 '<button type="button" class="ia-p" style="width:100%;margin-top:14px" data-a="save">'+(ed?'この会計を直して保存':'この会計を追加')+'</button><div class="ia-msg" id="iasm" hidden></div>'+
 (ed?'<div style="display:flex;justify-content:space-between;margin-top:6px"><button type="button" class="ia-lnk" data-a="cancel">直すのをやめる</button><button type="button" class="ia-lnk" data-a="del">この会計を消す</button></div>':'')+'</div>'+weekList(d);
 $("ianet").textContent=yen(calc())}
function calc(){var g=function(i){var x=$(i);return x?num(x.value):0};return g("iat")-g("iax")-g("iash")-g("iaw")-g("iao")}
function weekList(d){var p=per();if(!p)return"";var i=Math.floor(diff(p.start,d)/7);if(i<0||i>25)return'<p class="ia-note">この日は「'+esc(p.name)+'」の期間外です。保存はできますが、週の集計には入りません。</p>';
 var w=wk(p,i),rows="",sum=0;for(var k=0;k<7;k++){var s=add(w.start,k),L=entries(s),n=L.reduce(function(t,x){return t+num(x.net)},0);sum+=n;
  rows+='<tr class="'+(s===d?"cur":"")+'"><td><button type="button" class="ia-lnk" data-a="pick" data-d="'+s+'">'+md(s)+'（'+wd(s)+'）</button></td><td>'+(L.length?L.length+'件':"—")+'</td><td>'+(L.length?yen(n):"未入力")+'</td></tr>'}
 return'<h3>第'+(i+1)+'週の入力<small>日付を押すとその日の会計を見られます</small></h3><div class="ia-card ia-tw"><table><tr><th>日付</th><th>会計</th><th>売上</th></tr>'+rows+'<tr><td><b>合計</b></td><td></td><td><b>'+yen(sum)+'</b></td></tr></table><p class="ia-note">今週の予算 '+yen(w.budget)+'・達成率 '+pct(sum,w.budget)+'</p></div>'}
function putDay(d,L){var o={date:d,entries:L,total:L.reduce(function(t,x){return t+num(x.total)},0),net:L.reduce(function(t,x){return t+num(x.net)},0),at:new Date().toISOString()};
 return(L.length?base().collection("days").doc(d).set(o):base().collection("days").doc(d).delete()).then(function(){if(L.length)DAYS[d]=o;else delete DAYS[d]})}
function saveDay(){var d=$("iad").value,m=$("iasm");if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){m.hidden=false;m.className="ia-msg bad";m.textContent="日付を選んでください。";return}
 var g=function(i){return Math.round(num($(i).value))};
 var o={id:IEDIT||("e"+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36)),total:g("iat"),tax:g("iax"),ship:g("iash"),work:g("iaw"),other:g("iao"),memo:$("iamemo").value.slice(0,200),items:IITEMS.map(function(x){return{jan:x.jan||"",name:x.name,cat:x.cat,price:Math.round(num(x.price)),qty:Math.max(1,Math.round(num(x.qty)))}}),at:new Date().toISOString()};o.net=o.total-o.tax-o.ship-o.work-o.other;
 if(!o.total){m.hidden=false;m.className="ia-msg bad";m.textContent="合計金額を入れてください。";return}
 var L=entries(d).slice(),was=!!IEDIT,ix=-1;L.forEach(function(x,i){if(x.id===o.id)ix=i});if(ix>=0)L[ix]=o;else L.push(o);
 putDay(d,L).then(function(){IDATE=d;IEDIT=null;IITEMS=[];IQ="";rInput();var mm=$("iasm");mm.hidden=false;mm.className="ia-msg ok";mm.textContent=(was?"会計を直しました。":"会計を追加しました（"+L.length+"件目）。")+md(d)+"（"+wd(d)+"）の売上は合計 "+yen(DAYS[d].net)+" です。"})
 .catch(function(){m.hidden=false;m.className="ia-msg bad";m.textContent="保存できませんでした。通信を確かめて、もう一度押してください。"})}
function delEntry(){var d=$("iad").value,L=entries(d).filter(function(x){return x.id!==IEDIT});putDay(d,L).then(function(){IEDIT=null;rInput()}).catch(function(){})}

/* 予算 */
var BDRAFT=null;
function rBudget(){var p=per();
 if(!BDRAFT){var st=p?p.start:nextMon();BDRAFT=p?{name:p.name,start:p.start,total:num(p.total),weeks:(p.weeks||[]).slice(0,26)}:{name:defName(st),start:st,total:0,weeks:[]};while(BDRAFT.weeks.length<26)BDRAFT.weeks.push(0)}
 var B=BDRAFT,sum=B.weeks.reduce(function(a,b){return a+num(b)},0),dif=B.total-sum,list=Object.keys(PER).sort().reverse();
 var rows="",cum=0;for(var i=0;i<26;i++){var s=add(B.start,i*7);cum+=num(B.weeks[i]);rows+='<tr><td>第'+(i+1)+'週</td><td>'+md(s)+'〜'+md(add(s,6))+'</td><td style="width:42%"><input class="num" inputmode="numeric" data-w="'+i+'" value="'+(B.weeks[i]?Math.round(num(B.weeks[i])).toLocaleString("ja-JP"):"")+'" aria-label="第'+(i+1)+'週の予算"></td><td data-cum="'+i+'">'+yen(cum)+'</td></tr>'}
 $("iab").innerHTML=(list.length>1?'<h3>登録した期</h3><div class="ia-card">'+list.map(function(k){return'<button type="button" class="ia-b" style="margin:0 6px 6px 0" data-a="useper" data-p="'+k+'">'+esc(PER[k].name)+(ACC.active===k?"（使用中）":"")+'</button>'}).join("")+'</div>':"")+
 '<h3>半期の予算</h3><div class="ia-card"><div class="ia-row"><div><label for="ibn">期の名前</label><input id="ibn" value="'+esc(B.name)+'"></div><div><label for="ibs">はじまりの日（第1週の初日）</label><input id="ibs" type="date" value="'+B.start+'"></div><div><label for="ibt">半期の予算</label><input id="ibt" class="num" inputmode="numeric" value="'+(B.total?Math.round(B.total).toLocaleString("ja-JP"):"")+'" placeholder="0"></div></div>'+
 '<p class="ia-note">期間：'+md(B.start)+'〜'+md(add(B.start,181))+'（26週・182日）。週は「はじまりの日」と同じ曜日から始まります。</p>'+
 '<button type="button" class="ia-b" data-a="even">半期の予算を26週に均等に割る</button></div>'+
 '<h3>26週の予算<small>右の数字は、その週までの積み上げ</small></h3><div class="ia-card ia-tw"><table><tr><th>週</th><th>期間</th><th>予算</th><th>累計</th></tr>'+rows+'</table>'+
 '<div class="ia-net"><span>26週の合計</span><b id="ibsum">'+yen(sum)+'</b></div><p class="ia-msg '+(Math.abs(dif)<1?"ok":"bad")+'" id="ibdif">'+difText(dif)+'</p></div>'+
 '<button type="button" class="ia-p" style="width:100%;margin-top:14px" data-a="bsave">この予算を保存して使う</button><div class="ia-msg" id="ibm" hidden></div>'+
 (p?'<button type="button" class="ia-lnk" data-a="bnew">新しい期を登録する</button>':'')}
function difText(d){return Math.abs(d)<1?"半期の予算と一致しています。":d>0?"半期の予算まで、あと "+yen(d)+" 足りません。":"半期の予算より "+yen(-d)+" 多くなっています。"}
function nextMon(){var d=new Date();d.setDate(d.getDate()+((8-d.getDay())%7));return ds(d)}
function defName(s){var d=pd(s);return d.getFullYear()+"年"+(d.getMonth()+1)+"月からの半期"}
function bRefresh(){var B=BDRAFT,sum=0,cum=0;for(var i=0;i<26;i++){sum+=num(B.weeks[i]);cum+=num(B.weeks[i]);var c=ov.querySelector('[data-cum="'+i+'"]');if(c)c.textContent=yen(cum)}
 $("ibsum").textContent=yen(sum);var d=B.total-sum,e=$("ibdif");e.textContent=difText(d);e.className="ia-msg "+(Math.abs(d)<1?"ok":"bad")}
function bSave(){var B=BDRAFT,m=$("ibm");m.hidden=false;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(B.start)||!B.total){m.className="ia-msg bad";m.textContent="はじまりの日と半期の予算を入れてください。";return}
 var o={name:B.name||defName(B.start),start:B.start,total:Math.round(B.total),weeks:B.weeks.map(function(x){return Math.round(num(x))}),updated:new Date().toISOString()};
 base().collection("periods").doc(B.start).set(o).then(function(){PER[B.start]=o;ACC.active=B.start;return base().update({active:B.start})}).then(function(){BDRAFT=null;TAB="week";main()})
 .catch(function(){m.className="ia-msg bad";m.textContent="保存できませんでした。通信を確かめて、もう一度押してください。"})}

/* 傾向 */
function rTrend(){var p=per();if(!p)return needPer();var ci=Math.min(25,curIdx(p));if(ci<0){$("iab").innerHTML='<p class="ia-note" style="margin-top:16px">期がはじまると、ここに週ごとの傾向が出ます。</p>';return}
 var rows=[],W=[];for(var i=0;i<=ci;i++){var w=wk(p,i),a=wkActual(p,i);rows.push({w:w,a:a})}
 var done=rows.filter(function(r,i){return i<ci&&r.a.n>0});
 var avg=done.length?done.reduce(function(s,r){return s+(r.w.budget>0?r.a.sum/r.w.budget:0)},0)/done.length:null;
 var last4=done.slice(-4),avg4=last4.length?last4.reduce(function(s,r){return s+(r.w.budget>0?r.a.sum/r.w.budget:0)},0)/last4.length:null;
 var wdS=[0,0,0,0,0,0,0],wdN=[0,0,0,0,0,0,0];rows.forEach(function(r){r.a.by.forEach(function(v,k){if(v!=null){wdS[k]+=v;wdN[k]++}})});
 var wdA=wdS.map(function(s,k){return wdN[k]?s/wdN[k]:null}),best=-1,bv=-1;wdA.forEach(function(v,k){if(v!=null&&v>bv){bv=v;best=k}});
 var hit=done.filter(function(r){return r.a.sum>=r.w.budget&&r.w.budget>0}).length;
 var ins=[];if(avg!=null)ins.push("終わった"+done.length+"週の平均達成率は "+Math.round(avg*1000)/10+"%、予算を達成した週は "+hit+"週です。");
 if(avg4!=null&&done.length>=5)ins.push("直近4週の平均は "+Math.round(avg4*1000)/10+"%で、"+(avg4>=avg?"全体の平均より上向きです。":"全体の平均より下向きです。"));
 if(best>=0)ins.push("いちばん売れる曜日は"+wd(add(p.start,best))+"曜日（平均 "+yen(bv)+"）です。");
 if(done.length>=2){var l=done[done.length-1],pv=done[done.length-2];ins.push("先週は前の週と比べて "+(pv.a.sum>0?(l.a.sum>=pv.a.sum?"+":"")+Math.round((l.a.sum/pv.a.sum-1)*1000)/10+"%":"—")+"でした。")}
 var IS=itemStats(p,ci);if(IS.top.length)ins.push((TP==="week"?"今週":TP==="4w"?"直近4週":"この期")+"いちばん売れた商品は「"+IS.top[0].name+"」（"+IS.top[0].qty+"点）、点数が多い分類は"+IS.cats[0][0]+"です。");
 if(!ins.length)ins.push("売上を入れていくと、週ごとの傾向がここに出ます。");
 $("iab").innerHTML='<h3>わかったこと</h3><div class="ia-card"><ul style="margin:0;padding-left:1.2em;font-size:.86rem;line-height:1.8">'+ins.map(function(t){return"<li>"+esc(t)+"</li>"}).join("")+'</ul></div>'+
 '<h3>売れた商品<small>会計ごとに選んだ商品から</small></h3>'+itemSection(p,ci)+
 '<h3>週ごとの予算と売上</h3><div class="ia-card">'+svgWeeks(rows,ci)+'</div>'+
 '<h3>曜日別の平均売上</h3><div class="ia-card">'+svgWd(p,wdA)+'</div>'+
 '<h3>週ごとの数字</h3><div class="ia-card ia-tw"><table><tr><th>週</th><th>予算</th><th>売上</th><th>達成率</th><th>前週比</th></tr>'+
 rows.map(function(r,i){var pv=i?rows[i-1].a.sum:0;return'<tr class="'+(i===ci?"cur":"")+'"><td>第'+(i+1)+'週 '+md(r.w.start)+'</td><td>'+yen(r.w.budget)+'</td><td>'+(r.a.n?yen(r.a.sum):"—")+'</td><td>'+(r.a.n?pct(r.a.sum,r.w.budget):"—")+'</td><td>'+(i&&pv>0&&r.a.n?((r.a.sum>=pv?"+":"")+Math.round((r.a.sum/pv-1)*1000)/10+"%"):"—")+'</td></tr>'}).reverse().join("")+'</table></div>'}
/* 売れた商品の集計（期間：今週・直近4週・この期） */
var TP="4w";
function itemStats(p,ci){var from=TP==="week"?ci:TP==="4w"?Math.max(0,ci-3):0,a=add(p.start,from*7),b=add(p.start,ci*7+6),M={},C={},nE=0,nI=0;
 Object.keys(DAYS).forEach(function(d){if(d<a||d>b)return;entries(d).forEach(function(e){nE++;var it=e.items||[];if(it.length)nI++;var seen={};
  it.forEach(function(x){var k=x.jan||("n:"+x.name),q=Math.max(1,num(x.qty));if(!M[k])M[k]={jan:x.jan,name:x.name,cat:x.cat||"その他",price:num(x.price),qty:0,n:0};M[k].qty+=q;if(!seen[k]){M[k].n++;seen[k]=1}C[x.cat||"その他"]=(C[x.cat||"その他"]||0)+q})})});
 var top=Object.keys(M).map(function(k){return M[k]}).sort(function(x,y){return y.qty-x.qty||y.n-x.n}).slice(0,10);
 var cats=Object.keys(C).map(function(k){return[k,C[k]]}).sort(function(x,y){return y[1]-x[1]});return{top:top,cats:cats,nE:nE,nI:nI,M:M,a:a,b:b}}
function itemSection(p,ci){var S=itemStats(p,ci),tq=S.cats.reduce(function(t,c){return t+c[1]},0),T=window.IDEA_TREND;
 var seg='<div class="ia-tab2" style="grid-template-columns:repeat(3,1fr);margin-bottom:10px">'+[["week","今週"],["4w","直近4週"],["all","この期"]].map(function(x){return'<button type="button" data-a="tp" data-p="'+x[0]+'" class="'+(TP===x[0]?"on":"")+'">'+x[1]+'</button>'}).join("")+'</div>';
 if(!S.nI)return seg+'<div class="ia-card"><p class="ia-note" style="margin:0">'+md(S.a)+'〜'+md(S.b)+'に、商品を選んだ会計はまだありません。「入力」で会計ごとに売った商品を選ぶと、ここに出ます。</p></div>';
 var COL=["#9f2a37","#c4636e","#e0a3aa","#7d7778","#b9b2b3","#e3dfdf","#5e1a22","#d9c2c5"];
 var bar='<div style="display:flex;height:14px;border-radius:999px;overflow:hidden;margin:6px 0 8px">'+S.cats.map(function(c,i){return'<span style="width:'+(c[1]/tq*100)+'%;background:'+COL[i%COL.length]+'" title="'+esc(c[0])+'"></span>'}).join("")+'</div>'+
  '<div style="display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.76rem">'+S.cats.map(function(c,i){return'<span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;background:'+COL[i%COL.length]+'"></i>'+esc(c[0])+' '+c[1]+'点（'+Math.round(c[1]/tq*100)+'%）</span>'}).join("")+'</div>';
 var net="";if(T&&T.top){var hit=T.top.filter(function(x){return S.M[x.jan]}),miss=T.top.filter(function(x){return!S.M[x.jan]}).slice(0,3);
  net='<p class="ia-note">ネットの売れ筋（生活雑貨）上位10件のうち、この期間に店で売れたのは '+hit.length+'件です。'+(miss.length?'まだ店で売れていない上位：'+miss.map(function(x){return esc(x.name)}).join("、")+'。売場やおすすめで目に入るようにすると伸びしろがあります。':'')+'</p>'}
 return seg+'<div class="ia-card"><div style="font-size:.78rem;color:#7d7778">'+md(S.a)+'〜'+md(S.b)+'・商品を選んだ会計 '+S.nI+'件／全'+S.nE+'件</div>'+
  '<div style="font-weight:700;font-size:.86rem;margin-top:10px">分類ごとの点数</div>'+bar+
  '<div style="font-weight:700;font-size:.86rem;margin-top:14px">よく売れた商品</div><div class="ia-rk" style="margin-top:6px">'+S.top.map(function(x,i){return'<a href="'+(x.jan?'https://www.muji.com/jp/ja/store/cmdty/detail/'+esc(x.jan):'#')+'" target="_blank" rel="noopener"><i>'+(i+1)+'</i><span style="white-space:normal"><b>'+esc(x.name)+'</b><small>'+esc(x.cat)+'・'+x.n+'件の会計</small></span><span>'+x.qty+'点</span></a>'}).join("")+'</div>'+net+'</div>'}
function svgWeeks(rows,ci){var W=380,H=190,pad=16,n=rows.length,bw=(W-pad*2)/Math.max(n,1),mx=1;rows.forEach(function(r){mx=Math.max(mx,r.w.budget,r.a.sum)});mx*=1.12;var y=function(v){return H-24-(H-44)*v/mx};
 var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="週ごとの予算と売上"><line x1="'+pad+'" y1="'+(H-24)+'" x2="'+(W-pad)+'" y2="'+(H-24)+'" stroke="#e3dfdf"/>',pts=[];
 rows.forEach(function(r,i){var x=pad+bw*i;if(r.a.n)s+='<rect x="'+(x+bw*.2)+'" y="'+y(r.a.sum)+'" width="'+bw*.6+'" height="'+Math.max(1,H-24-y(r.a.sum))+'" fill="'+(r.a.sum>=r.w.budget?"#9f2a37":"#c98a92")+'" rx="3"/>';pts.push((x+bw/2)+","+y(r.w.budget));
  if(n<=13||i%2===0||i===ci)s+='<text x="'+(x+bw/2)+'" y="'+(H-8)+'" text-anchor="middle" font-size="11" fill="'+(i===ci?"#9f2a37":"#7d7778")+'">'+(i+1)+'</text>'});
 s+='<polyline points="'+pts.join(" ")+'" fill="none" stroke="#333" stroke-width="1.6" stroke-dasharray="4 3"/>';
 return s+'</svg><p class="ia-note" style="margin-top:4px">棒が売上、点線が予算。数字は第何週か。濃い棒は予算を達成した週です。</p>'}
function svgWd(p,v){var W=380,H=160,pad=16,bw=(W-pad*2)/7,mx=1;v.forEach(function(x){if(x)mx=Math.max(mx,x)});mx*=1.15;var y=function(x){return H-24-(H-44)*x/mx};
 var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="曜日別の平均売上"><line x1="'+pad+'" y1="'+(H-24)+'" x2="'+(W-pad)+'" y2="'+(H-24)+'" stroke="#e3dfdf"/>';
 for(var k=0;k<7;k++){var x=pad+bw*k,d=add(p.start,k);if(v[k]!=null)s+='<rect x="'+(x+bw*.25)+'" y="'+y(v[k])+'" width="'+bw*.5+'" height="'+Math.max(1,H-24-y(v[k]))+'" fill="#9f2a37" rx="3"/><text x="'+(x+bw/2)+'" y="'+(y(v[k])-5)+'" text-anchor="middle" font-size="11" fill="#333">'+(v[k]>=10000?Math.round(v[k]/1000)+"千":Math.round(v[k]))+'</text>';
  s+='<text x="'+(x+bw/2)+'" y="'+(H-8)+'" text-anchor="middle" font-size="12" fill="#7d7778">'+wd(d)+'</text>'}
 return s+'</svg>'}

/* 売れ筋 */
function rRank(){var T=window.IDEA_TREND;if(!T){$("iab").innerHTML='<p class="ia-note" style="margin-top:16px">売れ筋のデータがまだありません。</p>';return}
 var at=pd(T.at),lab=(at.getMonth()+1)+"月"+at.getDate()+"日時点";
 var item=function(it,k,extra){return'<a href="https://www.muji.com/jp/ja/store/cmdty/detail/'+esc(it.jan)+'" target="_blank" rel="noopener"><i>'+k+'</i><span style="white-space:normal"><b>'+esc(it.name)+'</b><small>'+esc(extra||"")+'</small></span><span>'+yen(it.price)+(it.from?"〜":"")+'</span></a>'};
 $("iab").innerHTML='<h3>今週の売れ筋（生活雑貨）<small>'+lab+'・ネットストア</small></h3><div class="ia-rk">'+T.top.map(function(it,i){return item(it,i+1,it.cats.join("・"))}).join("")+'</div>'+
 '<p class="ia-note">'+esc(T.method)+'。もとのデータは、ネットストアの生活雑貨6カテゴリの「人気順」です。毎週水曜に更新します。</p>'+
 T.cats.map(function(c){return'<h3>'+esc(c.name)+'<small>人気順</small></h3><div class="ia-rk">'+c.items.map(function(it){return item(it,it.rank,"")}).join("")+'</div>'}).join("")}

/* ---------- 操作 ---------- */
function onClick(e){var b=e.target.closest("[data-a]");if(!b)return;var a=b.getAttribute("data-a");
 if(a==="close")close();
 else if(a==="logout"){try{sessionStorage.removeItem("idea-ia-user")}catch(x){}U=null;ACC=null;PER={};DAYS={};BDRAFT=null;IDATE=null;LMODE="login";loginView()}
 else if(a==="lm"){LMODE=b.getAttribute("data-m");loginView()}
 else if(a==="tab"){TAB=b.getAttribute("data-t");if(TAB==="budget")BDRAFT=null;main();ov.scrollTop=0}
 else if(a==="tax"){var t=num($("iat").value);$("iax").value=Math.round(t*10/110).toLocaleString("ja-JP");$("ianet").textContent=yen(calc())}
 else if(a==="save")saveDay();
 else if(a==="pick"){IDATE=b.getAttribute("data-d");IEDIT=null;IITEMS=[];IQ="";rInput()}
 else if(a==="del"){if(!b.dataset.sure){b.dataset.sure="1";b.textContent="もう一度押すと消します";return}delEntry()}
 else if(a==="edit"){IEDIT=b.getAttribute("data-e");var EE=entries($("iad").value).filter(function(x){return x.id===IEDIT})[0];IITEMS=EE&&EE.items?JSON.parse(JSON.stringify(EE.items)):[];IQ="";rInput();var t=$("iat");if(t)t.scrollIntoView({block:"center"})}
 else if(a==="cancel"){IEDIT=null;IITEMS=[];IQ="";rInput()}
 else if(a==="addi"){e.preventDefault();var j=b.getAttribute("data-j"),x=idx().filter(function(r){return r.jan===j})[0];if(x){var f=IITEMS.filter(function(y){return y.jan===j})[0];if(f)f.qty++;else IITEMS.push({jan:x.jan,name:x.name,cat:x.cat,price:x.price,qty:1})}IQ="";var q=$("iaq");if(q)q.value="";redrawItems()}
 else if(a==="free"){var nm=IQ.trim();if(nm){IITEMS.push({jan:"",name:nm,cat:"その他",price:0,qty:1});IQ="";var q2=$("iaq");if(q2)q2.value="";redrawItems()}}
 else if(a==="qp"){IITEMS[+b.getAttribute("data-i")].qty++;redrawItems()}
 else if(a==="qm"){var it=IITEMS[+b.getAttribute("data-i")];it.qty=Math.max(1,it.qty-1);redrawItems()}
 else if(a==="rmi"){IITEMS.splice(+b.getAttribute("data-i"),1);redrawItems()}
 else if(a==="tp"){TP=b.getAttribute("data-p");rTrend()}
 else if(a==="even"){var B=BDRAFT,t=Math.round(B.total),u=Math.floor(t/26/1000)*1000;for(var i=0;i<26;i++)B.weeks[i]=u;B.weeks[25]=t-u*25;rBudget()}
 else if(a==="bsave")bSave();
 else if(a==="bnew"){var st=add(per().start,182);BDRAFT={name:defName(st),start:st,total:0,weeks:[]};for(var j=0;j<26;j++)BDRAFT.weeks.push(0);rBudget()}
 else if(a==="useper"){var k=b.getAttribute("data-p");ACC.active=k;base().update({active:k}).catch(function(){});BDRAFT=null;rBudget()}}
function onInput(e){var t=e.target;
 if(t.id==="iad"){IDATE=t.value;IEDIT=null;IITEMS=[];IQ="";rInput();return}
 if(t.id==="iaq"){IQ=t.value;var r=$("iar");if(r)r.innerHTML=resHtml(search(IQ));return}
 if(/^ia(t|x|sh|w|o)$/.test(t.id)){var n=$("ianet");if(n)n.textContent=yen(calc());return}
 if(!BDRAFT)return;
 if(t.id==="ibn")BDRAFT.name=t.value;
 else if(t.id==="ibs"){BDRAFT.start=t.value;if(/^\d{4}-\d{2}-\d{2}$/.test(t.value))rBudget();return}
 else if(t.id==="ibt"){BDRAFT.total=num(t.value);bRefresh()}
 else if(t.hasAttribute("data-w")){BDRAFT.weeks[+t.getAttribute("data-w")]=num(t.value);bRefresh()}}

/* ---------- 入口：ヘッダーと、はじめの画面の右上 ---------- */
var hb=document.querySelector("h1 .hbt"),th=$("thb");
if(hb&&!$("iaheader")){var b=document.createElement("button");b.id="iaheader";b.className="hb";b.type="button";b.setAttribute("aria-label","IA モード");b.innerHTML=IC.replace('aria-hidden="true"','width="22" height="22" aria-hidden="true"')+"IA";b.onclick=open;hb.insertBefore(b,th&&th.parentNode===hb?th:null)}
var home=$("ideahome");if(home&&!home.querySelector(".phia")){var c=document.createElement("button");c.type="button";c.className="phia";c.setAttribute("aria-label","IA モードに入る");c.innerHTML=IC+"IA";c.onclick=open;home.appendChild(c)}
window.ideaIA={open:open,close:close};
})();
