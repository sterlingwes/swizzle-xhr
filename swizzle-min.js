!function(){"use strict";window.swizzleXHR=function({responseTransform:e,urlFilter:t,debug:n}){const o=window.XMLHttpRequest,s=e=>Array.prototype.slice.call(e,0),r=function(){if(!n)return;const e=s(arguments);e.unshift("[swizzle-xhr]"),console.log.apply(console,e)};return function(){let c,i=new o,a={};const u={},l=(e,t)=>{u[e]||(u[e]=[]),u[e].push(t)},f=()=>e&&(!t||t.test(i.responseURL)),d=t=>{const n=()=>{u[t]&&u[t].forEach(e=>e.apply(i,arguments))};f()?Promise.resolve(e(i)).then(e=>{a=e,n()}):n()},p={onload:function(){r(c,"loaded"),d("onload")},onreadystatechange:function(){r(c,"readyState="+this.readyState),4===this.readyState&&d("onreadystatechange")}},y=new Proxy(i,{get:function(e,t){return a[t]?a[t]:"addEventListener"===t?function(){const[t,n]=s(arguments),o="on"+t;l(o,n),Reflect.set(e,o,p[o])}:n&&"open"===t?function(){const n="method="+Object.keys(u).join(","),o=s(arguments);return c=`${o[0]}:${o[1]}`,r("open",n,c),e[t].apply(i,arguments)}:"function"==typeof e[t]?e[t].bind(i):Reflect.get(e,t)},set:function(e,t,n){const o=p[t];return o?(l(t,n),Reflect.set(e,t,o)):Reflect.set(e,t,n)}});return y}}}();
