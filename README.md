## swizzle-xhr

Allows for intercepting requests made with XMLHttpRequest and transforming the response.

See [API docs](API.md) for usage.

### Use case / Caveats

Built initially for building a chrome extension in an effort to avoid relying the dom layout to affect a content change. In this case, the page content I wanted to transform was reflected verbatim from the API response, so transforming the response seemed like the least brittle method, and made available more useful information than the UI did.

I do not recommend publishing a chrome extension with this included as it could be seen as a nefarious sidestep of extension sandboxing (host page vs. contentscript isolation).

Important caveat: the newer `fetch()` API does not leverage XMLHttpRequest, so you'd have to replace that in a similar way to get full coverage of browser request methods.
