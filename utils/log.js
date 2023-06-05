const KEY = Symbol.for('app-tools::log::1.x');

globalThis[KEY] = { 
  setDebug, 
  debug: 'window' in globalThis ? new URL(window.location.href).searchParams.has('app-tools-debug') : false,
};

/**
 * @param {boolean} value 
 */
export function setDebug(value) {
  globalThis[KEY].debug = !!value;
}

/**
 * @returns {boolean}
 */
export function getDebug() {
  return globalThis[KEY].debug;
}

/**
 * @param {string} action - describing the action
 * @param {*} [data] - any js value
 */
export function log(action, data) {
  if(globalThis[KEY].debug) {
    console.groupCollapsed(`[app-tools] ${action}`);
    if(data) {
      console.log(data);
    }
    console.groupEnd();
  }
}

/**
 * @param {string} title 
 * @returns {(action: string, data?: any) => void}
 */
export function createLogger(title) {
  return (action, data) => {
    log(`${title}: ${action}`, data);
  }
}