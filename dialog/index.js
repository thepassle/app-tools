import { APP_TOOLS } from '../utils/CONSTANTS.js';
import { setupGlobalDialogStyles } from './utils.js';
import { DialogStateEvent } from './events.js';
import { onePaint, animationsComplete } from '../utils/async.js';
import { createLogger } from '../utils/log.js';
const log = createLogger('dialog');

/**
 * @typedef {import('./types.js').DialogNode} DialogNode
 * @typedef {import('./types.js').DialogCallbacks} DialogCallbacks
 * @typedef {import('./types.js').Config} Config
 * @typedef {import('./types.js').OpenDialogOptions} OpenDialogOptions
 */

setupGlobalDialogStyles();

export class Dialog extends EventTarget {
  #id = '';
  /** @type {Config} */
  #config = {};
  isOpen = false;
  opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
  closed = new Promise((resolve) => {this.__resolveClosed = resolve;});

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    super();
    this.#config = config;
  }

  /**
   * @returns {DialogNode}
   */
  __initDialogNode() {
    const dialogNode = /** @type {DialogNode} */ (document.createElement('dialog'));
    dialogNode.setAttribute(APP_TOOLS, '');
    dialogNode.addEventListener('close', this.__onDialogClose);
    dialogNode.addEventListener('mousedown', this.__onLightDismiss);

    const form = document.createElement('form');
    form.setAttribute(APP_TOOLS, '');
    form.setAttribute('method', 'dialog');
    dialogNode.form = form;

    dialogNode.appendChild(form);

    return dialogNode;
  }

  __onLightDismiss = ({target}) => {
    if(target.nodeName === 'DIALOG') {
      this.close('dismiss');
    }
  }

  close = (kind = 'programmatic') => {
    this.__dialog?.close(kind);
  }

  __onDialogClose = async () => {
    const id = this.#id;
    const d = /** @type {DialogNode} */ (this.__dialog);

    log(`Closing dialog "${id}"`, { 
      id, 
      dialog: d,
      returnValue: d?.returnValue
    });

    d.removeAttribute('opened');
    d.setAttribute('closing', '');
    this.dispatchEvent(new DialogStateEvent('closing', { 
      id, 
      dialog: d, 
    }));
    try {
      await this.#config[id]?.closing?.({dialog: d});
    } catch(e) {
      log(`Dialog "${id}" error on closing hook`);
      throw e;
    }
    await animationsComplete(d);

    this.isOpen = false;
    d.removeAttribute('closing');
    d.setAttribute('closed', '');
    
    // @ts-ignore
    this.__resolveClosed(d);
    
    this.dispatchEvent(new DialogStateEvent('closed', { 
      id, 
      dialog: d 
    }));
    try {
      await this.#config[id]?.closed?.({dialog: d});
    } catch(e) {
      log(`Dialog "${id}" error on closed hook`);
      throw e;
    }
    log(`Closed dialog "${id}"`, { 
      id, 
      dialog: d, 
      returnValue: d?.returnValue 
    });

    d?.remove();
    this.__dialog = undefined;

    this.opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
    this.#id = '';
  }

  /**
   * @param {OpenDialogOptions} options 
   * @returns 
   */
  async open({id, parameters}) {
    if(!(id in this.#config)) {
      throw new Error(`No dialog configured for id: ${id}`);
    }
    this.#id = id;

    if(this.isOpen) {
      log(`Tried to open dialog "${id}" while it was already open.`, { id, parameters, dialog: this.__dialog });
      return;
    }

    this.__dialog = this.__initDialogNode();
    document.body.appendChild(this.__dialog);

    log(`Openening dialog "${id}"`, { id, parameters, dialog: this.__dialog });
    this.__dialog.setAttribute('opening', '');
    this.dispatchEvent(new DialogStateEvent('opening', { id, dialog: this.__dialog }));

    try {
      await this.#config?.[id]?.opening?.({dialog: this.__dialog, parameters});
    } catch(e) {
      log(`Dialog "${this.#id}" error on opening hook`);
      throw e;
    }
    await onePaint();

    this.__dialog.showModal();
    
    await animationsComplete(this.__dialog);

    this.isOpen = true;
    this.__dialog.removeAttribute('opening');
    this.__dialog.setAttribute('opened', '');
    // @ts-ignore
    this.__resolveOpened(this.__dialog);
    this.dispatchEvent(new DialogStateEvent('opened', { id, dialog: this.__dialog }));
    try {
      await this.#config?.[id]?.opened?.({dialog: this.__dialog, parameters});
    } catch(e) {
      log(`Dialog "${this.#id}" error on opened hook`);
      throw e;
    }
    log(`Opened dialog "${id}"`, { id, parameters, dialog: this.__dialog });
    this.closed = new Promise((resolve) => {this.__resolveClosed = resolve;});
  }

  /**
   * Can be used to modify the dialog
   * 
   * @example
   * dialog.modify(node => {node.classList.add('foo')});
   * @param {(dialog: DialogNode | undefined) => void} cb
   */
  modify(cb) {
    cb(this.__dialog);
  }
}
