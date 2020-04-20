// @ts-nocheck lots of mock'n & stub'n happenin' here

const openSpy = jest.fn();
const sendSpy = jest.fn();

const MockXhr = function () {};
MockXhr.prototype.open = openSpy;
MockXhr.prototype.send = sendSpy;

const mockWindow = () => {
  const windowMocks = {
    XMLHttpRequest: MockXhr,
  };

  global.window = windowMocks;
  Object.keys(windowMocks).forEach((key) => {
    global[key] = windowMocks[key];
  });
};

beforeEach(() => {
  mockWindow();
  require('./swizzle-min');
});

const xhrRequest = function (url = 'https://some.api') {
  const xhttp = new XMLHttpRequest();
  xhttp.responseURL = url;

  const promise = new Promise((resolve) => {
    xhttp.onload = function () {
      resolve(xhttp.responseText);
    };

    xhttp.open('GET', url, true);
    xhttp.send();
  });

  promise.mockResponse = (responseBody) => {
    xhttp.responseText = responseBody;
    xhttp.onload();
    return promise;
  };

  return promise;
};

describe('swizzleXHR', () => {
  const mockResponse = '{"hello": "world"}';

  describe('transforming', () => {
    const transformedResponse = '{"not": "what you expected"}';

    beforeEach(() => {
      const responseTransform = () => ({ responseText: transformedResponse });
      window.XMLHttpRequest = swizzleXHR({ responseTransform });
    });

    it('should return the transformed response', async () => {
      const response = await xhrRequest().mockResponse(mockResponse);
      expect(response).toEqual(transformedResponse);
    });
  });

  describe('async transforming', () => {
    let resolveTransform;
    const transformedResponse = '{"hi": "i took a while"}';
    const responseTransform = () =>
      new Promise((resolve) => {
        resolveTransform = () => resolve({ responseText: transformedResponse });
      });

    beforeEach(() => {
      window.XMLHttpRequest = swizzleXHR({ responseTransform });
    });

    describe('when not resolved', () => {
      it('should not call onload', () => {
        const onloadSpy = jest.fn();
        const xhttp = new XMLHttpRequest();
        xhttp.onload = onloadSpy;

        xhttp.open('GET', 'https://some.url', true);
        xhttp.send();

        expect(onloadSpy).not.toHaveBeenCalled();
      });
    });

    describe('when resolved', () => {
      it('should return the transformed response', async () => {
        const promise = xhrRequest().mockResponse(mockResponse);
        resolveTransform();
        const response = await promise;
        expect(response).toEqual(transformedResponse);
      });
    });
  });

  describe('url filtering', () => {
    const urlFilter = /onlythisapi.com/;
    const transformedResponse = '{"not": "what you expected"}';

    beforeEach(() => {
      const responseTransform = () => ({ responseText: transformedResponse });
      window.XMLHttpRequest = swizzleXHR({ responseTransform, urlFilter });
    });

    it('should not return the transformed response', async () => {
      const response = await xhrRequest().mockResponse(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });

  describe('w/ legacy ready state listener', () => {
    const transformedResponse = '{"still": "works"}';

    beforeEach(() => {
      const responseTransform = () => ({ responseText: transformedResponse });
      window.XMLHttpRequest = swizzleXHR({ responseTransform });
    });

    it('should behave the same', (done) => {
      // usage scenario:
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = () => {
        expect(xhttp.responseText).toEqual(transformedResponse);
        done();
      };

      xhttp.open('GET', 'https://some.url', true);
      xhttp.send();

      // event simulation:
      xhttp.readyState = 4;
      xhttp.responseText = mockResponse;
      xhttp.onreadystatechange(); // simulates event, which calls proxy method
    });
  });

  describe('w/ addEventListener', () => {
    const transformedResponse = '{"not": "what you expected"}';

    beforeEach(() => {
      const responseTransform = () => ({ responseText: transformedResponse });
      window.XMLHttpRequest = swizzleXHR({ responseTransform });
    });

    it('should behave the same', (done) => {
      // usage scenario:
      const xhttp = new XMLHttpRequest();
      xhttp.addEventListener('load', () => {
        expect(xhttp.responseText).toEqual(transformedResponse);
        done();
      });

      xhttp.open('GET', 'https://some.url', true);
      xhttp.send();

      // event simulation:
      xhttp.responseText = mockResponse;
      xhttp.onload(); // simulates event, which calls proxy method
    });
  });
});
