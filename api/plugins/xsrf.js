function getCookie(name, _document = document) {
  const match = _document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * @param {{
 *  xsrfCookieName?: string,
 *  xsrfHeaderName?: string,
 * }} options 
 */
export function xsrfPlugin({
  xsrfCookieName = 'XSRF-TOKEN',
  xsrfHeaderName = 'X-CSRF-TOKEN'
} = {}) {
  const csrfToken = getCookie(xsrfCookieName);
  return {
    beforeFetch: (meta) => {
      if(csrfToken) {
        meta.headers.set(xsrfHeaderName, csrfToken);
      }
      return meta;
    }
  }
}

export const xsrf = xsrfPlugin();