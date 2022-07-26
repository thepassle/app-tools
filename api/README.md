# Api

Small wrapper around the native [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API.

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

```js
import { Api } from '@thepassle/app-tools';

const api = new Api({
  xsrfCookieName: 'XSRF-COOKIE',
  xsrfHeaderName: 'X-CSRF-TOKEN',
  baseURL: 'https://api.foo.com',
  jsonPrefix: `)]}',\n`,
  responseType: 'text',
  plugins: [
    {
      beforeFetch: ({url, method, opts, data}) => {},
      afterFetch: (res) => res,
    }
  ]
});

const user = await api.get('/users/1');
await api.post('/form/submit', { name: 'John Doe', email: 'johndoe@internet.com' });
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
  beforeFetch: ({url, method, opts, data}) => {},
  afterFetch: (res) => res,
});
```

## Big List of Options

```js
api.get(url, {
  baseURL: 'https://api.foo.com',
  responseType: 'text',
  transform: (data) => data,
  useAbort: true,
  useCache: true,
  cacheOptions: {
    maxAge: 1000 * 60 * 5
  },
  params: {
    foo: 'bar',
  },
  delay: 2000,
  mock: ({url, method, opts, data}) => new Response(JSON.stringify({}), {status: 200}),
  plugins: [
    {
      beforeFetch: ({url, method, opts, data}) => {},
      afterFetch: (res) => res,
    }
  ],

  // Also supports all the options of the native fetch API
  // mode, credentials, cache, redirect, referrer, integrity, keepalive, signal, referrerPolicy, headers, method
})
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

### `transform`

Callback to transform your data. Gets called after the response body has been read to completion, and handled according to the `responseType` option. E.g.: the response has been `res.json()`-ified.

```js
api.get(url, {
  transform: (data) => {
    data.foo = 'bar';
    return data;
  }
});
```

### `useAbort`

Whether or not to use an `abortSignal` to cancel subsequent requests that may get fired in quick succession. Defaults to `false`

```js
api.get(url, { useAbort: true });
```

### `useCache`

Whether or not to cache responses. Defaults to `false`. When set to `true`, it will by default cache a request for 10 minutes. This can be customized via `cacheOptions`

```js
api.get(url, { useCache: true });
```

### `cacheOptions`

Configure the duration a response should be cached for

```js
api.get(url, { 
  useCache: true,
  cacheOptions: {
    maxAge: 1000 * 60 * 5, // 5 minutes
  }
});
```

### `params`

An object to be queryParam-ified and added to the request url

```js
api.get(url, { params: { foo: 'bar' } });
```

### `delay`

Adds an artifical delay to resolving of the request, useful for local testing and debugging

```js
api.get(url, { delay: 5000 });
```

### `mock`

Return a custom [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response) with mock data instead of actually sending the request to the network. Can be used in combination with `delay` as well.

```js
api.get(url, {
  mock: ({url, method, opts, data}) => new Response(JSON.stringify({foo:'bar'}), {status: 200}),
  // Can be used in combination with `delay`
  delay: 2000,
})
```

### `plugins`

An array of plugins.

```js
api.get(url, {
  plugins: [
    {
      beforeFetch: ({url, method, opts, data}) => {},
      afterFetch: (res) => {
        if(res.status === 401 || res.status === 403) {
          logout();
        }
        return res;
      }
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
      beforeFetch: ({url, method, opts, data}) => {},
      afterFetch: (res) => res,
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
      beforeFetch: ({url, method, opts, data}) => {},
      afterFetch: (res) => res,
    }
  ]
});
```



### Examples

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

#### Accessing response data in plugins

If you want to access the data of your response in a plugin, make sure to clone the response:

```js
const myPlugin = {
  afterFetch: async (res) => {
    const clone = res.clone();
    const data = await clone.json();
    
    console.log(data); // do something with your data
    
    // Always make sure to return the original response
    return res;
  }
}

api.addplugin(myPlugin);
```