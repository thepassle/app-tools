export function debounce(f, scheduleTask, cancelTask) {
  let task;

  return (...args) => {
    cancelTask(task);
    task = scheduleTask(() => {
      task = null;
      f(...args);
    });
  };
}

export const debounceAtTimeout = (f, ms) => debounce(f, task => setTimeout(task, ms), clearTimeout);
export const debounceAtFrame = (f) => debounce(f, requestAnimationFrame, cancelAnimationFrame);

/**
 * @returns {Promise<number>}
 */
export const onePaint = () => new Promise(r => requestAnimationFrame(r));
/**
 * @param {HTMLElement} element 
 * @returns {Promise<PromiseSettledResult<Animation>[]>}
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