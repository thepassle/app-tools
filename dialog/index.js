import { render, html } from 'https://unpkg.com/lit?module';
import { computePosition, flip, shift } from 'https://unpkg.com/@floating-ui/dom?module';

/**
 * @typedef {Object} RenderParams
 * @property {Element} dialog
 * @property {any} parameters
 * 
 * @typedef {HTMLDialogElement & { container: HTMLDivElement }} DialogNode
 * 
 * @typedef {Object} Adapter
 * @property {string} name
 * @property {((adapterParams: {dialog: DialogNode, parameters: any}) => void) | ((adapterParams: {dialog: DialogNode, parameters: any}) => Promise<void>)} [opening]
 * @property {((adapterParams: {dialog: DialogNode, parameters: any}) => void) | ((adapterParams: {dialog: DialogNode, parameters: any}) => Promise<void>)} [opened]
 * @property {((adapterParams: {dialog: DialogNode}) => void) | ((adapterParams: {dialog: DialogNode}) => Promise<void>)} [closing]
 * @property {((adapterParams: {dialog: DialogNode}) => void) | ((adapterParams: {dialog: DialogNode}) => Promise<void>)} [closed]
 * 
 * @typedef {Adapter} DialogConfiguration
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
  isOpen = false;
  opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
  closed = new Promise((resolve) => {this.__resolveClosed = resolve;});
  adapters = new Map();

  __cleanupDialogNode() {
    this.__dialog?.remove();
    this.__dialog = undefined;
  }

  __initDialogNode() {
    const dialogNode = /** @type {DialogNode} */ (document.createElement('dialog'));
    dialogNode.addEventListener('close', this.__onDialogClose);
    dialogNode.addEventListener('mousedown', this.__onLightDismiss);
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
    const adapter = this.adapters.get(this.__activeAdapter);
    this.__dialog.setAttribute('open', '');
    this.__dialog.removeAttribute('opened');
    this.__dialog.setAttribute('closing', '');
    this.dispatchEvent(new DialogStateEvent('closing'));
    await adapter?.closing?.({dialog: this.__dialog});
    
    await onePaint();
    this.isOpen = false;
    this.__dialog.removeAttribute('closing');
    this.__dialog.setAttribute('closed', '');
    await onePaint();

    this.__cleanupDialogNode();
    // @ts-ignore
    this.__resolveClosed();

    this.dispatchEvent(new DialogStateEvent('closed'));
    await adapter?.closed?.({dialog: this.__dialog});

    this.opened = new Promise((resolve) => {this.__resolveOpened = resolve;});
    this.__activeAdapter = undefined;
  }
  
  async open(adapterName, options) {
    const adapter = this.adapters.get(adapterName);
    if(!adapter) throw new Error(`Could not find adapter ${adapterName}`);
    this.__activeAdapter = adapterName;

    if(this.isOpen) {
      this.__dialog?.close();
      await this.closed;
    }

    this.__dialog = this.__initDialogNode();

    const container = document.createElement('div');
    this.__dialog.container = container;
    this.__dialog.appendChild(container);

    this.__dialog.setAttribute('opening', '');
    this.dispatchEvent(new DialogStateEvent('opening'));
    await adapter.opening?.({dialog: this.__dialog, options});

    document.body.appendChild(this.__dialog);
    this.__dialog.showModal();
    
    await onePaint();

    this.isOpen = true;
    // @ts-ignore
    this.__dialog.removeAttribute('opening');
    this.__dialog.setAttribute('opened', '');
    this.__resolveOpened(this.__dialog);
    this.dispatchEvent(new DialogStateEvent('opened'));
    await adapter.opened?.({dialog: this.__dialog, options});

    this.closed = new Promise((resolve) => {this.__resolveClosed = resolve;});
  }

  addAdapter(adapter) {
    this.adapters.set(adapter.name, adapter);
  }

  /**
   * Can be used to modify the dialog
   * 
   * @param {(dialogNode: DialogNode | undefined) => void} cb
   * 
   * @example
   * dialog.modify(node => {node.classList.add('foo')});
   */
  modify(cb) {
    cb(this.__dialog);
  }
}

let dialog = new Dialog();

