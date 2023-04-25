/**
 * @param {<Data>(context: import('../index.js').Context) => Promise<Data>} promise
 * @returns {import('../index.js').Plugin}
 */
export function data(promise: <Data>(context: import('../index.js').Context) => Promise<Data>): import('../index.js').Plugin;
