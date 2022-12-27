/**
 * @example offlinePlugin('/my-offline-page')
 */
export function offlinePlugin(offlineRoute = '/offline') {
  return {
    shouldNavigate: () => ({
      condition: () => !navigator.onLine,
      redirect: offlineRoute,
    })
  }
}

export const offline = offlinePlugin();