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
    constructor(config?: Config);
    config: {
        plugins: import("./types.js").Plugin[];
        responseType: string;
        baseURL?: string;
    };
    /**
     * @param {string} url
     * @param {Method} method
     * @param {RequestOptions} [opts]
     * @param {object} [data]
     * @returns
     */
    fetch(url: string, method: Method, opts?: RequestOptions, data?: object): Promise<any>;
    /** @type {import('./types.js').BodylessMethod<object>} */
    get: import('./types.js').BodylessMethod<object>;
    /** @type {import('./types.js').BodylessMethod<object>} */
    options: import('./types.js').BodylessMethod<object>;
    /** @type {import('./types.js').BodylessMethod<object>} */
    delete: import('./types.js').BodylessMethod<object>;
    /** @type {import('./types.js').BodylessMethod<object>} */
    head: import('./types.js').BodylessMethod<object>;
    /** @type {import('./types.js').BodyMethod<object>} */
    post: import('./types.js').BodyMethod<object>;
    /** @type {import('./types.js').BodyMethod<object>} */
    put: import('./types.js').BodyMethod<object>;
    /** @type {import('./types.js').BodyMethod<object>} */
    patch: import('./types.js').BodyMethod<object>;
}
export const api: Api;
export type Config = import('./types.js').Config;
export type Method = import('./types.js').Method;
export type Plugin = import('./types.js').Plugin;
export type CustomRequestOptions = import('./types.js').CustomRequestOptions;
export type RequestOptions = import('./types.js').RequestOptions;
export type MetaParams = import('./types.js').MetaParams;
