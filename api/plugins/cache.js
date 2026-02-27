const TEN_MINUTES = 1000 * 60 * 10;
const DEFAULT_MAX_SIZE = 100;

/**
 * @param {{maxAge?: number, maxSize?: number}} options
 * @returns {import('../index.js').Plugin}
 */
export function cachePlugin({
  maxAge = TEN_MINUTES,
  maxSize = DEFAULT_MAX_SIZE,
} = {}) {
  const cache = new Map();

  function evict() {
    const now = Date.now();
    for (const [key, value] of cache) {
      if (value.updatedAt <= now - maxAge) {
        cache.delete(key);
      }
    }
    // if still over maxSize, evict oldest entries
    if (cache.size > maxSize) {
      const overflow = cache.size - maxSize;
      const keys = cache.keys();
      for (let i = 0; i < overflow; i++) {
        cache.delete(keys.next().value);
      }
    }
  }

  return {
    name: "cache",
    beforeFetch: (meta) => {
      const { method, url } = meta;
      const requestId = `${method}:${url}`;
      if (cache.has(requestId)) {
        const cached = cache.get(requestId);
        if (cached.updatedAt > Date.now() - maxAge) {
          meta.fetchFn = () =>
            Promise.resolve(
              new Response(JSON.stringify(cached.data), { status: 200 }),
            );
          return meta;
        }
      }
    },
    afterFetch: async ({ response, method, url }) => {
      const requestId = `${method}:${url}`;
      const clone = response.clone();
      const data = await clone.json();
      cache.set(requestId, { updatedAt: Date.now(), data });
      evict();
      return response;
    },
  };
}

export const cache = cachePlugin();
