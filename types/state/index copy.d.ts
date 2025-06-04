/**
 * `'state-changed'` event
 * @template T
 * @example this.dispatchEvent(new StateEvent(data));
 */
export class StateEvent<T> extends Event {
    /**
     * @param {T} state
     */
    constructor(state: T);
    /** @type {T} */
    state: T;
}
/**
 * @template T
 * @typedef {{
 *  name: string,
 *  update?: (prevState: T, newState: T) => T,
 *  effect?: (prevState: T, newState: T) => void | Promise<void>,
 * }} Plugin
 */
/**
 * @template T
 * @extends EventTarget
 */
export class State<T> extends EventTarget {
    /**
     * @param {T} initialState
     * @param {Array<{ update: (prevState: T, newState: T) => T }>} [plugins=[]]
     */
    constructor(initialState: T, plugins?: {
        update: (prevState: T, newState: T) => T;
    }[]);
    /**
     * @param {T | ((prevState: T) => T)} state
     * @param {boolean} [broadcast=true]
     */
    setState(state: T | ((prevState: T) => T), broadcast?: boolean): void;
    /**
     * @returns {T}
     */
    getState(): T;
    #private;
}
export const state: State<{}>;
export type Plugin<T> = {
    name: string;
    update?: (prevState: T, newState: T) => T;
    effect?: (prevState: T, newState: T) => void | Promise<void>;
};
