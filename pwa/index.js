import { 
  InstallableEvent, 
  InstalledEvent, 
  UpdateAvailableEvent 
} from './events.js';
import { capabilities } from './capabilities.js';
import { createLogger } from '../utils/log.js';
import { media } from '../utils/media.js';
const log = createLogger('pwa');

let installable, installPrompt;

/** 
 * @typedef {Event & {
 *  prompt(): Promise<void>,
 *  userChoice: Promise<{
 *   outcome: 'accepted' | 'dismissed',
 *   platform: string
 *  }>
 * }} BeforeInstallPromptEvent 
 */

class Pwa extends EventTarget {
  /** @type {boolean} */
  updateAvailable = false;
  /** @type {boolean} */
  installable = false;
  /** @type {BeforeInstallPromptEvent  | undefined} */
  installPrompt;
  /** @type {ServiceWorker | undefined} */
  __waitingServiceWorker;
  isInstalled = /** @type {boolean} */ (media.STANDALONE());

  /** Triggers the install prompt, when it's available. You can call this method when the `'installable'` event has fired. */
  triggerPrompt = async () => {
    log('Triggering prompt')
    if(this.installPrompt) {
      this.installPrompt.prompt();
      const { outcome } = await this.installPrompt?.userChoice;

      if (outcome === 'accepted') {
        log('Prompt accepted')
        this.dispatchEvent(new InstalledEvent(true));
        this.installPrompt = undefined;
      } else {
        log('Prompt denied')
        this.dispatchEvent(new InstalledEvent(false));
      }
    }
  }

  /** Update */
  update = () => {
    log('Skip waiting')
    this.__waitingServiceWorker?.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * @param {string} swPath 
   * @param {RegistrationOptions} [opts] 
   * @returns {Promise<ServiceWorkerRegistration> | Promise<void>}
   */
  register(swPath, opts) {
    if(capabilities.SERVICEWORKER) {
      if(opts) {
        return navigator.serviceWorker.register(swPath, opts);
      } else {
        return navigator.serviceWorker.register(swPath);
      }
    }
    return Promise.resolve();
  }

  async kill() {
    if (capabilities.SERVICEWORKER) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        registration.unregister();
      }
      log('Killed service worker');
    }

    const cachesList = await caches.keys();
    await Promise.all(cachesList.map(key => caches.delete(key)));
    log('Cleared cache');

    setTimeout(() => {
      window.location.reload();
    });
  }
}

const pwa = new Pwa();

window.addEventListener('beforeinstallprompt', e => {
  log('Before install prompt fired')
  installable = true;
  installPrompt = /** @type {BeforeInstallPromptEvent} */ (e);
  pwa.installable = installable;
  pwa.installPrompt = installPrompt;
  pwa.dispatchEvent(new InstallableEvent());
});

if(capabilities.SERVICEWORKER) {
  /** @type {ServiceWorker | null} */
  let newWorker;

  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg) {
      /** 
       * If there is already a waiting service worker in line, AND an active, controlling
       * service worker, it means there is an update ready
       */
      if (reg.waiting && navigator.serviceWorker.controller) {
        log('New service worker available')
        pwa.updateAvailable = true;
        pwa.__waitingServiceWorker = reg.waiting;
        pwa.dispatchEvent(new UpdateAvailableEvent());
      }
         
      /**
       * If there is no waiting service worker yet, it might still be parsing or installing
       */
      reg.addEventListener('updatefound', () => {
        newWorker = reg.installing;
        if(newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker?.state === 'installed' && navigator.serviceWorker.controller) {
              log('New service worker available')
              pwa.updateAvailable = true;
              pwa.__waitingServiceWorker = newWorker;
              pwa.dispatchEvent(new UpdateAvailableEvent());
            }
          });
        }
      });
    }
  });

  /** 
   * Handle the reload whenever the service worker has updated. This can happen either via:
   * - The service worker calling skipWaiting itself (skipWaiting pattern)
   * - Or calling `pwa.update()` after the `'update-available'` event has fired, to let the user choose when they would like to activate the update
   * 
   * This logic prevents an unnecessary page reload the first time the service worker has installed and activated
   */
  let refreshing;
  async function handleUpdate() {
    // check to see if there is a current active service worker
    const oldSw = (await navigator.serviceWorker.getRegistration())?.active?.state;

    navigator.serviceWorker.addEventListener('controllerchange', async () => {
      log('Controller change');
      if (refreshing) return;

      // when the controllerchange event has fired, we get the new service worker
      const newSw = (await navigator.serviceWorker.getRegistration())?.active?.state;

      // if there was already an old activated service worker, and a new activating service worker, do the reload
      if(oldSw === 'activated' && newSw === 'activating') {
        log('Reloading');
        refreshing = true;
        window.location.reload();
      }
    });
  }

  if(capabilities.SERVICEWORKER) {
    handleUpdate();
  }
}

export { pwa };
