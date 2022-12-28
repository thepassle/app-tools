import { APP_TOOLS } from '../utils/CONSTANTS.js';

const DIALOG_STYLES_ID = 'dialog-styles';

export function setupGlobalDialogStyles() {
  let el = document.head.querySelector(`style[${APP_TOOLS}]#${DIALOG_STYLES_ID}`);
  if (!el) {
    el = document.createElement('style');
    el.setAttribute(APP_TOOLS, '');
    el.id = DIALOG_STYLES_ID;
    el.innerHTML = `
      html:has(dialog[${APP_TOOLS}][open]) {
        overflow: hidden;
      }

      dialog[${APP_TOOLS}] {
        pointer-events: none;
        inset: 0;
        position: fixed;
        display: block;

        padding: 0;
        width: 200px;
        height: 200px;
      }

      dialog[${APP_TOOLS}] > form[${APP_TOOLS}] {
        width: calc(100% - 10px);
        height: calc(100% - 10px);
        margin: 0;
        padding: 5px;
      }

      dialog[${APP_TOOLS}][open] {
        pointer-events: auto;
      }
    `;
    document.head.prepend(el);
  }
}