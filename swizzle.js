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

const xhrFields = ['responseText', 'responseType', 'responseURL', 'status', 'statusText'];

/**
 * Ensure only valid XMLHttpRequest fields can be returned from
 * the responseTransform function
 *
 * @param {XMLHttpFieldOverrides} fieldOverrides
 */
const pickValidValues = (fieldOverrides) => {
  const providedOverrides = fieldOverrides || {};
  const overrides = {};
  xhrFields.forEach((field) => {
    if (field in providedOverrides) {
      overrides[field] = providedOverrides[field];
    }
  });
  return overrides;
};

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

  /** @param {arguments} args */
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

    /**
     * @param {string} name
     * @param {function|{ handleEvent: function }} handler
     */
    const addHandler = (name, handler) => {
      if (!originalHandlers[name]) originalHandlers[name] = [];
      originalHandlers[name].push(handler);
    };

    const shouldHandleResponse = () => {
      return responseTransform && (!urlFilter || urlFilter.test(realXhr.responseURL));
    };

    /**
     * handleResponse invokes the responseTransform when we know the request has finished
     *
     * @param {string} handlerName onload or onreadystatechange
     * @param {Event} evt
     */
    const handleResponse = (handlerName, evt) => {
      const applyLoaded = () => {
        if (!originalHandlers[handlerName]) {
          log(`handleResponse called with no handler set for ${handlerName}`);
          return;
        }

        originalHandlers[handlerName].forEach((handler) => {
          if (typeof handler.handleEvent === 'function') {
            handler.handleEvent(evt);
            return;
          }

          if (typeof handler !== 'function') {
            log('encountered unexpected handler', handlerName, handler);
            return;
          }

          handler.call(realXhr, evt);
        });
      };

      if (shouldHandleResponse()) {
        Promise.resolve(responseTransform(realXhr)).then(
          /** @param {XMLHttpFieldOverrides} overrides */
          (overrides) => {
            xhrFieldOverrides = pickValidValues(overrides);
            try {
              applyLoaded();
            } catch (e) {
              log('applyLoaded() encountered error', e);
            }
          },
        );
        return;
      }

      applyLoaded();
    };

    const proxiedHandlers = {
      onload: function (evt) {
        log(debugOpenArgs, 'loaded');
        handleResponse('onload', evt);
      },
      onreadystatechange: function (evt) {
        log(debugOpenArgs, `readyState=${this.readyState}`);
        if (this.readyState === 4) {
          // 4=DONE request finalized
          handleResponse('onreadystatechange', evt);
        }
      },
    };

    // set default handlers
    Object.keys(proxiedHandlers).forEach((key) => {
      realXhr[key] = proxiedHandlers[key];
    });

    const proxyXhr = new Proxy(realXhr, {
      get: function (target, key, receiver) {
        if (xhrFieldOverrides[key]) {
          return xhrFieldOverrides[key];
        }

        if (key === 'response' && xhrFieldOverrides.responseText) {
          return xhrFieldOverrides.responseText;
        }

        if (key === 'addEventListener') {
          return function () {
            const [eventName, handler] = sliceArgs(arguments);
            const setterName = `on${eventName}`;
            let eventListener = {};
            if (typeof handler === 'function') {
              eventListener.handleEvent = handler;
            }
            addHandler(setterName, eventListener);
          };
        }

        if (debug && key === 'open') {
          return function () {
            const handlers = `method=${
              Object.keys(originalHandlers).join(',') || 'addEventListener'
            }`;
            const args = sliceArgs(arguments);
            debugOpenArgs = `${args[0]}:${args[1]}`;
            log('open', handlers, debugOpenArgs);
            return target[key].apply(realXhr, arguments);
          };
        }

        const value = Reflect.get(target, key);
        return typeof value === 'function' ? value.bind(target) : value;
      },

      set: function (target, key, value) {
        const proxied = proxiedHandlers[key];
        if (proxied) {
          // @ts-ignore we know key is a string here
          addHandler(key, value);
          return Reflect.set(target, key, proxied);
        }

        return Reflect.set(target, key, value);
      },
    });

    return proxyXhr;
  };
}
