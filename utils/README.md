# Utils

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

### `when`

```js
html`${when(true, () => html`only truthy result`)}`;
html`${when(true, () => html`truthy result`, () => `falsy result`)}`;
```

### `Service`

```js
import { createService } from '@thepassle/app-tools';
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