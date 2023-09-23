/**
 * @param {string|((context: import('../index.js').Context) => string)} path
 * @returns {import('../index.js').Plugin}
 */
export function redirect(path: string | ((context: import('../index.js').Context) => string)): import('../index.js').Plugin;
