# Api

Small wrapper around the native [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API.

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

```js
import { Api } from '@thepassle/app-tools/api.js';

/** Using defaults: */
const api = new Api();

/** Or with configuration: */
const api = new Api({
  baseURL: 'https://api.foo.com',
  responseType: 'text',
  plugins: [
    {
      beforeFetch: ({url, headers, fetchFn, responseType, baseURL, method, opts, data}) => {},
      afterFetch: (res) => res,
      transform: (data) => data,
      handleError: (e) => true
    }
  ]
});

const user = await api.get('/users/1');
await api.post('/form/submit', { name: 'John Doe', email: 'johndoe@internet.com' });

try {
  await api.get('/foo');
} catch(e) {
  console.log(e); // StatusError
  e.message; // the `statusText` of the `response`
  e.response; // access the `response`
}
```

### Error Handling

By default `api` will throw an error if a response is not ok (`!response.ok`). If this is the case, it will throw a `StatusError`. The `StatusError` is thrown with the `response.statusText` as message, and also has the actual `response` available on it: `e.response`.

## Composable

Use plugins to customize your requests to fit your needs

### `logger`

```js
import { logger, loggerPlugin } from '@thepassle/app-tools/api/plugins/logger.js';

/** Logs metadata to the console */
api.get(url, {plugins: [logger]});

/** Or */
const logger = loggerPlugin({collapsed: false});
api.get(url, {plugins: [logger]});
```

### `cache`

```js
import { cache, cachePlugin } from '@thepassle/app-tools/api/plugins/cache.js';

/** Caches the response for a default of 10 minutes */
api.get(url, {plugins: [cache]});

/** Or */
const cache = cachePlugin({maxAge: 1000});
api.get(url, {plugins: [cache]});
```

### `debounce`

```js
import { debounce, debouncePlugin } from '@thepassle/app-tools/api/plugins/debounce.js';

/** Debounces the response for a default of 1000 ms */
api.get(url, {plugins: [debounce]});

/** Or */
const debounce = debouncePlugin({maxAge: 2000});
api.get(url, {plugins: [debounce]});
```

**Note:** The `debounce` plugin wraps the `fetchFn` in a debouncer. `await`ing the call will cause the debounce to be awaited. E.g.:

```js
api.get(url, {plugins: [debounce]}).then(() => { console.log(1) });
api.get(url, {plugins: [debounce]}).then(() => { console.log(2) });

// Output: 
// 2
```

But awaiting it will become:
```js
await api.get(url, {plugins: [debounce]}).then(() => { console.log(1) });
await api.get(url, {plugins: [debounce]}).then(() => { console.log(2) });

// Output: 
// 1
// 2
```

### `abort`

```js
import { abort } from '@thepassle/app-tools/api/plugins/abort.js';

/** Aborts previous, unfinished requests via an AbortController if requests are fired in quick succession, like spammy clicks on buttons */
api.get(url, {plugins: [abort]});
```

### `mock`, `delay`

```js
import { mock } from '@thepassle/app-tools/api/plugins/mock.js';
import { delay, delayPlugin } from '@thepassle/app-tools/api/plugins/delay.js';

/** Easily mock requests during development using the native `Response` object */
api.get(url, {
  plugins: [
    mock(() => new Response(JSON.stringify({foo: 'bar'}))),
    delay // defaults to 1000ms
  ]
});

/** Or */
const delay = delayPlugin(2000);
api.get(url, {plugins: [delay]});
```

### `jsonPrefix`

```js
import { jsonPrefix, jsonPrefixPlugin } from '@thepassle/app-tools/api/plugins/jsonPrefix.js';

/** Add plugins to run on all requests */
const api = new Api({ plugins: [jsonPrefix] });

/** Or */
const jsonPrefix = jsonPrefixPlugin('<prefix>');
const api = new Api({ plugins: [jsonPRefix] });
```

### `xsrf`

```js
import { xsrf, xsrfPlugin } from '@thepassle/app-tools/api/plugins/xsrf.js';

/** Add plugins to run on all requests */
const api = new Api({ plugins: [xsrf] });

/** Or */
const xsrf = xsrfPlugin({
  xsrfCookieName: '',
  xsrfHeaderName: ''
});
const api = new Api({ plugins: [xsrf] });
```

### Other

```js
import { logger } from '@thepassle/app-tools/api/plugins/logger.js';

/** Add plugins to run on all requests */
const api = new Api({ plugins: [logoutOnUnauthorized, logger] });
```

## Methods

```js
api.get(url, opts);
api.options(url, opts);
api.delete(url, opts);
api.head(url, opts);
api.post(url, data, opts);
api.put(url, data, opts);
api.patch(url, data, opts);

api.addPlugin({
  beforeFetch: ({url, headers, fetchFn, responseType, baseURL, method, opts, data}) => {},
  afterFetch: (res) => res,
  transform: (data) => data,
  handleError: (e) => true
});
```

## Big List of Options

```js
api.get(url, {
  baseURL: 'https://api.foo.com',
  responseType: 'text',
  params: { foo: 'bar' },
  plugins: [
    {
      beforeFetch: ({url, headers, fetchFn, responseType, baseURL, method, opts, data}) => {},
      afterFetch: (res) => res,
      transform: (data) => data,
      handleError: (e) => true
    }
  ],

  // Also supports all the options of the native fetch API
  // mode, credentials, cache, redirect, referrer, integrity, keepalive, signal, referrerPolicy, headers, method
});
```

## Options

### `baseURL`

BaseURL to resolve all requests from. Can be set globally when instantiating a new `Api` instance, or on a per request basis. When set on a per request basis, will override the globally set baseURL (if set)

```js
api.get(url, { baseURL: 'https://api.foo.com' });
```

### `responseType`

Overwrite the default responseType (`'json'`)

```js
api.get(url, { responseType: 'text' });
```

### `params`

An object to be queryParam-ified and added to the request url

```js
api.get(url, { params: { foo: 'bar' } });
```

### `plugins`

An array of plugins.

```js
api.get(url, {
  plugins: [
    {
      beforeFetch: ({url, headers, fetchFn, responseType, baseURL, method, opts, data}) => {},
      afterFetch: (res) => res,
      transform: (data) => data,
      handleError: (e) => true
    }
  ]
})
```

## Plugins

You can also use plugins. You can add plugins on a per-request basis, or you can globally add them to your `api` instance:

```js
const api = new Api({
  plugins: [
    {
      beforeFetch: ({url, headers, fetchFn, responseType, baseURL, method, opts, data}) => {},
      afterFetch: (res) => res,
      transform: (data) => data,
      handleError: (e) => true
    }
  ]
});
```

You can also dynamically add plugins:

```js
api.addPlugin({
  afterFetch: (res) => res
});
```

Or you can add them on a per request basis:

```js
api.get(url, {
  plugins: [
    {
      beforeFetch: ({url, headers, fetchFn, responseType, baseURL, method, opts, data}) => {},
      afterFetch: (res) => res,
      transform: (data) => data,
      handleError: (e) => true
    }
  ]
});
```

### `beforeFetch`

Run logic before the actual `fetch` call happens, or alter/modify the meta information of a request.
If you want to alter or modify the meta information of a request, make sure to return the value.

```js
api.get('/foo', {
  plugins: [{
    beforeFetch: (meta) => ({...meta, url: '/bar'})
  }]
});

// RESULT: url `/bar` gets called instead of `/foo`
```

If you dont want to alter or modify any meta information of the request, you dont have to return anything.
```js
{ 
  beforeFetch: ({url}) => {
    console.log(url)
  } 
}
```

### `afterFetch`

Runs immediately after the `fetch` call happened. `afterFetch` should always return a `Response`:
```js
{ afterFetch: (res) => res; }
{ afterFetch: (res) => new Response(JSON.stringify({foo: 'bar'}), res); }
```

### `transform`

Runs after the `Response` object has been handled according to the `responseType`, (e.g.: `res.json()`). Can be used to transform the returned data:
Should always return the data.

```js
{ transform: (data) => data }
```

### `handleError`

Whether or not an error should throw. Return `true` if an error should throw, return `false` if an error should be ignored.

```js
{ handleError: (e) => e.message !== 'AbortError' }
```

### Plugin Examples

#### Request logger

```js
function requestLogger() {
  let start;
  return {
    beforeFetch: () => {
      start = Date.now();
    },
    afterFetch: () => {
      console.log(`Request took ${Date.now() - start}ms`);
    }
  }
}

api.addPlugin(requestLogger());
```

#### Automatic logout on 401 or 403

```js
api.get(url, {
  plugins: [
    {
      beforeFetch: ({url, headers, fetchFn, responseType, baseURL, method, opts, data}) => {},
      afterFetch: (res) => {
        if(res.status === 401 || res.status === 403) {
          logout();
        }
        return res;
      }
    }
  ]
});
```

#### Accessing the response body in `afterFetch`

If you want to access the response body of your response in a plugin, make sure to clone the response:

```js
const myPlugin = {
  afterFetch: async (originalResponse) => {
    const clone = originalResponse.clone();
    let data = await clone.text(); // or `.json()` etc

    data = data.replaceAll('foo', 'bar');
    
    // Always make sure to return a `Response`
    return new Response(data, originalResponse);
  }
}

api.addPlugin(myPlugin);
```

#### Returning a new response entirely

You can also overwrite the response entirely by returning a new `Response`

```js
api.addPlugin({
  afterFetch: async (res) => new Response(JSON.stringify({foo: 'bar'}), res);
});
```

#### Overwriting the `fetch` implementation

You can also overwrite the `fetch` implementation to use:

```js
api.addPlugin({
  beforeFetch: (meta) => ({
    ...meta,
    fetchFn: () => Promise.resolve(new Response('{}'))
  })
})
```

Do note that if you use multiple plugins that overwrite the `fetchFn`, the last plugin to overwrite the `fetchFn` will win, there can only be one `fetchFn`.

#### Transforming data

```js
api.addPlugin({
  // Adds a `.foo` property to all of your response data
  transform: (data) => {
    data.foo = 'bar';
    return data;
  }
})
```