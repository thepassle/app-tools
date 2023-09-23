import { createLogger } from '../utils/log.js';
const log = createLogger('api');

class StatusError extends Error {
  constructor(response) {
    super(response.statusText);
    this.response = response;
  }
}

function handleStatus(response) {
  if (!response.ok) {
    log('Response not ok', response);
    throw new StatusError(response);
  }
  return response;
}

/** @typedef {import('./types.js').Config} Config */
/** @typedef {import('./types.js').Method} Method */
/** @typedef {import('./types.js').Plugin} Plugin */
/** @typedef {import('./types.js').CustomRequestOptions} CustomRequestOptions */
/** @typedef {import('./types.js').RequestOptions} RequestOptions */
/** @typedef {import('./types.js').MetaParams} MetaParams */

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

    log(`Fetching ${method} ${url}`, { 
      responseType, 
      // @ts-ignore
      headers: Object.fromEntries(headers), 
      fetchFn, 
      baseURL, 
      url, 
      method, 
      opts, 
      data 
    });
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
          const afterFetchResult = await plugin?.afterFetch?.(res) ?? res;
          if(afterFetchResult) {
            res = afterFetchResult;
          }
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
      log(`Fetch successful ${method} ${url}`, data);
      return data;
    })
    /** [PLUGINS - HANDLEERROR] */
    .catch(async e => {
      log(`Fetch failed ${method} ${url}`, e);
      const shouldThrow = plugins.length === 0 || (await Promise.all(plugins.map(({ handleError }) => handleError?.(e) ?? true))).every(_ => !!_);
      if(shouldThrow) throw e;
    });
  }

  /** @type {import('./types.js').BodylessMethod} */
  get = (url, opts) => this.fetch(url, 'GET', opts);
  /** @type {import('./types.js').BodylessMethod} */
  options = (url, opts) => this.fetch(url, 'OPTIONS', opts);
  /** @type {import('./types.js').BodylessMethod} */
  delete = (url, opts) => this.fetch(url, 'DELETE', opts);
  /** @type {import('./types.js').BodylessMethod} */
  head = (url, opts) => this.fetch(url, 'HEAD', opts);
  /** @type {import('./types.js').BodyMethod} */
  post = (url, data, opts) => this.fetch(url, 'POST', opts, data);
  /** @type {import('./types.js').BodyMethod} */
  put = (url, data, opts) => this.fetch(url, 'PUT', opts, data);
  /** @type {import('./types.js').BodyMethod} */
  patch = (url, data, opts) => this.fetch(url, 'PATCH', opts, data);
}

export const api = new Api();