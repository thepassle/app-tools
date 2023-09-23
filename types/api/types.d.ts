export type ResponseType = 'text' | 'json' | 'stream' | 'blob' | 'arrayBuffer' | 'formData' | 'stream';
export interface Config {
    plugins?: Plugin[];
    responseType?: ResponseType;
    baseURL?: string;
}
export type BodyMethod = <R>(url: string, data?: object, opts?: RequestOptions) => Promise<R>;
export type BodylessMethod = <R>(url: string, opts?: RequestOptions) => Promise<R>;
export type Method = 'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH';
export interface Plugin {
    beforeFetch?: (meta: MetaParams) => MetaParams | Promise<MetaParams> | void;
    afterFetch?: (res: Response) => void | Promise<void> | Response | Promise<Response>;
    transform?: (data: any) => any;
    name: string;
    handleError?: (e: Error) => boolean;
}
export interface CustomRequestOptions {
    transform?: (data: object) => object;
    responseType?: ResponseType;
    params?: Record<string, string>;
    plugins?: Plugin[];
    baseURL?: string;
}
export type RequestOptions = RequestInit & CustomRequestOptions;
export interface MetaParams {
    responseType: string;
    baseURL: string;
    url: string;
    method: Method;
    headers: Headers;
    opts?: RequestOptions;
    data?: any;
    fetchFn: typeof globalThis.fetch;
}
