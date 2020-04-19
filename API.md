## Functions

<dl>
<dt><a href="#swizzleXHR">swizzleXHR(options)</a></dt>
<dd><p>swizzleXHR replaces XMLHttpRequest with a proxy that allows for
intercepting &amp; transforming responses</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ResponseTransform">ResponseTransform</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#SwizzleOptions">SwizzleOptions</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="swizzleXHR"></a>

## swizzleXHR(options)
swizzleXHR replaces XMLHttpRequest with a proxy that allows for
intercepting & transforming responses

**Kind**: global function  

| Param | Type |
| --- | --- |
| options | [<code>SwizzleOptions</code>](#SwizzleOptions) | 

<a name="ResponseTransform"></a>

## ResponseTransform : <code>function</code>
**Kind**: global typedef  

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

