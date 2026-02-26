/**
 * @param {object} options
 * @param {number} [options.maxRetries=5] - Maximum number of retries
 * @param {number[]} [options.delays=[1000, 2000, 4000, 8000, 16000]] - Delay in ms per retry attempt
 * @param {(e: Error) => boolean} [options.shouldRetry] - Optional predicate to control which errors are retried
 * @returns {import('../index.js').Plugin}
 */
export function retry({
  maxRetries = 5,
  delays = [1000, 2000, 4000, 8000, 16000],
  shouldRetry = () => true,
} = {}) {
  return {
    name: "retry",
    handleError(e) {
      // Returning false suppresses the throw — we handle retrying in beforeFetch
      return true;
    },
    async beforeFetch(context) {
      const { fetchFn } = context;
      // Wrap fetchFn to add retry logic
      context.fetchFn = async (url, opts) => {
        let attempt = 0;
        while (true) {
          try {
            return await fetchFn(url, opts);
          } catch (e) {
            const isRetryable = shouldRetry(/** @type {Error} */ (e));
            const hasAttempts = attempt < maxRetries;
            if (!isRetryable || !hasAttempts) throw e;
            const delay = delays[attempt] ?? delays[delays.length - 1];
            console.warn(
              `[retry] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
              /** @type {Error} */ (e).message,
            );
            await new Promise((res) => setTimeout(res, delay));
            attempt++;
          }
        }
      };
      return context;
    },
  };
}
