/**
 * @example lazy(() => import('foo'))
 */
export function lazy(fn) {
  return {
    name: 'lazy',
    beforeNavigation: () => {
      fn();
    }
  }
}