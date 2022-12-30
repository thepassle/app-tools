/**
 * @param {<Data>(context: import('../index.js').Context) => Promise<Data>} promise 
 * @returns {import('../index.js').Plugin}
 */
export function data(promise){
  return {
    name: 'data',
    beforeNavigation: async (context) => {
      const data = promise(context);
      context.data = data;
    }
  }
}