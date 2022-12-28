/**
 * @param {string} path 
 * @returns {import('../index.js').Plugin}
 */
export function redirect(path) {
  return {
    name: 'redirect',
    shouldNavigate: () => ({
      condition: () => false,
      redirect: path
    })
  }
}