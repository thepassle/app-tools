# Pwa

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

Sets up global listeners for `'beforeinstallprompt'`, `'controllerchange'` as a side effect and correctly handles reloading when `'controllerchange'` has fired; it only reloads when a new service worker has activated, and there was a previous worker.

```js
import { PROD } from '@thepassle/app-tools/env.js';
import { pwa } from '@thepassle/app-tools/pwa.js'; 

pwa.updateAvailable; // false
pwa.installable; // false
pwa.installPrompt; // undefined
/** Whether or not the PWA is running in standalone mode, and thus is installed as PWA */
pwa.isInstalled; // false

if (PROD) {
  pwa.register('./sw.js', { scope: './' })
    .catch(() => { 
      console.log('Failed to register SW.') 
    });
}

/** Fires an event when the PWA is considered installable by the browser */
pwa.addEventListener('installable', () => {
  pwa.installable; // true
  pwa.installPrompt; // stores the beforeinstallprompt event
  pwa.triggerPrompt(); // trigger the prompt
});

pwa.addEventListener('installed', ({installed}) => {
  if (installed) {
    /** The user accepted the install prompt, the PWA is successfully installed */
  } else {
    /** The user denied the prompt */
  }
});

/** 
 * Fires when a service worker update is available 
 * Can be used to display a notification dot/icon to signal the user that an update is available,
 * or conditionally render some kind of "update" button
 */
pwa.addEventListener('update-available', () => {
  pwa.updateAvailable; // true
  pwa.update(); // Sends a `{type: 'SKIP_WAITING'}` to the waiting service worker so it can take control of the page
});

/**
 * PWA kill switch. Unregisters service worker, deletes caches, reloads the browser
 */
pwa.kill();
```

## Capabilities

```js
import { capabilities } from '@thepassle/app-tools/pwa.js';
import { when } from '@thepassle/app-tools/utils.js';

when(capabilities.WAKELOCK, () => html`<button>Request wakelock</button>`);

// capabilities.BADGING
// capabilities.NOTIFICATION
// capabilities.SHARE
// capabilities.SERVICEWORKER
// capabilities.WAKELOCK
```

## Catching the `update` in your service worker file

The `pwa.update()` method will `postMessage({type: 'SKIP_WAITING'})` to the currently `'waiting'` service worker. This is aligned with Workbox's defaults. However, if you are not using Workbox, make sure to add the following code to your service worker:

```js
self.addEventListener('message', (event) => {
  if (event?.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

## Reloading when `'controllerchange'` fires

The following code snippet usually does the rounds on the internet:

```js
let refreshing;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (refreshing) return;
  window.location.reload();
  refreshing = true;
});
```

However, this will also reload the page _the first time a user visits the page_ and leads to an unnecessary initial reload.

`pwa` handles updates by making sure there was an old service worker to replace, to avoid the unnecessary initial reload.