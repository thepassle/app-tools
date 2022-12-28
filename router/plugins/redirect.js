export function redirect(path) {
  return {
    name: 'redirect',
    shouldNavigate: () => ({
      condition: () => false,
      redirect: path
    })
  }
}