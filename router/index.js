import { createLogger } from '../utils/log.js';
const log = createLogger('router');

class RouteEvent extends Event {
  /**
   * @param {Context} context 
   */
  constructor(context) {
    super('route-changed');
    this.context = context;
  }
}

/**
 * @typedef {import('./types.js').Plugin} Plugin
 * @typedef {import('./types.js').Context} Context
 * @typedef {import('./types.js').RouteDefinition} RouteDefinition
 * @typedef {import('./types.js').Route} Route
 * @typedef {import('./types.js').Config} Config
 */

export class Router extends EventTarget {
  context = {
    params: {},
    query: {},
    title: '',
    url: new URL(window.location.href),
  }

  /**
   * @param {Config} config 
   */
  constructor(config) {
    super();
    this.config = config;

    /** @type {Route[]} */
    this.routes = config.routes.map((route) => {
      const r = /** @type {unknown} */ ({
        ...route,
        // @ts-ignore
        urlPattern: new URLPattern({
          pathname: route.path,
          baseURL: window.location.href,
          search: '*',
          hash: '*',
        }),
      });
      return /** @type {Route} */ (r);
    });
    log('Initialized routes', this.routes);

    queueMicrotask(() => {
      this.navigate(new URL(window.location.href), { replace: true });
    });
    window.addEventListener('popstate', this._onPopState);
    window.addEventListener('click', this._onAnchorClick);
  }

  uninstall() {
    window.removeEventListener('popstate', this._onPopState);
    window.removeEventListener('click', this._onAnchorClick);
  }

  get url() {
    return new URL(window.location.href);
  }

  get fallback() {
    return new URL(
      this.config?.fallback || this.baseUrl.href.substring(window.location.origin.length), 
      this.baseUrl
    )
  }

  get baseUrl() {
    return new URL('./', document.baseURI);
  }

  /**
   * @template RenderResult
   */
  render() {
    log(`Rendering route ${this.context.url.pathname}${this.context.url.search}${this.context.url.hash}`, { context: this.context, route: this.route });
    return /** @type {RenderResult} */ (this.route?.render?.(this.context));
  }

  /**
   * @private
   * @param {URL} url 
   * @returns {Route | null}
   */
  _matchRoute(url) {
    for (const route of this.routes) {
      const match = route.urlPattern.exec(url);
      if (match) {
        const { title } = route;
        const query = Object.fromEntries(new URLSearchParams(url.search)); 
        const params = match?.pathname?.groups ?? {};
        this.context = {
          url,
          title: typeof title === 'function' ? title({params, query, url}) : title,
          params,
          query,
        }
        return route;
      }
    }
    log(`No route matched for ${url.pathname}${url.search}${url.hash}`, url);
    return null;
  }
  
  /**
   * @private
   */
  _notifyUrlChanged() {
    this.dispatchEvent(new RouteEvent(this.context));
  }

  /**
   * @private
   */
  _onPopState = () => {
    this.navigate(new URL(window.location.href), { backNav: true });
  }

  /**
   * @private
   */
  _onAnchorClick = (e) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey
    ) {
      return;
    }

    const a = e.composedPath().find((el) => el.tagName === 'A');
    if (!a || !a.href) return;

    const url = new URL(a.href);

    if (this.url.href === url.href) return;
    if (url.host !== window.location.host) return;
    if (a.hasAttribute('download') || a.href.includes('mailto:')) return;

    const target = a.getAttribute('target');
    if (target && target !== '' && target !== '_self') return;
    
    e.preventDefault();
    this.navigate(url);
  }

  /**
   * @private 
   */
  _collectPlugins(route) {
    return [
      ...(this.config?.plugins ?? []), 
      ...(route?.plugins ?? []),
    ]
  }

  /**
   * @param {string | URL} url The URL to navigate to.
   * @param {{
   *    backNav?: boolean,
   *    replace?: boolean,
   *  }} options options An options object to configure the navigation. The backNav property specifies whether the navigation is a backward navigation, which doesn't push the navigation into browser nav history.
   */
  async navigate(url, options = {}) {
    if (typeof url === 'string') {
      url = new URL(url, this.baseUrl);
    }
    
    let route = this._matchRoute(url) || this._matchRoute(this.fallback);
    log(`Navigating to ${url.pathname}${url.search}${url.hash}`, { context: this.context, route: this.route });

    /** @type {Plugin[]} */
    let plugins = this._collectPlugins(route);

    for (const plugin of plugins) {
      try {
        const result = await plugin?.shouldNavigate?.(this.context);
        if (result) {
          const condition = await result.condition();
          if (!condition) {
            url = new URL(result.redirect, this.baseUrl);
            route = this._matchRoute(url) || this._matchRoute(this.fallback);
            plugins = this._collectPlugins(route);
            log('Redirecting', { context: this.context, route: this.route });
          }
        }
      } catch(e) {
        log(`Plugin "${plugin.name}" error on shouldNavigate hook`, e);
        throw e;
      }
    }

    this.route = route;

    if (!this.route) {
      throw new Error(`[ROUTER] No route or fallback matched for url ${url}`);
    }

    for (const plugin of plugins) {
      try {
        await plugin?.beforeNavigation?.(this.context);
      } catch(e) {
        log(`Plugin "${plugin.name}" error on beforeNavigation hook`, e);
        throw e;
      }
    }

    if (options?.replace) {
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    } else if (!options.backNav) {
      window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }

    document.title = this.context.title;
    this._notifyUrlChanged();

    for (const plugin of plugins) {
      try {
        await plugin?.afterNavigation?.(this.context);
      } catch(e) {
        log(`Plugin "${plugin.name}" error on afterNavigation hook`, e);
        throw e;
      }
    }
  }
}
