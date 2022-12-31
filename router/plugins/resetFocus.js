import { APP_TOOLS, VERSION } from '../../utils/CONSTANTS.js';

const FOCUS_ELEMENT_ID = 'router-focus';
const SR_ONLY_STYLE = `position:absolute;top:0;width:1px;height:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);clip-path:inset(50%);margin:-1px;`;

/**
 * @type {import('../index.js').Plugin}
 */
export const resetFocus = {
  name: 'resetFocus',
  afterNavigation: ({title}) => {
    let el = /** @type {HTMLElement} */ (document.querySelector(`div[${APP_TOOLS}][version="${VERSION}"]#${FOCUS_ELEMENT_ID}`));
    if (!el) {
      el = document.createElement('div');
      el.setAttribute(APP_TOOLS, '');
      el.setAttribute('version', VERSION);
      el.id = FOCUS_ELEMENT_ID;
      el.setAttribute('tabindex', '-1');
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('style', SR_ONLY_STYLE);
      el.addEventListener('blur', () => {
        el?.style.setProperty('display', 'none');
      });
  
      document.body.insertBefore(el, document.body.firstChild);
    }
  
    el.textContent = /** @type {string} */ (title);
    el.style.removeProperty('display');
    el.focus();  
  }
}