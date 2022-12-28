/**
 * @param {Function} f 
 * @returns {<Args>(...args: Args[]) => void}
 */
export function debounce(f) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      f(...args);
    });
  };
}

export const onePaint = () => new Promise(r => requestAnimationFrame(r));
/**
 * @param {HTMLElement} element 
 * @returns {Promise<*>}
 */
export const animationsComplete = element => Promise.allSettled(element.getAnimations().map(animation => animation.finished));

/**
 * @param {() => void} f 
 * @param {number} ms 
 * @param {{
 *  signal?: AbortSignal
 * }} options
 */
export function setAbortableTimeout(f, ms, {signal}) {
  let t;
  if(!signal?.aborted) {
    t = setTimeout(f, ms);
  }
  signal?.addEventListener('abort', () => clearTimeout(t), {once: true});
};

/**
 * @param {() => boolean} predicate 
 * @param {{
 *  timeout?: number,
 *  message?: string,
 *  interval?: number
 * }} options 
 * @returns {Promise<void>}
 */
export function waitUntil(predicate, options = {}) {
  const { 
    timeout = 1000,
    message = `waitUntil timed out after ${timeout}ms`, 
    interval = 50, 
  } = options;

  return new Promise((resolve, reject) => {
    let timeoutId;

    setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error(message));
    }, timeout);

    async function nextInterval() {
      try {
        if (await predicate()) {
          resolve();
        } else {
          timeoutId = setTimeout(() => {
            nextInterval();
          }, interval);
        }
      } catch (error) {
        reject(error);
      }
    }
    nextInterval();
  });
}