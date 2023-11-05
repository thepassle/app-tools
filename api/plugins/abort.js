/**
 * @returns {import('../index.js').Plugin}
 */
export function abortPlugin() {
  let requestId;
  const requests = new Map();

  return {
    name: 'abort',
    beforeFetch: (meta) => {
      const { method, url } = meta;
      requestId = `${method}:${url}`;

      if(requests.has(requestId)) {
        const request = requests.get(requestId);
        request.abort();
      }
      requests.set(requestId, new AbortController());

      return {
        ...meta,
        opts: {
          ...meta.opts,
          signal: requests.get(requestId).signal
        }
      };
    },
    afterFetch: (res) => {
      requests.delete(requestId);
      return res;
    },
    // return true if an error should throw, return false if an error should be ignored
    handleError: ({name}) => name !== 'AbortError'
  }
}

export const abort = abortPlugin();