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
    import: () => import('./components/foo.js'),
    title: 'Foo',
    /** Or */
    title: ({parameters}) => `foo ${parameters.bar}`,
    render: ({parameters}) => {}
  }
});

dialog.openDialog({id: 'foo'});
dialog.open; // true

dialog.close();
dialog.open; // false

dialog.addEventListener('opening', () => {});
dialog.addEventListener('opened', () => {});
dialog.addEventListener('closing', () => {});
dialog.addEventListener('closed', () => {});

dialog.modify((dialogNode) => {
  dialogNode.classList.add('foo');
});
```