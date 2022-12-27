export function redirect(path) {
  return {
    shouldNavigate: () => ({
      condition: () => false,
      redirect: path
    })
  }
}