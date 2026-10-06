/* ===== 言語（日本語・English・한국어） =====
 * 画面の文字は日本語のまま作り、表示するときに辞書（I18ND）で置きかえる。
 * 文字の追加・変更は MutationObserver で拾う。キャンバスに描く文字（見積書・PDF・図面）は fillText を包んで訳す。
 * 言語を変えたら再読み込み（元の日本語に戻す手間をなくす）。 */
var I18N=(function(){var l="ja";try{l=localStorage.getItem("bimini-lang")||""}catch(e){}
 if(!/^(ja|en|ko)$/.test(l)){var n=((navigator.languages&&navigator.languages[0])||navigator.language||"ja").toLowerCase();l=n.indexOf("ja")===0?"ja":n.indexOf("ko")===0?"ko":"en"}
 return{lang:l,ix:l==="ko"?1:0,re:null,C:new Map()}})();
var JRE=/[぀-ヿ㐀-鿿！-～　-〿]/;
function i18nRe(){if(I18N.re)return I18N.re;var K=Object.keys(I18ND).filter(function(k){return k.length>1&&k.trim()}).sort(function(a,b){return b.length-a.length});
 I18N.re=new RegExp(K.map(function(k){return k.replace(/[.*+?^${}()|[\]\\\/]/g,"\\$&")}).join("|"),"g");return I18N.re}
var I18NP={"、":", ","。":". ","「":"“","」":"”","『":"“","』":"”","（":" (","）":") ","：":": ","　":" ","・":" · ","！":"! ","？":"? ","〜":"~","～":"~","＋":"+","／":"/","−":"−","…":"…","【":"[","】":"] ","※":"* "};
function tr(s){if(I18N.lang==="ja"||s==null)return s;s=String(s);if(!JRE.test(s))return s;var c=I18N.C.get(s);if(c!==undefined)return c;
 var m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s),core=m[2],o,ix=I18N.ix,e=I18ND[core];
 if(e&&(e[ix]||core.length===1))o=m[1]+e[ix]+m[3];
 else{o=s.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/g,function(_,y,mo,d){try{return new Date(+y,+mo-1,+d).toLocaleDateString(ix?"ko-KR":"en-US",{year:"numeric",month:"short",day:"numeric"})}catch(x){return y+"-"+mo+"-"+d}})
  .replace(/([\d,]+)\s*円/g,"¥$1").replace(/([\d.]+)\s*畳/g,ix?"$1다다미":"$1 tatami").replace(/([\d.]+)\s*坪/g,ix?"$1평":"$1 tsubo").replace(/[\s　]*様(?=$|[\s　])/g,ix?" 님":"");
  o=o.replace(/幅\s?/g,ix?"폭 ":"Width ").replace(/高\s?(\d)/g,"H$1").replace(/(\d+)\s*人/g,ix?"$1명":"$1 people").replace(/(\d+)\s*件/g,ix?"$1건":"$1").replace(/(\d+)\s*点/g,ix?"$1점":"$1 items").replace(/(\d+)\s*段/g,ix?"$1단":"$1 tiers");
  o=o.replace(i18nRe(),function(k){return I18ND[k][ix]});
  o=o.replace(/[、。「」『』（）：　・！？〜～＋／【】※]/g,function(k){return I18NP[k]||k});
  if(!ix)o=o.replace(/(\w?)([a-z\)\]\.,])([A-Z][a-z])/g,function(q,a,b,c){return a===""&&b==="i"?q:a+b+" "+c});o=o.replace(/ {2,}/g," ").replace(/ ([,.\)])/g,"$1").replace(/\( /g,"(")}
 if(I18N.C.size>6000)I18N.C.clear();I18N.C.set(s,o);return o}
/* 画面の文字を訳す */
var I18NSKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,NOSCRIPT:1,CODE:1};
function trAttr(n,a){var v=n.getAttribute(a);if(v&&JRE.test(v)){var t=tr(v);if(t!==v)n.setAttribute(a,t)}}
function trNode(n){if(!n)return;if(n.nodeType===3){var p=n.parentNode;if(!p||I18NSKIP[p.nodeName]||(p.closest&&p.closest("[translate=no]")))return;var v=n.nodeValue;if(!JRE.test(v))return;var t=tr(v);if(t!==v)n.nodeValue=t;return}
 if(n.nodeType!==1||I18NSKIP[n.nodeName]||n.getAttribute("translate")==="no")return;
 trAttr(n,"placeholder");trAttr(n,"aria-label");trAttr(n,"title");trAttr(n,"alt");if(n.nodeName==="OPTGROUP")trAttr(n,"label");
 if(n.nodeName==="INPUT"&&(n.type==="button"||n.type==="submit")&&JRE.test(n.value))n.value=tr(n.value);
 for(var c=n.firstChild;c;c=c.nextSibling)trNode(c)}
function i18nInit(){var L=I18N.lang;document.documentElement.lang=L;try{document.body.classList.add("lang-"+L)}catch(e){}
 [].forEach.call(document.querySelectorAll(".langseg [data-lang]"),function(b){b.className=b.getAttribute("data-lang")===L?"on":"";b.onclick=function(){var v=b.getAttribute("data-lang");try{localStorage.setItem("bimini-lang",v)}catch(e){}if(v!==I18N.lang)location.reload()}});
 if(L==="ja")return;
 document.title=tr(document.title);trNode(document.body);
 new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==="characterData")trNode(m.target);else if(m.type==="attributes")trAttr(m.target,m.attributeName);else for(var j=0;j<m.addedNodes.length;j++)trNode(m.addedNodes[j])}})
  .observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","aria-label","title","label","alt"]});
 /* キャンバスの文字（見積書・PDF・図面の画像） */
 ["fillText","strokeText","measureText"].forEach(function(f){var o=CanvasRenderingContext2D.prototype[f];CanvasRenderingContext2D.prototype[f]=function(t){var a=[].slice.call(arguments);a[0]=tr(t);return o.apply(this,a)}});
 /* ダイアログ・共有・コピー */
 ["alert","confirm","prompt"].forEach(function(f){var o=window[f];if(o)window[f]=function(t){var a=[].slice.call(arguments);a[0]=tr(t);return o.apply(window,a)}});
 if(navigator.share){var sh=navigator.share.bind(navigator);navigator.share=function(d){d=Object.assign({},d);if(d.title)d.title=tr(d.title);if(d.text)d.text=tr(d.text);return sh(d)}}
 try{if(navigator.clipboard&&navigator.clipboard.writeText){var cw=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=function(t){return cw(tr(t))}}}catch(e){}
 /* 家具を一覧から追加したとき、名前も訳しておく（あとで自分で直せる） */
 if(typeof tplItem==="function"){var ti=tplItem;tplItem=function(sm){var n=ti(sm);if(n&&n.name)n.name=tr(n.name);return n}}
 if(typeof estDate==="function")estDate=function(add){var d=new Date();d.setDate(d.getDate()+(add||0));return d.toLocaleDateString(L==="ko"?"ko-KR":"en-US",{year:"numeric",month:"short",day:"numeric"})}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",i18nInit);else i18nInit();
