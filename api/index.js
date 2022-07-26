const TEN_MINUTES = 1000 * 60 * 10;

function getCookie(name, _document = document) {
  const match = _document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

function handleAbort(e) {
  if (e.name !== 'AbortError') {
    throw e;
  }
}

function handleStatus(response) {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response;
}

/**
 * @param {() => void} f 
 * @param {number} ms 
 * @param {{
 *  signal?: AbortSignal
 * }} options
 */
function setAbortableTimeout(f, ms, {signal}) {
  let t;
  if(!signal?.aborted) {
    t = setTimeout(f, ms);
  }
  signal?.addEventListener('abort', () => clearTimeout(t), {once: true});
};

/**
 * @typedef {object} Config
 * @property {string} [xsrfHeaderName=X-CSRF-TOKEN]
 * @property {string} [xsrfCookieName=XSRF-TOKEN]
 * @property {Plugin[]} [plugins]
 * @property {'text'|'json'|'stream'|'blob'|'arrayBuffer'|'formData'|'stream'} [responseType]
 * @property {string} [baseURL]
 * 
 * @typedef {(url: string, data?: object, opts?: RequestOptions) => Promise<FetchResponse>} BodyMethod
 * @typedef {(url: string, opts?: RequestOptions) => Promise<FetchResponse>} BodylessMethod
 * @typedef {(url: string) => any} MockFn
 * @typedef {Response & { [key: string]: any }} FetchResponse
 * @typedef {'GET'|'DELETE'|'HEAD'|'OPTIONS'|'POST'|'PUT'|'PATCH'} Method
 *
 * @typedef {{
 *  beforeFetch?: (meta: MetaParams) => void,
 *  afterFetch?: (res: Response) => Response | Promise<Response>,
 * }} Plugin
 * 
 * @typedef {Object} CustomRequestOptions
 * @property {(data: FetchResponse) => FetchResponse} [transform] - callback to transform the received data
 * @property {'text'|'json'|'stream'|'blob'|'arrayBuffer'|'formData'|'stream'} [responseType] - responseType of the request, will call res[responseType](). Defaults to 'json'
 * @property {boolean} [useAbort] - Whether or not to use an abortSignal to cancel subsequent requests that may get fired in quick succession. Defaults to false
 * @property {boolean} [useCache] - Whether or not to cache responses. Defaults to false. When set to true, it will by default cache a request for 10 minutes. This can be customized via `cacheOptions`
 * @property {(mockParams: MetaParams) => Response} [mock] - Return a custom `new Response` with mock data instead of firing the request. Can be used in combination with `delay` as well. E.g.: (meta) => new Response(JSON.stringify({foo:'bar'}, {status: 200}));
 * @property {{maxAge?: number}} [cacheOptions] - Configure caching options
 * @property {Record<string, string>} [params] - An object to be queryParam-ified and added to the request url
 * @property {number} [delay] - Adds an artifical delay to resolving of the request, useful for testing
 * @property {Plugin[]} [plugins] - Array of plugins. Plugins can be added on global level, or on a per request basis
 * @property {string} [baseURL] - BaseURL to resolve all requests from. Can be set globally, or on a per request basis. When set on a per request basis, will override the globally set baseURL (if set)
 * 
 * @typedef {RequestInit & CustomRequestOptions} RequestOptions
 * 
 * @typedef {{
 *  url: string,
 *  method: string,
 *  opts?: RequestOptions,
 *  data?: any,
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
  #cache = new Map();
  #requests = new Map();

  /**
   * @param {Config} config
   */
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

    const baseURL = opts?.baseURL ?? this.config?.baseURL ?? '';
    const responseType = opts?.responseType ?? this.config.responseType;
    const xsrfHeaderName = this.config.xsrfHeaderName ?? 'X-CSRF-TOKEN';

    const requestKey = `${method}:${url}`;

    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(csrfToken ? { [xsrfHeaderName]: csrfToken } : {}),
      ...opts?.headers
    });

    if(baseURL) {
      url = url.replace(/^(?!.*\/\/)\/?/, baseURL + '/');
    }

    if(opts?.useCache) {
      if(this.#cache.has(requestKey)) {
        const cached = this.#cache.get(requestKey);
        if(cached.updatedAt > Date.now() - (opts.cacheOptions?.maxAge || TEN_MINUTES)) {
          return Promise.resolve(cached.data);
        }
      }
    }

    if(opts?.useAbort) {
      if(this.#requests.has(requestKey)) {
        const request = this.#requests.get(requestKey);
        request.abort();
      }
      this.#requests.set(requestKey, new AbortController());
    }

    if(opts?.params) {
      url += `${(~url.indexOf('?') ? '&' : '?')}${new URLSearchParams(opts.params)}`;
    }

    for(const { beforeFetch } of plugins) {
      await beforeFetch?.({ url, method, opts, data });
    }

    const signal = {...(opts?.useAbort
      ? { signal: this.#requests.get(requestKey).signal }
      : opts?.signal
        ? { signal: opts.signal }
        : {}
    )}

    return (opts?.mock 
      ? new Promise(res => setAbortableTimeout(
          () => res(opts.mock?.({url, method, opts, data})), 
          opts?.delay ?? Math.random() * 1000, 
          signal)
        )
      : fetch(url, {
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
          ...signal
        }))
        /** [ABORT] */
        .then(res => {
          if(opts?.useAbort) {
            this.#requests.delete(requestKey);
          }
          return res;
        })
        /** [PLUGINS] */
        .then(async res => {
          for(const { afterFetch } of plugins) {
            res = await afterFetch?.(res) ?? res;
          }
          
          return res;
        })
        /** [STATUS] */
        .then(handleStatus)
        /** [RESPONSETYPE] */
        .then(res => res[opts?.responseType || responseType]())
        /** [TRANSFORM] */
        .then(data => opts?.transform?.(data) ?? data)
        /** [CACHE] */
        .then(data => {
          if(opts?.useCache) {
            this.#cache.set(requestKey, {
              updatedAt: Date.now(),
              data
            });
          }
          return data;
        })
        /** [DELAY] */
        .then(data => opts?.delay ? new Promise(resolve => setTimeout(() => resolve(data), opts.delay)) : data)
        /** [ABORT] */
        .catch(handleAbort);
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