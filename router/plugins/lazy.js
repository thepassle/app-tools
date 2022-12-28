/**
 * @example lazy(() => import('foo'))
 * @param {any} fn
 * @returns {import('../index.js').Plugin}
 */
export function lazy(fn) {
  return {
    name: 'lazy',
    beforeNavigation: () => {
      fn();
    }
  }
}