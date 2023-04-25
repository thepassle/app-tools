export function debounce(f: any, scheduleTask: any, cancelTask: any): (...args: any[]) => void;
/**
 * @param {() => void} f
 * @param {number} ms
 * @param {{
 *  signal?: AbortSignal
 * }} options
 */
export function setAbortableTimeout(f: () => void, ms: number, { signal }: {
    signal?: AbortSignal;
}): void;
/**
 * @param {() => boolean} predicate
 * @param {{
 *  timeout?: number,
 *  message?: string,
 *  interval?: number
 * }} options
 * @returns {Promise<void>}
 */
export function waitUntil(predicate: () => boolean, options?: {
    timeout?: number;
    message?: string;
    interval?: number;
}): Promise<void>;
export function debounceAtTimeout(f: any, ms: any): (...args: any[]) => void;
export function debounceAtFrame(f: any): (...args: any[]) => void;
export function onePaint(): Promise<number>;
export function animationsComplete(element: HTMLElement): Promise<PromiseSettledResult<Animation>[]>;
