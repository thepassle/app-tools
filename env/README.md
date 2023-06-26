# Env

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

```js
import { DEV, PROD } from '@thepassle/app-tools/env.js'; 

if (DEV) {
  console.log('Running in dev mode');
}

if (PROD) {
  console.log('Running in prod mode');
}
```

OR

```js
import { ENV } from '@thepassle/app-tools/env.js';

if (ENV === 'dev') {
  console.log('Running in dev mode');
}

if (ENV === 'prod') {
  console.log('Running in prod mode');
}
```

### Custom Env Modes

In certain situations you might want to set your own env mode.

Demos that should use "just" json files instead of a full api server might be a good use case for it.
Here is an example using it in combination with the [Api Module](../api/README.md).

```js
import { ENV } from '@thepassle/app-tools/env.js';

const baseURLs = {
  'prod': 'https://api.domain.com', // prod api server
  'dev': 'http://localhost:8888', // local api server
  'dev-static': 'http://localhost:8000' // demos using "just" json files
}
const typedEnv = /** @type {keyof baseURLs} */ (ENV);

export const api = new Api({
  baseURL: baseURLs[typedEnv],
});
```

Then in your HTML demo files you can set these special env values.

```html
<my-el api-endpoint="recommendation.json"></my-el>

<script type="module">
  import { ENV, setEnv } from '@thepassle/app-tools/env.js';
  setEnv('dev-static');
  import '../my-el.js';
</script>
```

When resolving imports, Node will look for keys in the package export to figure out which file to use. For example "default", "import", or "require".

Tools however can use custom keys here as well, like "types", "browser", "development", or "production". Depending on what kind of import it is, and which environment (dev/prod) tools (like bundlers or dev servers) can resolve/distinguish between which file should actually be used.

## Acknowledgement

This was inspired by [`esm-env`](https://github.com/benmccann/esm-env) by Ben McCann. I've added to my own repo because I like to have useful utils like these centralized in one place for my personal projects, especially when they're as small and elegant as this. 