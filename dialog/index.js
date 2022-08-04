/**
 * @typedef {Object} RenderParams
 * @property {Element} dialog
 * @property {any} parameters
 * 
 * @typedef {HTMLDialogElement & { container: HTMLDivElement }} DialogNode
 * 
 * @typedef {Object} Plugin
 * @property {((pluginParams: {dialog: DialogNode, parameters: any}) => void) | ((pluginParams: {dialog: DialogNode, parameters: any}) => Promise<void>)} [opening]
 * @property {((pluginParams: {dialog: DialogNode, parameters: any}) => void) | ((pluginParams: {dialog: DialogNode, parameters: any}) => Promise<void>)} [opened]
 * @property {((pluginParams: {dialog: DialogNode}) => void) | ((pluginParams: {dialog: DialogNode}) => Promise<void>)} [closing]
 * @property {((pluginParams: {dialog: DialogNode}) => void) | ((pluginParams: {dialog: DialogNode}) => Promise<void>)} [closed]
 * 
 * @typedef {Plugin} DialogConfiguration
 * 
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
document.head.prepend(dialogStyles);

export class Dialog extends EventTarget {
  open = false;
  opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
  closed = new Promise((resolve) => {this.__resolveClosed = resolve;});

  /** @param {Dialogs} dialogs */
  constructor(dialogs) {
    super();
    /** @type {Dialogs} */
    this.__dialogs = dialogs;
    /** @type {DialogNode} */
    // 🚨 @TODO MAYBE DONT REUSE THE DIALOG, BUT CREATE IT ON OPENDIALOG AND THEN REMOVE IT ON CLOSE
    this.__dialog = /** @type {DialogNode} */ (document.createElement('dialog'));
    this.__dialog.addEventListener('close', this.__onDialogClose);
    this.__dialog.addEventListener('mousedown', this.__onLightDismiss);
  }

  __onLightDismiss = ({target}) => {
    if(target.nodeName === 'DIALOG') {
      this.close();
    }
  }

  close() {
    this.__dialog.close();
  }
  
  __onDialogClose = async () => {
    this.dispatchEvent(new DialogStateEvent('closing'));
    this.__currentDialog?.closing?.({dialog: this.__dialog});
    this.__dialog.innerHTML = '';
    this.__dialog.remove();

    await onePaint();
    this.open = false;
    // @ts-ignore
    this.__resolveClosed();
    this.dispatchEvent(new DialogStateEvent('closed'));
    this.__currentDialog?.closed?.({dialog: this.__dialog});
    this.opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
    this.__currentDialog = undefined;
  }
  
  /**
   * @param {{
   *  id: string,
   *  parameters?: any,
   * }} options
   */
  async openDialog({id, parameters}) {
    this.__currentDialog = this.__dialogs[id];
    if(!this.__currentDialog) throw new Error(`Couldn't find dialog configuration for id: ${id}`);

    const container = document.createElement('div');
    this.__dialog.container = container;
    this.__dialog.appendChild(container);

    this.dispatchEvent(new DialogStateEvent('opening'));
    this.__currentDialog.opening?.({dialog: this.__dialog, parameters});

    document.body.appendChild(this.__dialog);
    this.__dialog.showModal();
    
    await onePaint();

    this.open = true;
    // @ts-ignore
    this.__resolveOpened(this.__dialog);
    this.dispatchEvent(new DialogStateEvent('opened'));
    this.__currentDialog.opened?.({dialog: this.__dialog, parameters});


    this.closed = new Promise((resolve) => {this.__resolveClosed = resolve;});
  }

  /**
   * Can be used to modify the dialog
   * 
   * @param {(dialogNode: DialogNode) => void} cb
   * 
   * @example
   * dialog.modify(node => {node.classList.add('foo')});
   */
  modify(cb) {
    cb(this.__dialog);
  }
}