const contextMenu = {
  name: 'contextMenu',
  opening: ({dialog}) => {
    Object.assign(dialog.style, {
      position: 'absolute', 
      top: '0px', 
      margin: 0,
      transition: 'top 1s',
    });
  },
  opened: async ({dialog, options}) => {
    render(options.render?.() ?? '', dialog.container);

    const { x, y } = await computePosition(options.target, dialog, {
      placement: 'bottom-end',
      middleware: [flip(), shift({ padding: 5 })],
    });
    Object.assign(dialog.style, {position: 'absolute', left: `${x}px`, top: `${y}px`, margin: 0});
  },
  closing: async ({dialog}) => {
    console.log(dialog);
    // debugger;
    Object.assign(dialog.style, {
      position: 'absolute', 
      top: '2000px', 
      margin: 0,
      transition: 'top 2s'
    });
    dialog.style.top = '2000px';
    dialog.setAttribute('foo', '');
    // debugger;
    // await onePaint();
    // await onePaint();
    // await onePaint();
    // debugger;
    if(!dialog.hasAttribute('open')) dialog.setAttribute('open', '');
    // debugger;
    // await onePaint();
    // if(!dialog.hasAttribute('open')) dialog.setAttribute('open', '');
    // The native behavior already removes the `open` attr at this point, so you cant have a closing animation
    // await onePaint();
    // if(!dialog.hasAttribute('open')) dialog.setAttribute('open', '');
    // debugger;
    // await onePaint();
    // await onePaint();
    // await onePaint();
    // await onePaint();
    // await onePaint();
    // await new Promise(r => setTimeout(r));
    // debugger;
    console.log(dialog);
    // debugger;
  },
  closed: async ({dialog}) => {
    await onePaint();
    await onePaint();
    await onePaint();
    await onePaint();
    await onePaint();
    await onePaint();
    await onePaint();
    await onePaint();
    console.log(5, dialog);
    Object.assign(dialog.style, {top: '-100px'});
  }
}

dialog.addAdapter(contextMenu);
dialog.addAdapter(modal({
  foo: {
    import: () => Promise.resolve().then(() => {console.log('imported foo')}),
    render: ({opts, title}) => html`<button @click=${dialog.close}>x</button><h1>${title}</h1><button>hi</button>`,
    title: ({opts}) => 'foo',
  },
  bar: {
    import: () => Promise.resolve().then(() => {console.log('imported bar')}),
    render: ({opts, title}) => html`<button @click=${dialog.close}>x</button><h1>${title}</h1><button>hi</button>`,
    title: 'bar',
  },
}));

function modal(dialogs) {
  return {
    name: 'modal',
    opening: async ({dialog, options}) => {
      const d = dialogs[options.id];
      if(!d) throw new Error(`Couldn't find dialog configuration for id: ${options.id}`);

      const title = typeof d.title === 'function' ? d.title({options}) : d.title;
      await d.import?.();
      render(d.render({title, options}), dialog.container);
    }
  }
}

// 🚨 @TODO TAKE A LOOK AT THIS
// https://codepen.io/Westbrook/pen/gOejYVB
// https://codepen.io/equinusocio/pen/rNvZQeY


export {dialog};


// dialog.open('modal', {
//   id: 'foo',
//   parameters: {}
// });



// function contextMenu() {
//   return {
//     opening: ({dialog}) => {

//     }
//   }
// }

// dialog.open(contextMenu({
//   foo: 'bar'
// }));

// import { render } from 'lit';

// function createModal(dialogs) {
//   return function modal(id, {parameters}) {
//     const d = dialogs[id];
//     if(!d) throw new Error(`Couldn't find dialog configuration for id: ${id}`);

//     return {
//       opening: async ({dialog}) => {
//         const title = typeof d.title === 'function' ? d.title({parameters}) : d.title;
//         await d.import?.();
//         render(d.render({title, parameters}), dialog.container);
//       }
//     }
//   }
// }

// const modal = createModal({
//   foo: {
//     import: () => import('./foo-bar.js'),
//     render: ({parameters, title}) => html`<foo-bar title=${title}></foo-bar>`,
//     title: ({parameters}) => 'foo',
//   }
// });

// dialog.open(modal('foo', {}));


// import { render } from 'lit';
// import { compusePosition, flip, shift } from '@floating-ui/dom';

// function contextMenu({target, template}) {
//   return {
//     opening: async ({dialog}) => {
//       render(template(), dialog.container);

//       const { x, y } = await compusePosition(target, dialog, {
//         placement: 'bottom-end',
//         middleware: [flip(), shift({ padding: 5 })],
//       });
//       Object.assign(dialog.style, {left: `${x}px`, top: `${y}px`});
//     }
//   }
// }

// dialog.open(contextMenu({
//   target: e.target,
//   template: () => html`<foo-bar></foo-bar>`
// }))

// // html`<button @click=${e => dialog.open(contextMenu({target: e}))}>Open context menu</button>`


// const contextMenu = new Dialog({
//   opening: () => {}
// });
// contextMenu.open(() => html``);

// const modal = new class Modal extends Dialog {
//   open(id, {parameters}) {
//     super.open();
//   }
// };