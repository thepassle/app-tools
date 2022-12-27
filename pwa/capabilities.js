export const capabilities = {
  WAKELOCK: 'wakeLock' in navigator,
  BADGING: 'setAppBadge' in navigator,
  NOTIFICATION: 'Notification' in window
};