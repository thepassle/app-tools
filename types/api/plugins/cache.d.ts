/**
 * @param {{maxAge?: number, maxSize?: number}} options
 * @returns {import('../index.js').Plugin}
 */
export function cachePlugin({ maxAge, maxSize, }?: {
    maxAge?: number;
    maxSize?: number;
}): import('../index.js').Plugin;
export const cache: import("../types.js").Plugin;
