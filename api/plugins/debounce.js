function _debounce(promise, opts = { timeout: 1000 }) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(promise(...args))
      }, opts.timeout);
    });
  };
}

/**
 * @param {{
 *  timeout: number
 * }} opts 
 * @returns {import('../index.js').Plugin}
 */
export function debouncePlugin(opts = {
  timeout: 1000
}) {
  let debounced;

  return {
    name: 'debounce',
    beforeFetch: (meta) => {
      if(!debounced) {
        const originalFetch = meta.fetchFn;
        debounced = _debounce(originalFetch, opts);
      }
      meta.fetchFn = debounced;
      return meta;
    },
  }
}

export const debounce = debouncePlugin();