/**
 * @param {boolean} value
 */
export function setDebug(value: boolean): void;
/**
 * @returns {boolean}
 */
export function getDebug(): boolean;
/**
 * @param {string} action - describing the action
 * @param {*} [data] - any js value
 */
export function log(action: string, data?: any): void;
/**
 * @param {string} title
 * @returns {(action: string, data?: any) => void}
 */
export function createLogger(title: string): (action: string, data?: any) => void;
