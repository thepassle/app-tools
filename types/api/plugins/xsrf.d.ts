/**
 * @param {{
 *  xsrfCookieName?: string,
 *  xsrfHeaderName?: string,
 * }} options
 * @returns {import('../index').Plugin}
 */
export function xsrfPlugin({ xsrfCookieName, xsrfHeaderName }?: {
    xsrfCookieName?: string;
    xsrfHeaderName?: string;
}): import('../index').Plugin;
export const xsrf: import("../types").Plugin;
