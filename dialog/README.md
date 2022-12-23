# Pwa

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

```js
import { Dialog } from '@thepassle/app-tools/dialog.js'; 

const dialog = new Dialog({
  foo: { 
    opening: ({dialog, parameters}) => {dialog.container.innerHTML = 'hello world'},
    opened: ({dialog, parameters}) => {},
    closing: ({dialog}) => {},
    closed: ({dialog}) => {}
  },
  bar: someAbstraction({title: 'foo', import: () => import('./my-component.js')}),
});

dialog.open({id: 'foo'});
await dialog.opened;
dialog.open; // true
/** Or */
dialog.opened.then((dialogNode) => {});

dialog.close();
await dialog.closed;
dialog.open; // false
/** Or */
dialog.closed.then(() => {});

dialog.addEventListener('opening', () => {});
dialog.addEventListener('opened', () => {});
dialog.addEventListener('closing', () => {});
dialog.addEventListener('closed', () => {});

dialog.modify((dialogNode) => {
  dialogNode.classList.add('foo');
});

/** You can also pass parameters to the dialog renderer */
dialog.open({
  id: 'foo', 
  parameters: {
    foo: 'bar'
  }
});
```