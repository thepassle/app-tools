/**
 * Syntax sugar to conditionally render a template
 *
 * @param {boolean} expression
 * @param {() => any} trueValue
 * @param {() => any} [falseValue]
 * @returns {any | undefined}
 */
 export function when(expression, trueValue, falseValue) {
  if (expression) {
    return trueValue();
  }

  if (falseValue) {
    return falseValue();
  }
  return undefined;
}