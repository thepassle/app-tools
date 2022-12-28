class DialogStateEvent extends Event {
  /** @param {'opening' | 'opened' | 'closing' | 'closed'} kind */
  constructor(kind) {
    super(kind);
  }
}

const animationsComplete = element => Promise.allSettled(element.getAnimations().map(animation => animation.finished));

export class Dialog extends EventTarget {
  #id = '';
  #config = {};
  isOpen = false;
  opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
  closed = new Promise((resolve) => {this.__resolveClosed = resolve;});

  constructor(config) {
    super();
    this.#config = config;
    this.__dialog = this.__initDialogNode();
    document.body.appendChild(this.__dialog);
  }

  __initDialogNode() {
    const dialogNode = document.createElement('dialog');
    dialogNode.style.padding = '0';
    dialogNode.style.width = '200px';
    dialogNode.style.height = '200px';
    dialogNode.addEventListener('close', this.__onDialogClose);
    dialogNode.addEventListener('mousedown', this.__onLightDismiss);

    const form = document.createElement('form');
    form.setAttribute('method', 'dialog');

    form.style.setProperty('width', 'calc(100% - 10px)');
    form.style.setProperty('height', 'calc(100% - 10px)');
    form.style.setProperty('margin', '0');
    form.style.setProperty('padding', '5px');

    dialogNode.appendChild(form);

    return dialogNode;
  }

  __onLightDismiss = ({target}) => {
    if(target.nodeName === 'DIALOG') {
      this.close();
    }
  }

  close = async () => {
    this.__dialog?.close();
  }

  __onDialogClose = async () => {
    this.__dialog.removeAttribute('opened');
    this.__dialog.setAttribute('inert', '');
    this.__dialog.setAttribute('closing', '');
    this.dispatchEvent(new DialogStateEvent('closing'));
    await this.#config[this.#id]?.closing?.({dialog: this.__dialog});
    await animationsComplete(this.__dialog);
    
    this.isOpen = false;
    this.__dialog.removeAttribute('closing');
    this.__dialog.setAttribute('closed', '');
    
    // @ts-ignore
    this.__resolveClosed();
    
    this.dispatchEvent(new DialogStateEvent('closed'));
    await this.#config[this.#id]?.closed?.({dialog: this.__dialog});

    this.opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
    this.#id = '';
  }

  async open({id, parameters}) {
    if(!(id in this.#config)) {
      throw new Error(`No dialog configured for id: ${id}`);
    }
    this.#id = id;

    if(this.isOpen) {
      this.__dialog?.close('dismiss');
      await this.closed;
    }
    
    this.__dialog.removeAttribute('inert');
    this.__dialog.setAttribute('opening', '');
    this.dispatchEvent(new DialogStateEvent('opening'));
    await this.#config?.[id]?.opening?.({dialog: this.__dialog, parameters});

    this.__dialog.showModal();
    
    await animationsComplete(this.__dialog);

    this.isOpen = true;
    this.__dialog.removeAttribute('opening');
    this.__dialog.setAttribute('opened', '');
    this.__resolveOpened(this.__dialog);
    this.dispatchEvent(new DialogStateEvent('opened'));
    await this.#config?.[id]?.opened?.({dialog: this.__dialog, parameters});

    this.closed = new Promise((resolve) => {this.__resolveClosed = resolve;});
  }
}

export const dialog = new Dialog({
  foo: {
    opening: ({dialog, parameters}) => {
      console.log('opening', { dialog, parameters});
    },
    opened: ({dialog, parameters}) => {
      console.log('opened', { dialog, parameters});
    }
  }
});

// dialog.open({id: 'foo', parameters: {foo: 'bar'}});