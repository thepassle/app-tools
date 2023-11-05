/**
 * @param {{
 *  xsrfCookieName?: string,
 *  xsrfHeaderName?: string,
 * }} options
 * @returns {import('../index.js').Plugin}
 */
export function xsrfPlugin({ xsrfCookieName, xsrfHeaderName }?: {
    xsrfCookieName?: string;
    xsrfHeaderName?: string;
}): import('../index.js').Plugin;
export const xsrf: import("../types.js").Plugin;
