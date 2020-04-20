window.swizzleXHR = swizzleXHR;

/**
 * @typedef {Object} XMLHttpFieldOverrides
 * Based on https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
 *
 * @property {string=} responseText ie: stringified JSON
 * @property {string=} responseType ararybuffer, blob, document, json, text (XMLHttpRequestResponseType)
 * @property {string=} responseURL original request URL, likely resolved for redirects (?)
 * @property {number=} status response status code
 * @property {string=} statusText standard response text ie: "200 OK"
 */

/**
 * @callback ResponseTransform
 * @param {XMLHttpRequest} activeXhr the current XHR instance
 * @returns {(XMLHttpFieldOverrides|Promise<XMLHttpFieldOverrides>)} if the transform is async, return a promise to defer the xhr.onload call
 */

/**
 * @typedef {Object} SwizzleOptions
 * @property {ResponseTransform=} responseTransform
 * @property {RegExp=} urlFilter
 * @property {boolean} debug extra logging
 */

/**
 * swizzleXHR replaces XMLHttpRequest with a proxy that allows for
 * intercepting & transforming responses
 *
 * @param {SwizzleOptions} options
 * @returns {XMLHttpRequest} a wrapped instance of XMLHttpRequest via a Proxy
 */
function swizzleXHR({ responseTransform, urlFilter, debug }) {
  const _XMLHttpRequest = window.XMLHttpRequest;

  const sliceArgs = (args) => Array.prototype.slice.call(args, 0);

  const log = function () {
    if (!debug) return;
    const args = sliceArgs(arguments);
    args.unshift('[swizzle-xhr]');
    console.log.apply(console, args);
  };

  /**
   * SwizzledXHR is a wrapper that represents our replacement XMLHttpRequest "class"
   * and is intended to be instantiated as any XMLHttpRequest is
   */
  // @ts-ignore - TS checks don't pickup the Proxy
  return function SwizzledXHR() {
    let realXhr = new _XMLHttpRequest();
    let xhrFieldOverrides = {};
    let debugOpenArgs;
    const originalHandlers = {};

    const shouldHandleResponse = () => {
      return responseTransform && (!urlFilter || urlFilter.test(realXhr.responseURL));
    };

    /**
     * handleResponse invokes the responseTransform when we know the request has finished
     *
     * @param {string} handlerName onload or onreadystatechange
     */
    const handleResponse = (handlerName) => {
      const activeXhr = this;
      const applyLoaded = () => originalHandlers[handlerName].apply(activeXhr, arguments);

      if (shouldHandleResponse()) {
        Promise.resolve(responseTransform(activeXhr)).then(
          /** @param {XMLHttpFieldOverrides} overrides */
          (overrides) => {
            xhrFieldOverrides = overrides;
            applyLoaded();
          },
        );
        return;
      }

      applyLoaded();
    };

    const proxiedHandlers = {
      onload: function () {
        log(debugOpenArgs, 'loaded');
        handleResponse('onload');
      },
      onreadystatechange: function () {
        log(debugOpenArgs, `readyState=${this.readyState}`);
        if (this.readyState === 4) {
          // 4=DONE request finalized
          handleResponse('onreadystatechange');
        }
      },
    };

    const proxyXhr = new Proxy(realXhr, {
      get: function (target, key) {
        if (xhrFieldOverrides[key]) {
          return xhrFieldOverrides[key];
        }

        if (debug && key === 'open') {
          return function () {
            const handlers = `method=${Object.keys(originalHandlers).join(',')}`;
            const args = sliceArgs(arguments);
            debugOpenArgs = `${args[0]}:${args[1]}`;
            log('open', handlers, debugOpenArgs);
            return target[key].apply(realXhr, arguments);
          };
        }

        if (typeof target[key] === 'function') {
          return target[key].bind(realXhr);
        }

        return Reflect.get(target, key);
      },

      set: function (target, key, value) {
        const proxied = proxiedHandlers[key];
        if (proxied) {
          originalHandlers[key] = value;
          return Reflect.set(target, key, proxied);
        }

        return Reflect.set(target, key, value);
      },
    });

    return proxyXhr;
  };
}
