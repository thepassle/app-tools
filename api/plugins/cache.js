const TEN_MINUTES = 1000 * 60 * 10;

/**
 * @param {{maxAge?: number}} options
 * @returns {import('../index.js').Plugin}
 */
export function cachePlugin({maxAge = TEN_MINUTES} = {}) {
  let requestId;
  const cache = new Map();

  return {
    name: 'cache',
    beforeFetch: (meta) => {
      const { method, url } = meta;
      requestId = `${method}:${url}`;

      if(cache.has(requestId)) {
        const cached = cache.get(requestId);
        if(cached.updatedAt > Date.now() - (maxAge)) {
          meta.fetchFn = () => Promise.resolve(new Response(JSON.stringify(cached.data), {status: 200}));
          return meta;
        }
      }
    },
    afterFetch: async (res) => {
      const clone = await res.clone();
      const data = await clone.json();

      cache.set(requestId, {
        updatedAt: Date.now(),
        data
      });

      return res;
    }
  }
}

export const cache = cachePlugin();