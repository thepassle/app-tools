/**
 * @type {import('../index.js').Plugin}
 */
export const scrollToTop = {
  name: 'scrollToTop',
  beforeNavigation: () => {
    window.scrollTo(0, 0);
  }
}