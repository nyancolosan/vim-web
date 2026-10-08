/* ===== Web版のAI（v4.5）：Claude 内の sample と同じ形（SMPL.json / limits）で、サーバー（/api/ai）経由の Claude を使う =====
 * サーバーに ANTHROPIC_API_KEY が入っているときだけ有効。有料会員のみ・1日の回数上限はサーバーで管理。 */
var WEBAI={on:false,hold:0,msg:""};
function webaiImg(b){return new Promise(function(res,rej){var u=URL.createObjectURL(b),im=new Image();im.onload=function(){try{var M=1280,s=Math.min(1,M/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.naturalWidth*s));c.height=Math.max(1,Math.round(im.naturalHeight*s));
 var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res({type:"image/jpeg",data:c.toDataURL("image/jpeg",.86).split(",")[1]})}catch(e){rej({code:"image_rejected"})}};im.onerror=function(){URL.revokeObjectURL(u);rej({code:"image_rejected"})};im.src=u})}
function webaiSay(m){WEBAI.msg=m;WEBAI.hold=Date.now()+2500;toast(m)}
var WEBAI_S={limits:function(){return Promise.resolve({images:{maxCount:4}})},
 json:function(input,opts){opts=opts||{};var pr=typeof input==="string"?input:JSON.stringify(input);
  return Promise.all((opts.images||[]).slice(0,4).map(webaiImg)).then(function(imgs){return fetch(BILL.api+"/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lid:billLid(true),prompt:pr,images:imgs,tier:opts.modelTier||""})})})
  .then(function(r){return r.json().catch(function(){return{error:"ai_error"}}).then(function(j){if(r.ok&&j&&j.data)return j.data;var c=(j&&j.error)||"ai_error";
   if(c==="not_paid"){webaiSay("AI機能は有料プラン（Plus・Pro）で使えます。");throw{code:"handled"}}
   if(c==="quota"){webaiSay("今日のAIの回数（"+(j.detail||"")+"回）を使い切りました。明日また使えます。");throw{code:"handled"}}
   if(c==="ai_disabled")throw{code:"sampling_disabled"};throw{code:c}})},function(e){if(e&&e.code)throw e;throw{code:"ai_error"}})}};
(function(){if(typeof toast==="function"){var _t=toast;toast=function(m){if(WEBAI.hold&&Date.now()<WEBAI.hold&&m!==WEBAI.msg)return;return _t.apply(this,arguments)}}
 if(window.claude&&window.claude.use)return;if(typeof billOn!=="function"||!billOn())return;
 fetch(BILL.api+"/ai/status").then(function(r){return r.json()}).then(function(j){if(!j||!j.on)return;WEBAI.on=true;SMPL=WEBAI_S;SMPLIMG=true;SMPLLIM={maxCount:4};document.body.classList.add("ai");
  var v="1";try{v=localStorage.getItem("bimini-beta")||"1"}catch(e){}betaSet(v==="1")}).catch(function(){})})();
