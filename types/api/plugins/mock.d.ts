/**
 * @param {Response | (() => Response) | (() => Promise<Response>)} response
 * @returns {import('../index').Plugin}
 */
export function mock(response: Response | (() => Response) | (() => Promise<Response>)): import('../index').Plugin;
