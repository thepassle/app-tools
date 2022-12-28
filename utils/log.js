const KEY = Symbol.for('app-tools::log::1.x');

globalThis[KEY] = { 
  setDebug, 
  debug: new URL(window.location.href).searchParams.has('app-tools-debug')
};

export function setDebug(value) {
  globalThis[KEY].debug = !!value;
}

export function getDebug() {
  return globalThis[KEY].debug;
}

/**
 * @param {string} action - describing the action
 * @param {*} data - any js value
 */
export function log(action, data) {
  if(globalThis[KEY]) {
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