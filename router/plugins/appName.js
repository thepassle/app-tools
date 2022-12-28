export function appName(name){
  return {
    name: 'appName',
    beforeNavigation: (context) => {
      context.title = `${name} ${context.title}`
    }
  }
}