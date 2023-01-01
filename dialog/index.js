import { APP_TOOLS, VERSION } from '../utils/CONSTANTS.js';
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
 * @typedef {import('./types.js').Context} Context
 */

setupGlobalDialogStyles();

export class Dialog extends EventTarget {
  #id = '';
  /** @type {Config} */
  #config = {};
  isOpen = false;
  opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
  closed = new Promise((resolve) => {this.__resolveClosed = resolve;});
  /** @type {Context} */
  context = {
    dialog: undefined,
    id: '',
    parameters: {}
  }

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
    dialogNode.setAttribute('version', VERSION);
    dialogNode.addEventListener('close', this.__onDialogClose);
    dialogNode.addEventListener('mousedown', this.__onLightDismiss);

    const form = document.createElement('form');
    form.setAttribute(APP_TOOLS, '');
    form.setAttribute('version', VERSION);
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

    log(`Closing dialog "${id}"`, this.context);

    d.removeAttribute('opened');
    d.setAttribute('closing', '');
    this.dispatchEvent(new DialogStateEvent('closing', this.context));
    try {
      await this.#config[id]?.closing?.(this.context);
    } catch(e) {
      log(`Dialog "${id}" error on closing hook`);
      throw e;
    }
    await animationsComplete(d);

    this.isOpen = false;
    d.removeAttribute('closing');
    d.setAttribute('closed', '');
    
    // @ts-ignore
    this.__resolveClosed(this.context);
    
    this.dispatchEvent(new DialogStateEvent('closed', this.context));
    try {
      await this.#config[id]?.closed?.(this.context);
    } catch(e) {
      log(`Dialog "${id}" error on closed hook`);
      throw e;
    }
    log(`Closed dialog "${id}"`, this.context);

    d?.remove();
    this.context = {
      dialog: undefined,
      id: '',
      parameters: {}
    }
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
    this.context = {
      dialog: this.__dialog,
      id,
      parameters,
    }
    document.body.appendChild(this.__dialog);
    
    log(`Openening dialog "${id}"`, this.context);
    this.__dialog.setAttribute('opening', '');
    this.dispatchEvent(new DialogStateEvent('opening', this.context));

    try {
      await this.#config?.[id]?.opening?.(this.context);
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
    this.__resolveOpened(this.context);
    this.dispatchEvent(new DialogStateEvent('opened', this.context));
    try {
      await this.#config?.[id]?.opened?.(this.context);
    } catch(e) {
      log(`Dialog "${this.#id}" error on opened hook`);
      throw e;
    }
    log(`Opened dialog "${id}"`, this.context);
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
