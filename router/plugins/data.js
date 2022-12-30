/**
 * @param {<Data>(context: import('../index.js').Context) => Promise<Data>} promise 
 * @returns {import('../index.js').Plugin}
 */
export function data(promise){
  return {
    name: 'data',
    beforeNavigation: async (context) => {
      const data = promise(context).then((data) => {
        context.data = data;
        context.dispatch();
        return data;
      });
      context.data = data;
    }
  }
}