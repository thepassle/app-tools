export const DEV = false;
export const PROD = true;
export let ENV = 'prod';
/**
 * @param {string} env
 */
export function setEnv(env) {
  ENV = env;
}
