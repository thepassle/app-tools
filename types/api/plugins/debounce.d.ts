/**
 * @param {{
 *  timeout: number
 * }} opts
 * @returns {import('../index.js').Plugin}
 */
export function debouncePlugin(opts?: {
    timeout: number;
}): import('../index.js').Plugin;
export const debounce: import("../types.js").Plugin;
