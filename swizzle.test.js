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
      const responseTransform = (xhr) => transformedResponse;
      window.XMLHttpRequest = swizzleXHR({ responseTransform });
    });

    it('should return the transformed response', async () => {
      const response = await xhrRequest().mockResponse(mockResponse);
      expect(response).toEqual(transformedResponse);
    });
  });

  describe('url filtering', () => {
    const urlFilter = /onlythisapi.com/;
    const transformedResponse = '{"not": "what you expected"}';

    beforeEach(() => {
      const responseTransform = (xhr) => transformedResponse;
      window.XMLHttpRequest = swizzleXHR({ responseTransform, urlFilter });
    });

    it('should not return the transformed response', async () => {
      const response = await xhrRequest().mockResponse(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
