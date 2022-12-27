export function debounce(f) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      f(...args);
    });
  };
}

export function waitUntil(predicate, options = {}) {
  const { 
    timeout = 1000,
    message = `waitUntil timed out after ${timeout}ms`, 
    interval = 50, 
  } = options;

  return new Promise((resolve, reject) => {
    let timeoutId;

    setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error(message));
    }, timeout);

    async function nextInterval() {
      try {
        if (await predicate()) {
          resolve();
        } else {
          timeoutId = setTimeout(() => {
            nextInterval();
          }, interval);
        }
      } catch (error) {
        reject(error);
      }
    }
    nextInterval();
  });
}