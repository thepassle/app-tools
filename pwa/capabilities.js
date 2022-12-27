export const capabilities = {
  WAKELOCK: 'wakeLock' in navigator,
  BADGING: 'setAppBadge' in navigator,
  SHARE: 'share' in navigator,
  SERVICEWORKER: 'serviceWorker' in navigator,
  NOTIFICATION: 'Notification' in window
};