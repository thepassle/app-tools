import { createLogger } from "../utils/log.js";
const log = createLogger("state");

/**
 * `'state-changed'` event
 * @template T
 * @example this.dispatchEvent(new StateEvent(data));
 */
export class StateEvent extends Event {
  /**
   * @param {T} state
   */
  constructor(state) {
    super("state-changed");
    /** @type {T} */
    this.state = state;
  }
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
export class State extends EventTarget {
  /** @type {T} */
  #state;

  /** @type {Array<Plugin<T>>} */
  #plugins = [];

  /**
   * @param {T} initialState
   * @param {Array<Plugin<T>>} [plugins=[]]
   */
  constructor(initialState, plugins = []) {
    super();
    this.#state = initialState;
    this.#plugins = plugins;
  }

  /**
   * @param {T | ((prevState: T) => T)} state
   * @param {boolean} [broadcast=true]
   */
  setState(state, broadcast = true) {
    log("Before: ", this.#state);
    const prevState = this.#state;
    const s =
      typeof state === "function"
        ? /** @type {(prevState: T) => T} */ (state)(prevState)
        : state;
    this.#state = this.#plugins.filter(plugin => plugin.update).reduce(
      (newState, plugin) => {
        try {
          const result = plugin.update(prevState, newState);
          if (!result) {
            console.warn(`Plugin "${plugin.name}" returned undefined or null, using new state as is.`);
            return newState;
          }
          return result;
        } catch (error) {
          console.error(`Error in plugin "${plugin.name}":`, error);
          return newState;
        }
      },
      structuredClone(s)
    );

    if (broadcast) {
      this.dispatchEvent(new StateEvent(this.#state));
    }

    Promise.all(
      this.#plugins
        .filter((plugin) => plugin.effect)
        .map(async (plugin) => {
          try {
            return await plugin.effect(prevState, this.#state);
          } catch (error) {
            console.error(`Error in plugin "${plugin.name}":`, error);
          }
        })
    );

    log("After: ", this.#state);
  }

  /**
   * @returns {T}
   */
  getState() {
    return structuredClone(this.#state);
  }
}

export const state = new State({});
