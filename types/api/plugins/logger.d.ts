/**
 * @param {{
 *  collapsed?: boolean
 * }} options
 * @returns {import('../index.js').Plugin}
 */
export function loggerPlugin({ collapsed }?: {
    collapsed?: boolean;
}): import('../index.js').Plugin;
export const logger: import("../types.js").Plugin;
