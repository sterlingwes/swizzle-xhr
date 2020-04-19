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
 * @property {ResponseTransform} responseTransform
 * @property {RegExp} urlFilter
 */

/**
 * swizzleXHR replaces XMLHttpRequest with a proxy that allows for
 * intercepting & transforming responses
 *
 * @param {SwizzleOptions} options
 * @returns {XMLHttpRequest} a wrapped instance of XMLHttpRequest via a Proxy
 */
function swizzleXHR({ responseTransform, urlFilter }) {
  const _XMLHttpRequest = window.XMLHttpRequest;

  /**
   * SwizzledXHR is a wrapper that represents our replacement XMLHttpRequest "class"
   * and is intended to be instantiated as any XMLHttpRequest is
   */
  // @ts-ignore - TS checks don't pickup the Proxy
  return function SwizzledXHR() {
    let container = this;
    let realXhr = new _XMLHttpRequest();
    let xhrFieldOverrides = {};

    const shouldHandleResponse = () => {
      return responseTransform && (!urlFilter || urlFilter.test(realXhr.responseURL));
    };

    container.applyLoaded = function () {
      const activeXhr = this;
    };

    container.loadHandler = function () {
      const activeXhr = this;
      const applyLoaded = () => container.originalLoadHandler.apply(activeXhr, arguments);

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

    const proxyXhr = new Proxy(realXhr, {
      get: function (target, key, receiver) {
        if (xhrFieldOverrides[key]) {
          return xhrFieldOverrides[key];
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
