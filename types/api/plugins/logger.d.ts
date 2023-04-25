/**
 * @param {{
 *  collapsed?: boolean
 * }} options
 * @returns {import('../index').Plugin}
 */
export function loggerPlugin({ collapsed }?: {
    collapsed?: boolean;
}): import('../index').Plugin;
export const logger: import("../types").Plugin;
