/**
 * @typedef {Object} DialogOptions
 * @param {() => Promise<any>} import
 * @param {string | ((Parameters) => string)} title
 * @param {() => Element} render
 */

class DialogStateEvent extends Event {
  /** @param {'opening' | 'opened' | 'closing' | 'closed'} kind */
  constructor(kind) {
    super(kind);
  }
}

const onePaint = () => new Promise(res => requestAnimationFrame(res));

const dialogStyles = document.createElement('style');
dialogStyles.setAttribute('dialog-styles', '');
dialogStyles.innerHTML = `
  dialog {
    padding: 0;
  }
`;

export class Dialog extends EventTarget {
  open = false;
  opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
  closed = new Promise((resolve) => {this.__resolveClosed = resolve;});

  /** @param {DialogOptions} dialogOptions */
  constructor(dialogOptions) {
    super();
    this.__dialogOptions = dialogOptions;
    /** @type {HTMLDialogElement} */
    this.__dialog = document.createElement('dialog');
    this.__dialog.addEventListener('close', this.__onDialogClose);
    this.__dialog.addEventListener('mousedown', this.__onLightDismiss);
    document.head.prepend(dialogStyles);
  }

  __onLightDismiss = ({target}) => {
    if(target.nodeName === 'DIALOG') {
      this.close();
    }
  }
  
  __onDialogClose = async () => {
    this.dispatchEvent(new DialogStateEvent('closing'));
    this.open = false;
    this.__dialog.remove();

    await onePaint();
    this.__resolveClosed();
    this.dispatchEvent(new DialogStateEvent('closed'));
    this.opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
  }
  
  async openDialog({id, parameters}) {
    const dialog = this.__dialogOptions[id];
    if(!dialog) throw new Error(`Couldn't find dialog configuration for id: ${id}`);

    this.dispatchEvent(new DialogStateEvent('opening'));
    
    // dialog.render({parameters});
    const dialogContainer = document.createElement('dialog-container');
    dialogContainer.dialogTitle = typeof dialog.title === 'function' ? dialog.title({parameters}) : dialog.title;
    this.__dialog.innerHTML = '';
    this.__dialog.appendChild(dialogContainer);

    document.body.appendChild(this.__dialog);
    this.__dialog.showModal();
    this.open = true;

    await onePaint();
    this.__resolveOpened();
    this.dispatchEvent(new DialogStateEvent('opened'));
    this.closed = new Promise((resolve) => {this.__resolveClosed = resolve;});
  }

  close() {
    this.__dialog.close();
  }

  /**
   * Can be used to modify the dialog
   * 
   * @param {(dialogNode: HTMLDialogElement) => void} cb
   * 
   * @example
   * dialog.modify(node => {node.classList.add('foo')});
   */
  modify(cb) {
    cb(this.__dialog);
  }
}

class DialogContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 5px;
        }
      </style>
      <h1>${this.dialogTitle}</h1>
      <button>close</button>
      <slot></slot>
    `;
  }
}

customElements.define('dialog-container', DialogContainer);

export const dialog = new Dialog({
  foo: {
    import: () => import('./foo.js'),
    title: 'foo',
    render: ({parameters}) => {}
  }
});