/**
 * @param {number} [max=10] - Maximum number of concurrent requests
 * @returns {import('../index.js').Plugin}
 */
export function concurrencyPlugin(max = 10) {
  let active = 0;
  const queue = [];

  function release() {
    active--;
    if (queue.length > 0) {
      const next = queue.shift();
      active++;
      next();
    }
  }

  function acquire() {
    if (active < max) {
      active++;
      return Promise.resolve();
    }
    return new Promise((resolve) => queue.push(resolve));
  }

  return {
    name: "concurrency",
    async beforeFetch(params) {
      await acquire();
      return params;
    },
    afterFetch(params) {
      release();
      return params.response;
    },
    handleError() {
      release(); // release the slot on failures too
      return true; // still throw
    },
  };
}

export const concurrency = concurrencyPlugin();
