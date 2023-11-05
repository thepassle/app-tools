import { setAbortableTimeout } from '../../utils/async.js';

/**
 * @param {Response | (() => Response) | (() => Promise<Response>)} response
 * @returns {import('../index.js').Plugin}
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