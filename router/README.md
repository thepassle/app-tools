# Router

A simple, modular Single Page Application router. 

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

```js
import { Router } from '@thepassle/app-tools/router.js';
import { lazy } from '@thepassle/app-tools/router/plugins/lazy.js';
import { offline } from '@thepassle/app-tools/router/plugins/offline.js';
import { resetFocus } from '@thepassle/app-tools/router/plugins/resetFocus.js';
import { scrollToTop } from '@thepassle/app-tools/router/plugins/scrollToTop.js';
import { checkServiceWorkerUpdate } from '@thepassle/app-tools/router/plugins/checkServiceWorkerUpdate.js';

export const router = new Router({
  /** Plugins to be run for every route */
  plugins: [
    /** Redirects to an offline page */
    offline,
    /** Checks for service worker updates on route navigations */
    checkServiceWorkerUpdate,
    scrollToTop,
    resetFocus
  ],
  /** Fallback route when the user navigates to a route that doesnt exist */
  fallback: '/404',
  routes: [
    {
      path: '/',
      title: 'home',
      render: () => html`<product-list></product-list>`
    },
    {
      path: '/cart',
      title: 'cart',
      plugins: [
        lazy(() => import('./shopping-card.js'))
      ],
      render: () => html`<shopping-cart></shopping-cart>`
    },
    {
      path: '/product/:name',
      title: ({params}) => `Product ${params.name}`,
      plugins: [
        lazy(() => import('./product-page.js'))
      ],
      render: ({params}) => html`<product-page id="${params.name}"></product-page>`
    },
    {
      path: '/admin',
      title: 'Admin',
      plugins: [
        {
          shouldNavigate: () => ({
            condition: () => state.user.isAdmin,
            redirect: '/'
          })
        }
      ],
      render: () => html`<admin-page></admin-page>`
    },
    {
      path: '/offline',
      title: 'Offline',
      render: () => html`<offline-page></offline-page>`
    },
    {
      path: '/404',
      title: 'Not found',
      render: () => html`<404-page></404-page>`
    }
  ]
});

router.addEventListener('route-changed', ({context}) => {
  document.querySelector('#outlet').innerHTML = router.render();
});

router.navigate('/cart');

router.context.url;
router.context.params;
router.context.query;
router.context.title;

// Cleans up global event listeners
router.uninstall();
```

## Polyfill

The router makes use of the `URLPattern` api, which you may need to polyfill in your application. You can use [`urlpattern-polyfill`](https://www.npmjs.com/package/urlpattern-polyfill) for this.

If you use [`@web/rollup-plugin-polyfills-loader`](https://www.npmjs.com/package/@web/rollup-plugin-polyfills-loader) in your rollup build you can use the `URLPattern` config option:

```js
polyfillsLoader({
  polyfills: {
    URLPattern: true,
  },
})
```

## Base

When using a Single Page Application (SPA) router, make sure to set the `<base href="/">` element in your HTML. Also make sure that your dev server is configured for SPA Navigations. When using `@web/dev-server`, you can use the `--app-index` configuration options.

E.g.: `web-dev-server --app-index index.html`, or `web-dev-server --app-index foo/index.html`

When using a different base, for example if your app is running on `my-app.com/foo/`, make sure to adjust your routing configuration:

```html
<html>
  <head>
    <base href="/foo/">
  </head>
  <body>
    <a href="/foo/">home</a>
    <a href="foo">foo</a>
    <a href="bar/123">bar</a>
    <main></main>
  </body>
  <script type="module">
    import { Router } from 'https://unpkg.com/@thepassle/app-tools/router.js';
        
    const router = new Router({
      routes: [
        {
          path: '/foo/',
          title: 'Hello',
          render: () => 'home'
        },
        {
          path: 'foo',
          title: 'Foo',
          render: () => 'foo'
        },
        {
          path: 'bar/:id',
          title: ({params}) => `Bar ${params.id}`,
          render: ({params}) => `bar ${params.id}`
        },
      ]
    });

    router.addEventListener('route-changed', ({context}) => {
      const route = router.render();
      document.querySelector('main').innerHTML = route;
    });
  </script>
</html>
```

## Rendering

The router is framework agnostic. Rendering the route is left to the consumer of the router. The application is then in charge of rendering whatever is returned from the `render` function. Here's a basic example:

### Using vanilla js

Route:
```js
{
  path: '/',
  title: 'Home',
  render: (context) => 'Home route'
}
```
App:
```js
router.addEventListener('route-changed', () => {
  const route = router.render();
  document.querySelector('#outlet').innerHTML = route;
});
```

### Using lit-html

Route:
```js
{
  path: '/',
  title: 'Home',
  render: (context) => html`<my-el></my-el>`
}
```
App:
```js
import { html, render } from 'lit';

router.addEventListener('route-changed', () => {
  render(router.render(), document.querySelector('#outlet'))
});
```

### Using LitElement

Route:
```js
{
  path: '/',
  title: 'Home',
  render: (context) => html`<my-el></my-el>`
}
```
App:
```js
import { LitElement } from 'lit';

class MyEl extends LitElement {
  static properties = {
    route: {}
  }

  firstUpdated() {
    router.addEventListener('route-changed', () => {
      this.route = router.render();
    });
  }

  render() {
    return this.route;
  }
}
```

## Composable

Use plugins to customize your navigations to fit your needs. You can add plugins for all navigations, or for specific routes.

```js
const router = new Router({
  /** These plugins will run for any navigation */
  plugins: [],
  routes: [
    {
      path: '/foo',
      title: 'Foo',
      /** These plugins will run for this route only */
      plugins: [],
      render: () => html`<my-el></my-el>`
    }
  ]
})
```

### `lazy`

Lazily import resources or components on route navigations

```js
import { lazy } from '@thepassle/app-tools/router/plugins/lazy.js';

const router = new Router({
  routes: [
    {
      path: '/foo',
      title: 'Foo',
      plugins: [
        lazy(() => import('./my-el.js')),
      ],
      render: () => html`<my-el></my-el>`
    },
  ]
});
```

### `data`

```js
import { api } from '@thepassle/app-tools/api.js';
import { data } from '@thepassle/app-tools/router/plugins/data.js';

const router = new Router({
  routes: [
    {
      path: '/pokemon/:id',
      title: (context) => `Pokemon ${context.params.id}`,
      plugins: [
        data((context) => api.get(`https://pokeapi.co/api/v2/pokemon/${context.params.id}`)),
      ],
      // context.data is a promise
      render: (context) => html`<pokemon-card .data=${context.data}></pokemon-card>`
    },
  ]
});
```

### `redirect`

```js
import { redirect } from '@thepassle/app-tools/router/plugins/redirect.js';

