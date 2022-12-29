# Utils

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

### `log`

You can enable logs via the `setDebug` function, or by setting a `?app-tools-debug=true` query param in the browser url.

```js
import { log, setDebug, getDebug } from '@thepassle/app-tools/utils/log.js';

// Enable logs to show up in the console
setDebug(true);

getDebug(); // true

log('foo', { foo: 'bar'});
```

### `when`

```js
import { when } from '@thepassle/app-tools/utils.js';

when(true, () => html`only truthy result`);
when(true, 
  () => html`truthy result`, 
  () => html`falsy result`
);
```

### `waitUntil`

```js
import { waitUntil } from '@thepassle/app-tools/utils/async.js';

await waitUntil(() => true, {
  timeout: 1000,
  message: 'waitUntil timed out', 
  interval: 50
});
```

### `setAbortableTimeout`

```js
import { setAbortableTimeout } from '@thepassle/app-tools/utils/async.js';

const controller = new AbortController();
const { signal } = controller;

setAbortableTimeout(
  () => { console.log(1); }, 
  2000, 
  { signal }
);

controller.abort();
```

### `debounce`

```js
import { debounce } from '@thepassle/app-tools/utils/async.js';

function foo() {
  console.log(1);
}

const debouncedFoo = debounce(foo);

debouncedFoo();
debouncedFoo();
debouncedFoo();

// console.log only called once
```

### `media`

```js
import { media } from '@thepassle/app-tools/utils/media.js'

media.DARK_MODE(); // true

// Or provide a callback that fires whenever the mediaquery changes
// If you provide a callback, the function returns a cleanup function
const cleanup = media.DARK_MODE((matches) => {
  console.log(matches); // true
});
// Removes the listener
cleanup();

// If you don't provide a callback, the function just returns the `matches` boolean
media.MIN.XL();
media.MAX.LG();
media.MIN.MD();
media.MAX.SM();
media.MIN.XS(); // etc

media.STANDALONE();
media.REDUCED_MOTION();
media.LIGHT_MODE();
```

### `Service`

```js
import { createService } from '@thepassle/app-tools/utils/Service.js';
import { html, nothing } from 'lit';

const Service = createService({
  initialized: () => nothing,
  pending: () => html`<app-spinner></app-spinner>`,
  success: () => nothing,
  error: (e) => html`<app-error>${e}</app-error>`,
});

class MyApp extends LitElement {
  foo = new Service(this, () => api.get('/foo'));

  connectedCallback() {
    super.connectedCallback();
    this.foo.request();
  }

  render() {
    return this.foo.render({
      success: (data) => html`<h1>${data.name}</h2>`
    });
  }
}
```