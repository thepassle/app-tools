/**
 * @param {Response | (() => Response) | (() => Promise<Response>)} response
 * @returns {import('../index.js').Plugin}
 */
export function mock(response: Response | (() => Response) | (() => Promise<Response>)): import('../index.js').Plugin;
