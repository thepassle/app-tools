function getCookie(name, _document = document) {
  const match = _document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

function handleStatus(response) {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response;
}

/**
 * @typedef {object} Config
 * @property {string} [xsrfHeaderName=X-CSRF-TOKEN]
 * @property {string} [xsrfCookieName=XSRF-TOKEN]
 * @property {Plugin[]} [plugins=[]]
 * @property {'text'|'json'|'stream'|'blob'|'arrayBuffer'|'formData'|'stream'} [responseType=json]
 * @property {string} [baseURL]
 * 
 * @typedef {(url: string, data?: object, opts?: RequestOptions) => Promise<FetchResponse>} BodyMethod
 * @typedef {(url: string, opts?: RequestOptions) => Promise<FetchResponse>} BodylessMethod
 * @typedef {Response & { [key: string]: any }} FetchResponse
 * @typedef {'GET'|'DELETE'|'HEAD'|'OPTIONS'|'POST'|'PUT'|'PATCH'} Method
 *
 * @typedef {{
 *  beforeFetch?: (meta: MetaParams) => MetaParams | Promise<MetaParams> | void,
 *  afterFetch?: (res: Response) => Response | Promise<Response>,
 *  transform?: (data: any) => any,
 *  handleError?: (e: Error) => boolean
 * }} Plugin
 * 
 * @typedef {Object} CustomRequestOptions
 * @property {(data: FetchResponse) => FetchResponse} [transform] - callback to transform the received data
 * @property {'text'|'json'|'stream'|'blob'|'arrayBuffer'|'formData'|'stream'} [responseType] - responseType of the request, will call res[responseType](). Defaults to 'json'
 * @property {Record<string, string>} [params] - An object to be queryParam-ified and added to the request url
 * @property {Plugin[]} [plugins] - Array of plugins. Plugins can be added on global level, or on a per request basis
 * @property {string} [baseURL] - BaseURL to resolve all requests from. Can be set globally, or on a per request basis. When set on a per request basis, will override the globally set baseURL (if set)
 * 
 * @typedef {RequestInit & CustomRequestOptions} RequestOptions
 * 
 * @typedef {{
 *  responseType: string,
 *  baseURL: string,
 *  url: string,
 *  method: Method,
 *  opts?: RequestOptions,
 *  data?: any,
 *  fetchFn?: typeof globalThis.fetch
 * }} MetaParams
 */

/**
 * @example 
 * const api = new Api({
 *  xsrfCookieName: 'XSRF-COOKIE',
 *  baseURL: 'https://api.foo.com/',
 *  responseType: 'text',
 *  plugins: [
 *    {
 *      beforeFetch: ({url, method, opts, data}) => {},
 *      afterFetch: (res) => res,
 *    }
 *  ]
 *});
 */
export class Api {
  /** @param {Config} config */
  constructor(config = {}) {
    this.config = { 
      xsrfCookieName: 'XSRF-TOKEN',
      plugins: [],
      responseType: 'json',
      ...config 
    };
  }

  /** @param {Plugin} plugin */
  addPlugin(plugin) {
    this.config.plugins.push(plugin);
  }

  /**
   * @param {string} url 
   * @param {Method} method 
   * @param {RequestOptions} [opts] 
   * @param {object} [data]
   * @returns 
   */
  async fetch(url, method, opts, data) {
    const plugins = [...this.config.plugins, ...(opts?.plugins || [])];
    const csrfToken = getCookie(this.config.xsrfCookieName);
    const xsrfHeaderName = this.config.xsrfHeaderName ?? 'X-CSRF-TOKEN';

    let fetchFn = globalThis.fetch;
    let baseURL = opts?.baseURL ?? this.config?.baseURL ?? '';
    let responseType = opts?.responseType ?? this.config.responseType;

    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(csrfToken ? { [xsrfHeaderName]: csrfToken } : {}),
      ...opts?.headers
    });

    if(baseURL) {
      url = url.replace(/^(?!.*\/\/)\/?/, baseURL + '/');
    }

    if(opts?.params) {
      url += `${(~url.indexOf('?') ? '&' : '?')}${new URLSearchParams(opts.params)}`;
    }

    for(const { beforeFetch } of plugins) {
      const overrides = await beforeFetch?.({ responseType, fetchFn, baseURL, url, method, opts, data });
      if(overrides) {
        ({ responseType, fetchFn, baseURL, url, method, opts, data } = {...overrides});
      }
    }

    return fetchFn(url, {
      method,
      headers,
      ...(data ? { body: JSON.stringify(data) } : {}),
      ...(opts?.mode ? { mode: opts.mode } : {}),
      ...(opts?.credentials ? { credentials: opts.credentials } : {}),
      ...(opts?.cache ? { cache: opts.cache } : {}),
      ...(opts?.redirect ? { redirect: opts.redirect } : {}),
      ...(opts?.referrer ? { referrer: opts.referrer } : {}),
      ...(opts?.referrerPolicy ? { referrerPolicy: opts.referrerPolicy } : {}),
      ...(opts?.integrity ? { integrity: opts.integrity } : {}),
      ...(opts?.keepalive ? { keepalive: opts.keepalive } : {}),
      ...(opts?.signal ? { signal: opts.signal } : {}),
    })
    /** [PLUGINS - AFTERFETCH] */
    .then(async res => {
      for(const { afterFetch } of plugins) {
        res = await afterFetch?.(res) ?? res;
      }
      
      return res;
    })
    /** [STATUS] */
    .then(handleStatus)
    /** [RESPONSETYPE] */
    .then(res => res[responseType]())
    .then(async data => {
      for(const { transform } of plugins) {
        data = await transform?.(data) ?? data;
      }
      
      return data;
    })
    /** [PLUGINS - HANDLEERROR] */
    .catch(async e => {
      const shouldThrow = (await Promise.all(plugins.map(({handleError}) => handleError?.(e) ?? false))).some(_ => !!_);
      if(shouldThrow) throw e;
    });
  }

  /** @type {BodylessMethod} */
  get = (url, opts) => this.fetch(url, 'GET', opts);
  /** @type {BodylessMethod} */
  options = (url, opts) => this.fetch(url, 'OPTIONS', opts);
  /** @type {BodylessMethod} */
  delete = (url, opts) => this.fetch(url, 'DELETE', opts);
  /** @type {BodylessMethod} */
  head = (url, opts) => this.fetch(url, 'HEAD', opts);
  /** @type {BodyMethod} */
  post = (url, data, opts) => this.fetch(url, 'POST', opts, data);
  /** @type {BodyMethod} */
  put = (url, data, opts) => this.fetch(url, 'PUT', opts, data);
  /** @type {BodyMethod} */
  patch = (url, data, opts) => this.fetch(url, 'PATCH', opts, data);
}

export const api = new Api();
