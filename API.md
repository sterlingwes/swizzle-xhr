## Functions

<dl>
<dt><a href="#swizzleXHR">swizzleXHR(options)</a> ⇒ <code>XMLHttpRequest</code></dt>
<dd><p>swizzleXHR replaces XMLHttpRequest with a proxy that allows for
intercepting &amp; transforming responses</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#XMLHttpFieldOverrides">XMLHttpFieldOverrides</a> : <code>Object</code></dt>
<dd><p>Based on <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest">https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest</a></p>
</dd>
<dt><a href="#ResponseTransform">ResponseTransform</a> ⇒ <code><a href="#XMLHttpFieldOverrides">XMLHttpFieldOverrides</a></code> | <code><a href="#XMLHttpFieldOverrides">Promise.&lt;XMLHttpFieldOverrides&gt;</a></code></dt>
<dd></dd>
<dt><a href="#SwizzleOptions">SwizzleOptions</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="swizzleXHR"></a>

## swizzleXHR(options) ⇒ <code>XMLHttpRequest</code>
swizzleXHR replaces XMLHttpRequest with a proxy that allows for
intercepting & transforming responses

**Kind**: global function  
**Returns**: <code>XMLHttpRequest</code> - a wrapped instance of XMLHttpRequest via a Proxy  

| Param | Type |
| --- | --- |
| options | [<code>SwizzleOptions</code>](#SwizzleOptions) | 

<a name="XMLHttpFieldOverrides"></a>

## XMLHttpFieldOverrides : <code>Object</code>
Based on https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [responseText] | <code>string</code> | ie: stringified JSON |
| [responseType] | <code>string</code> | ararybuffer, blob, document, json, text (XMLHttpRequestResponseType) |
| [responseURL] | <code>string</code> | original request URL, likely resolved for redirects (?) |
| [status] | <code>number</code> | response status code |
| [statusText] | <code>string</code> | standard response text ie: "200 OK" |

<a name="ResponseTransform"></a>

## ResponseTransform ⇒ [<code>XMLHttpFieldOverrides</code>](#XMLHttpFieldOverrides) \| [<code>Promise.&lt;XMLHttpFieldOverrides&gt;</code>](#XMLHttpFieldOverrides)
**Kind**: global typedef  
**Returns**: [<code>XMLHttpFieldOverrides</code>](#XMLHttpFieldOverrides) \| [<code>Promise.&lt;XMLHttpFieldOverrides&gt;</code>](#XMLHttpFieldOverrides) - if the transform is async, return a promise to defer the xhr.onload call  

| Param | Type | Description |
| --- | --- | --- |
| activeXhr | <code>XMLHttpRequest</code> | the current XHR instance |

<a name="SwizzleOptions"></a>

## SwizzleOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| responseTransform | [<code>ResponseTransform</code>](#ResponseTransform) | 
| urlFilter | <code>RegExp</code> | 

