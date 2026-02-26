/**
 * @param {object} options
 * @param {number} [options.maxRetries=5] - Maximum number of retries
 * @param {number[]} [options.delays=[1000, 2000, 4000, 8000, 16000]] - Delay in ms per retry attempt
 * @param {(e: Error) => boolean} [options.shouldRetry] - Optional predicate to control which errors are retried
 * @returns {import('../index.js').Plugin}
 */
export function retry({ maxRetries, delays, shouldRetry, }?: {
    maxRetries?: number;
    delays?: number[];
    shouldRetry?: (e: Error) => boolean;
}): import('../index.js').Plugin;
