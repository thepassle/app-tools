/**
 * `'state-changed'` event
 * @example this.dispatchEvent(new StateEvent(data));
 */
export class StateEvent extends Event {
    constructor(state?: {});
    state: {};
}
export class State extends EventTarget {
    constructor(initialState: any);
    setState(state: any): void;
    getState(): any;
    #private;
}
export const state: State;
