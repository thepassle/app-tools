const LOG_SYMBOL = Symbol.for('app-tools::log::1.x');

export function setDebug(value) {
  debug = !!value;
}

window[LOG_SYMBOL] = { setDebug };
let debug = new URL(window.location.href).searchParams.has('app-tools-debug');

/**
 * @param {string} action - describing the action
 * @param {*} data - any js value
 */
export function log(action, data) {
  if(debug) {
    console.groupCollapsed(`[app-tools] ${action}`);
    console.log(data);
    console.groupEnd();
  }
}

export function createLogger(title) {
  return (action, data) => {
    log(`${title}: ${action}`, data);
  }
}