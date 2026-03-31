/**
 * @param {number} [max=10] - Maximum number of concurrent requests
 * @returns {import('../index.js').Plugin}
 */
export function concurrencyPlugin(max?: number): import('../index.js').Plugin;
export const concurrency: import("../types.js").Plugin;
