/**
 * @param {{maxAge?: number}} options
 * @returns {import('../index').Plugin}
 */
export function cachePlugin({ maxAge }?: {
    maxAge?: number;
}): import('../index').Plugin;
export const cache: import("../types").Plugin;
