!function(){"use strict";window.swizzleXHR=function({responseTransform:t,urlFilter:e}){const n=window.XMLHttpRequest;return function(){let o=new n,s={};const r={},c=()=>t&&(!e||e.test(o.responseURL)),i=e=>{const n=this,o=()=>r[e].apply(n,arguments);c()?Promise.resolve(t(n)).then(t=>{s=t,o()}):o()},u={onload:function(){i("onload")},onreadystatechange:function(){4===this.readyState&&i("onreadystatechange")}},f=new Proxy(o,{get:function(t,e,n){return s[e]?s[e]:"function"==typeof t[e]?t[e].bind(o):Reflect.get(t,e)},set:function(t,e,n){const o=u[e];return o?(r[e]=n,Reflect.set(t,e,o)):Reflect.set(t,e,n)}});return f}}}();
