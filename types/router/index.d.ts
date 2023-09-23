/**
 * @typedef {import('./types.js').Plugin} Plugin
 * @typedef {import('./types.js').Context} Context
 * @typedef {import('./types.js').RouteDefinition} RouteDefinition
 * @typedef {import('./types.js').Route} Route
 * @typedef {import('./types.js').Config} Config
 */
export class Router extends EventTarget {
    /**
     * @param {Config} config
     */
    constructor(config: Config);
    context: {
        params: {};
        query: {};
        title: string;
        url: URL;
    };
    config: import("./types.js").Config;
    /** @type {Route[]} */
    routes: Route[];
    uninstall(): void;
    get url(): URL;
    get fallback(): URL;
    get baseUrl(): URL;
    /**
     * @template RenderResult
     */
    render<RenderResult>(): RenderResult;
    /**
     * @private
     * @param {URL} url
     * @returns {Route | null}
     */
    private _matchRoute;
    /**
     * @private
     */
    private _notifyUrlChanged;
    /**
     * @private
     */
    private _onPopState;
    /**
     * @private
     */
    private _onAnchorClick;
    /**
     * @private
     */
    private _collectPlugins;
    /**
     * @param {string | URL} url The URL to navigate to.
     * @param {{
     *    backNav?: boolean
     *  }} options options An options object to configure the navigation. The backNav property specifies whether the navigation is a backward navigation, which doesn't push the navigation into browser nav history.
     */
    navigate(url: string | URL, options?: {
        backNav?: boolean;
    }): Promise<void>;
    route: import("./types.js").Route;
}
export type Plugin = import('./types.js').Plugin;
export type Context = import('./types.js').Context;
export type RouteDefinition = import('./types.js').RouteDefinition;
export type Route = import('./types.js').Route;
export type Config = import('./types.js').Config;
