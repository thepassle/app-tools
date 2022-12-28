export const scrollToTop = {
  name: 'scrollToTop',
  beforeNavigation: () => {
    window.scrollTo(0, 0);
  }
}