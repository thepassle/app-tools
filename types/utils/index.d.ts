/**
 * Syntax sugar to conditionally render a template
 *
 * @param {boolean} expression
 * @param {() => any} trueValue
 * @param {() => any} [falseValue]
 * @returns {any | undefined}
 */
export function when(expression: boolean, trueValue: () => any, falseValue?: () => any): any | undefined;
