const window = {}
function fooPlugin() {console.log('foo plugin')}
function barPlugin() {console.log('bar plugin')}
function bazPlugin() {console.log('baz plugin')}
class URLPattern {}

function initializeRoutes(routes) {
  const initializedRoutes = [];

  function traverseRoutes(routes, parentPath = '', parentPlugins = [], parentRenderFunctions = []) {
    for (const route of routes) {
      const path = parentPath + route.path;
      const plugins = [...parentPlugins, ...(route.plugins || [])];
      const renderFunctions = [...parentRenderFunctions, route.render];
      
      const { render, ...routeConfig } = route;

      initializedRoutes.push({ 
        ...routeConfig, 
        urlPattern: new URLPattern({
          pathname: path,
          baseURL: window?.location?.href,
          search: '*',
          hash: '*',
        }),
        // @TODO: remove path here, its not needed, instead we want the URLPattern
        path,
        plugins, 
        renderFunctions 
      });

      if (route.children) {
        traverseRoutes(route.children, path, plugins, renderFunctions);
      }
    }
  }

  traverseRoutes(routes);

  return initializedRoutes;
}

class Router {
  constructor({routes}) {
    this.routes = initializeRoutes(routes);
  }

  render(path) {
    const route = this.routes.find(route => route.path === path);
    if (route) {
      let children = undefined;
      for (const render of [...route.renderFunctions].reverse()) {
        children = render({ children });
      }
      return children;
    } else {
      return `Error: No route found for path "${path}"`;
    }
  }
}


const router = new Router({
  routes: [
    {
      title: 'home',
      path: '/home',
      render: () => 'home'
    },
    {
      path: '/foo',
      plugins: [fooPlugin],
      render: ({children}) => `<h1>foo</h1><main>${children}</main>`,
      children: [
        {
          path: '/bar',
          plugins: [barPlugin],
          render: ({children}) => `<h2>bar</h2><article>${children}</article>`,
          children: [
            {
              path: '/baz',
              plugins: [bazPlugin],
              render: () => 'baz',
              children: [],
            }
          ]
        }
      ]
    }
  ]
});

console.log(router.routes);
console.log(router.render('/foo'));
console.log(router.render('/foo/bar'));
console.log(router.render('/foo/bar/baz'));

