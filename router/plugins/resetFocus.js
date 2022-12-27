const FOCUS_ELEMENT_ID = 'router-focus-element';
const SR_ONLY_STYLE = `position:absolute;top:0;width:1px;height:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);clip-path:inset(50%);margin:-1px;`;

export const resetFocus = {
  afterNavigation: ({title}) => {
    let el = document.getElementById(FOCUS_ELEMENT_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = FOCUS_ELEMENT_ID;
      el.setAttribute('tabindex', '-1');
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('style', SR_ONLY_STYLE);
      el.addEventListener('blur', () => {
        el?.style.setProperty('display', 'none');
      });
  
      document.body.insertBefore(el, document.body.firstChild);
    }
  
    el.textContent = title;
    el.style.removeProperty('display');
    el.focus();  
  }
}