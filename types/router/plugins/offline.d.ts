/**
 * @example offlinePlugin('/my-offline-page')
 * @param {string} offlineRoute
 * @returns {import('../index.js').Plugin}
 */
export function offlinePlugin(offlineRoute?: string): import('../index.js').Plugin;
export const offline: import("../types.js").Plugin;
