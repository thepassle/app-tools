/**
 * @example offlinePlugin('/my-offline-page')
 */
export function offlinePlugin(offlineRoute = '/offline') {
  return {
    name: 'offline',
    shouldNavigate: () => ({
      condition: () => !navigator.onLine,
      redirect: offlineRoute,
    })
  }
}

export const offline = offlinePlugin();