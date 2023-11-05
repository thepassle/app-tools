/**
 * @param {{maxAge?: number}} options
 * @returns {import('../index.js').Plugin}
 */
export function cachePlugin({ maxAge }?: {
    maxAge?: number;
}): import('../index.js').Plugin;
export const cache: import("../types.js").Plugin;
