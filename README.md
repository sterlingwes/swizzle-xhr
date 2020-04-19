# swizzle-xhr

Allows for intercepting requests made with XMLHttpRequest and transforming the response.

Example usage

```html
<script src="./swizzle-min.js"></script>
<script>
  const responseTransform = (xhr) => {
    const responseText = xhr.responseText.replace(/"followers":\s+?[0-9]+,/, '"followers":20000000,')
    return { responseText }
  }

  const urlFilter = /github.com/

  window.XMLHttpRequest = swizzleXHR({ responseTransform, urlFilter })

  //
  // later, in app land...
  //
  const myRequest = new XMLHttpRequest()
  myRequest.onload = () => {
    const githubUser = JSON.parse(myRequest.responseText)
    console.log('My followers:', githubUser.followers) // 2 million github followers 🎉 wow
  }
  myRequest.open('GET', 'https://api.github.com/users/sterlingwes')
  myRequest.send()
</script>
```

See [API docs](API.md) for detail.

## Use case / Caveats

Built initially for building a chrome extension in an effort to avoid relying on DOM layout to affect a content change. In this case, the page content I wanted to transform was reflected verbatim from the API response, so transforming the response seemed like the least brittle method, and made available more useful information than the UI did.

I do not recommend publishing a chrome extension with this included as it could be seen as a nefarious sidestep of extension sandboxing (host page vs. contentscript isolation).

Important caveat: the newer `fetch()` API does not leverage XMLHttpRequest, so you'd have to replace that in a similar way to get full coverage of browser request methods.
