export const DEV = true;
export const PROD = false;
export let ENV = 'dev';
/**
 * @param {string} env
 */
export function setEnv(env) {
  ENV = env;
}
