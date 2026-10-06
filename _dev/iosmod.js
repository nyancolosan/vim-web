/* ===== iOSアプリ版（Capacitor）：アプリの中で動くときだけ有効 ===== */
function isNative(){var C=window.Capacitor;return!!(C&&C.isNativePlatform&&C.isNativePlatform())}
function nP(n){return isNative()&&window.Capacitor.Plugins?window.Capacitor.Plugins[n]:null}
function blob64(b){return new Promise(function(res,rej){var f=new FileReader();f.onload=function(){res(String(f.result).split(",")[1])};f.onerror=rej;f.readAsDataURL(b)})}
/* 保存＝共有シート（「画像を保存」「ファイルに保存」などを選べる） */
function iosDL(){return{save:function(o){var FS=nP("Filesystem"),SH=nP("Share");if(!FS||!SH)return Promise.reject({code:"unavailable"});
 var bl=o.data instanceof Blob?o.data:new Blob([o.data],{type:"application/octet-stream"});
 return blob64(bl).then(function(b64){return FS.writeFile({path:o.filename||"vim-file",data:b64,directory:"CACHE"})}).then(function(r){return SH.share({title:o.filename,url:r.uri,dialogTitle:"保存・共有"})})
  .catch(function(e){var m=String(e&&(e.message||e.errorMessage)||"");if(/cancel/i.test(m))throw{code:"declined"};throw e})}}}
var IOS=(function(){var c=window.BIMINI_IOS||{};return{rc:c.revenuecatKey||"",ent:c.entitlement||"pro",web:c.webUrl||"",terms:c.terms||"https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",privacy:c.privacy||"privacy.html",pkg:null,active:false,end:null}})();
function iosCI(r){var ci=r&&(r.customerInfo||r);var e=ci&&ci.entitlements&&ci.entitlements.active&&ci.entitlements.active[IOS.ent];return{active:!!e,end:e&&(e.expirationDate||null),will:e?e.willRenew!==false:false}}
function iosApply(st,quiet){IOS.active=st.active;IOS.end=st.end;IOS.will=st.will;setPro(st.active,true);if(!st.active&&roleGet()==="biz")roleSet("gen",true);if(!quiet)toast(st.active?"PROが有効です":"PROは無効になっています")}
function iosUI(){var q=function(i){return document.getElementById(i)},on=IOS.active;q("billbuy").hidden=on;q("billme").hidden=!on;q("billm").textContent="";
 var p=IOS.pkg&&IOS.pkg.product;q("bpp").textContent=p?(p.priceString+"／月"):"価格を読み込んでいます…";
 if(on){var d=IOS.end?new Date(IOS.end):null;q("billst").innerHTML="<b>ご契約中：VIM PRO</b><br>"+(d?(IOS.will?"次回の更新日：":"終了日：")+d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日":"")}}
(function(){if(!isNative())return;var q=function(i){return document.getElementById(i)};document.body.classList.add("native");
 try{if(IOS.web&&!localStorage.getItem("bimini-weburl"))localStorage.setItem("bimini-weburl",IOS.web)}catch(e){}
 /* 外部リンクは、アプリ内ブラウザ（Safari）で開く */
 document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var h=a.getAttribute("href")||"";if(!/^https?:/i.test(h))return;var B=nP("Browser");if(!B)return;e.preventDefault();B.open({url:h})},true);
 var PU=nP("Purchases");if(!q("bill"))return;
 q("biost").href=IOS.terms;q("biospp").href=IOS.privacy;
 q("prob").onclick=function(){iosUI();q("bill").hidden=false};q("billx").onclick=function(){q("bill").hidden=true};
 q("roleseg").addEventListener("click",function(e){var b=e.target.closest("[data-role]");if(!b||b.getAttribute("data-role")!=="biz"||IOS.active)return;e.stopPropagation();e.preventDefault();toast("AdvisorモードはPRO（月額）で使えます。");q("thp").hidden=true;iosUI();q("bill").hidden=false},true);
 setPro(false,true);
 if(!PU||!IOS.rc){q("billm").textContent="購入の準備ができていません（設定を確認してください）。";return}
 Promise.resolve(PU.configure({apiKey:IOS.rc})).then(function(){return PU.getCustomerInfo()}).then(function(r){iosApply(iosCI(r),true)}).catch(function(){});
 Promise.resolve().then(function(){return PU.getOfferings()}).then(function(o){var cur=o&&(o.current||(o.offerings&&o.offerings.current));IOS.pkg=cur&&(cur.monthly||(cur.availablePackages||[])[0])||null;if(!q("bill").hidden)iosUI()}).catch(function(){});
 q("billbuy").addEventListener("click",function(e){var b=e.target.closest("[data-plan]");if(!b)return;e.stopImmediatePropagation();if(!IOS.pkg){q("billm").textContent="価格を読み込めませんでした。通信状況を確認してください。";return}
  busy(b,function(){return PU.purchasePackage({aPackage:IOS.pkg})}).then(function(r){var st=iosCI(r);iosApply(st);iosUI()},function(e){if(e&&(e.userCancelled||/cancel/i.test(String(e.code||e.message||""))))return;q("billm").textContent="購入できませんでした。時間をおいてもう一度お試しください。"})},true);
 q("biosr").onclick=function(){var b=this;busy(b,function(){return PU.restorePurchases()}).then(function(r){var st=iosCI(r);iosApply(st,true);iosUI();q("billm").textContent=st.active?"購入を復元しました。":"復元できる購入が見つかりませんでした。"},function(){q("billm").textContent="復元できませんでした。通信状況を確認してください。"})};
 q("biosm").onclick=function(){var B=nP("Browser"),u="https://apps.apple.com/account/subscriptions";if(B)B.open({url:u});else location.href=u};
 document.addEventListener("visibilitychange",function(){if(!document.hidden)Promise.resolve(PU.getCustomerInfo()).then(function(r){iosApply(iosCI(r),true)}).catch(function(){})})})();
