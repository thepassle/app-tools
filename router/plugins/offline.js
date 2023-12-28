/**
 * @example offlinePlugin('/my-offline-page')
 * @param {string} offlineRoute
 * @returns {import('../index.js').Plugin}
 */
export function offlinePlugin(offlineRoute = '/offline') {
  return {
    name: 'offline',
    shouldNavigate: () => ({
      condition: () => navigator.onLine,
      redirect: offlineRoute,
    })
  }
}

export const offline = offlinePlugin();
