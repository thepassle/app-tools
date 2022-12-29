export const media = {
  MIN: {
    XXXL: createMatch('(min-width: 1440px)'),
    XXL: createMatch('(min-width: 1280px)'),
    XL: createMatch('(min-width: 960px)'),
    LG: createMatch('(min-width: 840px)'),
    MD: createMatch('(min-width: 600px)'),
    SM: createMatch('(min-width: 480px)'),
    XS: createMatch('(min-width: 320px)'),
    XXS: createMatch('(min-width: 0px)'),
    XXXS: createMatch('(min-width: 0px)'),
  },
  MAX: {
    XXXL: createMatch('(max-width: 1600px)'),
    XXL: createMatch('(max-width: 1440px)'),
    XL: createMatch('(max-width: 1280px)'),
    LG: createMatch('(max-width: 960px)'),
    MD: createMatch('(max-width: 840px)'),
    SM: createMatch('(max-width: 600px)'),
    XS: createMatch('(max-width: 480px)'),
    XXS: createMatch('(max-width: 320px)'),
    XXXS: createMatch('(max-width: 0px)'),
  },
  STANDALONE: createMatch('(display-mode: standalone)'),
  REDUCED_MOTION: createMatch('(prefers-reduced-motion: reduce)'),
  DARK_MODE: createMatch('(prefers-color-scheme: dark)'),
  LIGHT_MODE: createMatch('(prefers-color-scheme: light)'),
};

function createMatch(query) {
  return function match(callback) {
    const mediaQuery = window.matchMedia(query);

    if(callback) {
      function executeCb({matches}) {
        callback?.(matches);
      }

      mediaQuery.addListener(executeCb);
      callback(mediaQuery.matches);
      return () => {
        mediaQuery.removeListener(executeCb);
      }
    }
    return mediaQuery.matches;
  }
}