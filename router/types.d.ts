export interface Config {
  fallback?: string;
  plugins?: Plugin[];
  routes: RouteDefinition[];
}

export interface Plugin {
  name: string;
  shouldNavigate?: (context: Context) => {
    redirect: string,
    condition: () => boolean | (() => Promise<Boolean>),
  };
  beforeNavigation?: (context: Context) => void;
  afterNavigation?: (context: Context) => void;
}

export interface Context {
  title?: string;
  query: object;
  params: object;
  url: URL;
  dispatch: () => void;
  [key: string]: any;
}

export type Render<RenderResult> = (context: Context) => RenderResult;

export interface RouteDefinition {
  path: string;
  title: string | ((context: Partial<Context>) => string);
  render?: Render<RenderResult>;
  plugins?: Plugin[];
}

/** @TODO URLPattern type */
export type Route = RouteDefinition & { urlPattern?: any };