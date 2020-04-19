window.swizzleXhr = swizzleXhr;

function swizzleXhr({ responseTransform }) {
  const _XMLHttpRequest = window.XMLHttpRequest;

  return function SwizzledXHR() {
    let container = this;

    container.loadHandler = function () {
      const activeXhr = this;
      if (container.originalLoadHandler) {
        container.responseText = responseTransform(activeXhr);
        container.originalLoadHandler.apply(activeXhr, arguments);
      }
    };

    let realXhr = new _XMLHttpRequest();

    const proxyXhr = new Proxy(realXhr, {
      get: function (target, key, receiver) {
        if (key === 'responseText' && container.responseText) {
          return container.responseText;
        }

        if (typeof target[key] === 'function') {
          return target[key].bind(realXhr);
        }

        return Reflect.get(target, key);
      },

      set: function (target, key, value) {
        if (key === 'onload') {
          container.originalLoadHandler = value;
          return Reflect.set(target, key, container.loadHandler);
        }
        return Reflect.set(target, key, value);
      },
    });

    return proxyXhr;
  };
}