const router = new Router({
  routes: [
    {
      path: '/foo',
      title: 'Foo',
      plugins: [
        redirect('/404'),
      ],
    },
    {
      path: '/legacy/detail/:product',
      title: 'Foo',
      plugins: [
        redirect(context => '/detail/${context.params.product}'),
      ],
    },
  ]
});
```

### `checkServiceWorkerUpdate`

Checks for service worker updates on route navigations

```js
import { checkServiceWorkerUpdate } from '@thepassle/app-tools/router/plugins/checkServiceWorkerUpdate.js';

const router = new Router({
  plugins: [
    checkServiceWorkerUpdate
  ],
  routes: [
    {
      path: '/foo',
      title: 'Foo',
      render: () => html`<my-el></my-el>`
    },
  ]
});
```

### `offline`

Redirects to an offline page when the user is offline

```js
import { offline, offlinePlugin } from '@thepassle/app-tools/router/plugins/offline.js';

const router = new Router({
  plugins: [
    /** Redirects to `/offline` by default */
    offline
    /** Or */
    offlinePlugin('/my-offline-page')
  ],
  routes: [
    {
      path: '/offline',
      title: 'Offline',
      render: () => html`<offline-page></offline-page>`
    },
  ]
});
```

### `appName`

Prepends the name of your app to the title

```js
import { appName } from '@thepassle/app-tools/router/plugins/appName.js';

const router = new Router({
  plugins: [
    appName('My App -')
  ],
  routes: [
    {
      path: '/foo',
      title: 'Foo',
      render: () => html`<my-el></my-el>`
    },
  ]
});
```

Will result in the title for route `/foo` being:
`My App - Foo`

### `scrollToTop`

Scrolls the page to the top after a navigation

```js
import { scrollToTop } from '@thepassle/app-tools/router/plugins/scrollToTop.js';

const router = new Router({
  plugins: [
    scrollToTop
  ],
  routes: [
    {
      path: '/foo',
      title: 'Foo',
      render: () => html`<my-el></my-el>`
    },
  ]
});
```

### `resetFocus`

Resets focus to the start of the document

```js
import { resetFocus } from '@thepassle/app-tools/router/plugins/resetFocus.js';

const router = new Router({
  plugins: [
    resetFocus
  ],
  routes: [
    {
      path: '/foo',
      title: 'Foo',
      render: () => html`<my-el></my-el>`
    },
  ]
});
```

## Plugin API

```js
const router = new Router({
  plugins: [
    {
      shouldNavigate: (context) => ({
        condition: () => false,
        redirect: '/'
      }),
      beforeNavigation: (context) => {

      },
      afterNavigation: (context) => {

      }
    }
  ]
});
```

All plugins have access to the `context` object for the current route. Given the following route, the context includes:

```js
{
  path: '/users/:id',
  title: ({params, query}) => `Hello world ${params.id} ${query.foo}`,
}
```

`www.my-website.com/users/123?foo=bar`

```js
context.params; // { id: 123 }
context.query; // { foo: 'bar' }
context.title; // "Hello world 123 bar"
context.url; // URL instance of "www.my-website.com/users/123?foo=bar"
```

### `shouldNavigate`

Can be used to protect routes based on a condition function. Should return an object containing a `condition` function, and a `redirect`. When the `condition` returns `false`, it will redirect to the path provided by `redirect`.

```js
const myPlugin = {
  shouldNavigate: (context) => ({
    /** A condition function to determine whether or not the navigation should take place */
    condition: () => state.user.isAdmin,
    /** Where to send the user in case the condition is false */
    redirect: '/'
  }),
}
```

### `beforeNavigation`

Runs before the navigation takes place

```js
const myPlugin = {
  beforeNavigation: (context) => {}
}
```

### `afterNavigation`

Runs after the navigation takes place

```js
const myPlugin = {
  afterNavigation: (context) => {}
}
```
