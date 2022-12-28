import { createLogger } from '../utils/log.js';
const log = createLogger('api');

function handleStatus(response) {
  if (!response.ok) {
    log('Response not ok', response.statusText);
    throw new Error(response.statusText);
  }
  return response;
}

/**
 * @typedef {object} Config
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
 *  name: string,
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
 *  headers: Headers,
 *  opts?: RequestOptions,
 *  data?: any,
 *  fetchFn: typeof globalThis.fetch
 * }} MetaParams
 */

/**
 * @example 
 * const api = new Api({
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

    let fetchFn = globalThis.fetch;
    let baseURL = opts?.baseURL ?? this.config?.baseURL ?? '';
    let responseType = opts?.responseType ?? this.config.responseType;
    let headers = new Headers({
      'Content-Type': 'application/json',
      ...opts?.headers
    });

    if(baseURL) {
      url = url.replace(/^(?!.*\/\/)\/?/, baseURL + '/');
    }

    if(opts?.params) {
      url += `${(~url.indexOf('?') ? '&' : '?')}${new URLSearchParams(opts.params)}`;
    }

    for(const plugin of plugins) {
      try {
        const overrides = await plugin?.beforeFetch?.({ responseType, headers, fetchFn, baseURL, url, method, opts, data });
        if(overrides) {
          ({ responseType, headers, fetchFn, baseURL, url, method, opts, data } = {...overrides});
        }
      } catch(e) {
        log(`Plugin "${plugin.name}" error on afterFetch hook`);
        throw e;
      }
    }

    log('Fetching', { responseType, headers: Object.fromEntries(headers), fetchFn, baseURL, url, method, opts, data });
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
      for(const plugin of plugins) {
        try {
          res = await plugin?.afterFetch?.(res) ?? res;
        } catch(e) {
          log(`Plugin "${plugin.name}" error on afterFetch hook`)
          throw e;
        }
      }
      
      return res;
    })
    /** [STATUS] */
    .then(handleStatus)
    /** [RESPONSETYPE] */
    .then(res => res[responseType]())
    .then(async data => {
      for(const plugin of plugins) {
        try {
          data = await plugin?.transform?.(data) ?? data;
        } catch(e) {
          log(`Plugin "${plugin.name}" error on transform hook`)
          throw e;
        }
      }
      log('Fetch successful', data);
      return data;
    })
    /** [PLUGINS - HANDLEERROR] */
    .catch(async e => {
      log('Fetch failed', e);
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
