export function appName(name){
  return {
    beforeNavigation: (context) => {
      context.title = `${name} ${context.title}`
    }
  }
}