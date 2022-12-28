/**
 * @param {() => void} f 
 * @param {number} ms 
 * @param {{
 *  signal?: AbortSignal
 * }} [options]
 */
function setAbortableTimeout(f, ms, {signal}) {
  let t;
  if(!signal?.aborted) {
    t = setTimeout(f, ms);
  }
  signal?.addEventListener('abort', () => clearTimeout(t), {once: true});
};

/**
 * @param {Response | (() => Response) | (() => Promise<Response>)} response
 * @returns {import('../index').Plugin}
 */
export function mock(response) {
  return {
    name: 'mock',
    beforeFetch: (meta) => {
      meta.fetchFn = function mock(_, opts) {
        return new Promise(r => setAbortableTimeout(
          () => r(typeof response === 'function' ? response() : response), 
          Math.random() * 1000, 
          opts?.signal ? { signal: opts.signal } : {}
        ))
      }
      return meta;
    }
  }
}