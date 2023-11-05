/** 
 * @param {{
 *  collapsed?: boolean
 * }} options
 * @returns {import('../index.js').Plugin} 
 */
export function loggerPlugin({collapsed = true} = {}) {
  let m;
  let start;
  const group = collapsed ? 'groupCollapsed' : 'group';
  return {
    name: 'logger',
    beforeFetch: (meta) => {
      console[group](`[START] [${new Date().toLocaleTimeString()}] [${meta.method}] "${meta.url}"`);
      console.table([meta]);
      console.groupEnd()
      start = Date.now();
      m = meta;
    },
    afterFetch: (r) => {
      console.log(`[END] [${m.method}] "${m.url}" Request took ${Date.now() - start}ms`);
      return r;
    }
  }
}

export const logger = loggerPlugin();