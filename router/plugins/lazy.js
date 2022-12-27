/**
 * @example lazy(() => import('foo'))
 */
export function lazy(fn) {
  return {
    beforeNavigation: () => {
      fn();
    }
  }
}