/**
 * @type {import('../index.js').Plugin}
 */
export const checkServiceWorkerUpdate = {
  name: 'checkServiceWorkerUpdate',
  beforeNavigation: () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
        }
      });
    }
  }
}