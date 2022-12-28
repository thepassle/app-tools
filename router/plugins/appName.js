/**
 * @param {string} name 
 * @returns {import('../index.js').Plugin}
 */
export function appName(name){
  return {
    name: 'appName',
    beforeNavigation: (context) => {
      context.title = `${name} ${context.title}`
    }
  }
}