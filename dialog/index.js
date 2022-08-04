/**
 * @typedef {Object} RenderParams
 * @property {string} title
 * @property {Element} dialog
 * @property {any} parameters
 */

/**
 * @typedef {Object} DialogConfiguration
 * @property {() => Promise<any>} import
 * @property {string | (({parameters: any}) => string)} title
 * @property {((renderParams: RenderParams) => void) | ((renderParams: RenderParams) => Promise<void>)} render
 */

/**
 * @typedef {Record<string, DialogConfiguration>} Dialogs
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

  dialog > div {
    width: calc(100% - 10px);
    height: calc(100% - 10px);
    padding: 5px;
  }
`;

export class Dialog extends EventTarget {
  open = false;
  opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
  closed = new Promise((resolve) => {this.__resolveClosed = resolve;});

  /** @param {Dialogs} dialogs */
  constructor(dialogs) {
    super();
    /** @type {Dialogs} */
    this.__dialogs = dialogs;
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
    this.__dialog.innerHTML = '';
    this.__dialog.remove();

    await onePaint();
    this.open = false;
    this.__resolveClosed();
    this.dispatchEvent(new DialogStateEvent('closed'));
    this.opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
  }
  
  async openDialog({id, parameters}) {
    const dialog = this.__dialogs[id];
    if(!dialog) throw new Error(`Couldn't find dialog configuration for id: ${id}`);

    this.dispatchEvent(new DialogStateEvent('opening'));
    
    const container = document.createElement('div');
    this.__dialog.appendChild(container);

    await dialog.render({
      title: typeof dialog.title === 'function' ? dialog.title({parameters}) : dialog.title,
      dialog: container,
      parameters
    });

    document.body.appendChild(this.__dialog);
    this.__dialog.showModal();
    
    await onePaint();
    this.open = true;
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

export const dialog = new Dialog({
  foo: {
    import: () => import('./foo.js'),
    title: 'foo',
    render: async ({title, dialog, parameters}) => {
      dialog.innerHTML = '<h1>foo</h1>';
    }
  }
});