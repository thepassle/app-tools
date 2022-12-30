import { createLogger } from '../utils/log.js';
const log = createLogger('state');

/**
 * `'state-changed'` event
 * @example this.dispatchEvent(new StateEvent(data));
 */
export class StateEvent extends Event {
  constructor(state = {}) {
    super('state-changed');
    this.state = state;
  }
}

export class State extends EventTarget {
  #state;
  
  constructor(initialState) {
    super();
    this.#state = initialState;
  }

  setState(state) {
    log('Before: ', this.#state);
    this.#state = typeof state === 'function' ? state?.(this.#state) : state;
    log('After: ', this.#state);
    this.dispatchEvent(new StateEvent(this.#state));
  }

  getState() {
    return this.#state;
  }
}

export const state = new State({});