export interface Config {
  fallback?: string;
  plugins?: Plugin[];
  routes: RouteDefinition[];
}

export interface ShouldNavigateResult {
  redirect: string;
  condition: (() => boolean) | (() => Promise<boolean>);
}

export interface Plugin {
  name: string;
  shouldNavigate?: ((context: Context) => ShouldNavigateResult) | ((context: Context) => Promise<ShouldNavigateResult>);
  beforeNavigation?: (context: Context) => void;
  afterNavigation?: (context: Context) => void;
}

export interface Context {
  title?: string;
  query: Record<string, string>;
  params: Record<string, string>;
  url: URL;
  [key: string]: any;
}

export type Render<RenderResult> = (context: Context) => RenderResult;

export interface RouteDefinition<RenderResult = unknown> {
  path: string;
  title: string | ((context: Partial<Context>) => string);
  render?: Render<RenderResult>;
  plugins?: Plugin[];
}

/** @TODO URLPattern type */
export type Route = RouteDefinition & { urlPattern?: any };