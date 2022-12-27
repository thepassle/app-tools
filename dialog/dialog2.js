class DialogStateEvent extends Event {
  /** @param {'opening' | 'opened' | 'closing' | 'closed'} kind */
  constructor(kind) {
    super(kind);
  }
}

const animationsComplete = element => Promise.allSettled(element.getAnimations().map(animation => animation.finished));

export class Dialog extends EventTarget {
  #config = {};
  isOpen = false;
  opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
  closed = new Promise((resolve) => {this.__resolveClosed = resolve;});

  constructor(config) {
    super();
    this.#config = config;
  }

  __initDialogNode() {
    const dialogNode = document.createElement('dialog');
    dialogNode.style.padding = '0';
    dialogNode.addEventListener('close', this.__onDialogClose);
    dialogNode.addEventListener('mousedown', this.__onLightDismiss);

    const container = document.createElement('div');
    container.style.width = 'calc(100% - 10px);';
    // container.style.height = 'calc(100% - 10px);';
    // container.style.padding = '5px;';

    dialogNode.appendChild(container);

    return dialogNode;
  }

  __onLightDismiss = ({target}) => {
    if(target.nodeName === 'DIALOG') {
      this.close();
    }
  }

  close = () => {
    this.__dialog?.close();
  }

  __onDialogClose = async () => {

  }

  async open({id, parameters}) {
    if(!(id in this.#config)) {
      throw new Error(`No dialog configured for id: ${id}`);
    }

    if(this.isOpen) {
      this.__dialog?.close();
      await this.closed;
    }

    this.__dialog = this.__initDialogNode();



    this.__dialog.setAttribute('opening', '');
    this.dispatchEvent(new DialogStateEvent('opening'));
    await this.#config?.[id]?.opening?.({dialog: this.__dialog, parameters});

    document.body.appendChild(this.__dialog);
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

dialog.open({id: 'foo', parameters: {foo: 'bar'}});