/**
 * @param {string|((context: import('../index.js').Context) => string)} path
 * @returns {import('../index.js').Plugin}
 */
export function redirect(path) {
  return {
    name: 'redirect',
    shouldNavigate: (context) => ({
      condition: () => false,
      redirect: typeof path === 'function' ? path(context) : path
    })
  }
}
