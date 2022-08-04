import { expect, oneEvent } from '@open-wc/testing';
import { stub } from 'sinon';
import { Dialog } from './index.js';

describe('Dialog', () => {
  let dialog;

  beforeEach(() => {
    dialog = new Dialog({
      foo: { opening: ({dialog}) => dialog.container.innerHTML = 'hello world' }
    });
  });

  afterEach(() => {
    if(dialog.open) dialog.close();
  });

  it('opens', async () => {
    dialog.openDialog({id: 'foo'});
    await dialog.opened;
    expect(dialog.open).to.be.true;
  });

  it('closes', async () => {
    dialog.openDialog({id: 'foo'});
    await dialog.opened;
    dialog.close();
    await dialog.closed;
    expect(dialog.open).to.be.false;
  });

  it('modify', async () => {
    dialog.openDialog({id: 'foo'});

    const d = await dialog.opened;
    dialog.modify(node => {node.classList.add('foo')});

    expect(d.classList.contains('foo')).to.be.true;
  });

  it('runs callbacks', async () => {
    const cbs = {
      opening: stub(),
      opened: stub(),
      closing: stub(),
      closed: stub(),
    };
    const dialog = new Dialog({foo: cbs});

    dialog.openDialog({id: 'foo'});
    
    expect(cbs.opening.called).to.be.true;
    expect(cbs.opened.called).to.be.false;
    expect(cbs.closing.called).to.be.false;
    expect(cbs.closed.called).to.be.false;

    await dialog.opened;

    expect(cbs.opening.called).to.be.true;
    expect(cbs.opened.called).to.be.true;
    expect(cbs.closing.called).to.be.false;
    expect(cbs.closed.called).to.be.false;
    
    setTimeout(() => dialog.close());
    await oneEvent(dialog.__dialog, 'close');

    expect(cbs.opening.called).to.be.true;
    expect(cbs.opened.called).to.be.true;
    expect(cbs.closing.called).to.be.true;
    expect(cbs.closed.called).to.be.false;
    
    await dialog.closed;

    expect(cbs.opening.called).to.be.true;
    expect(cbs.opened.called).to.be.true;
    expect(cbs.closing.called).to.be.true;
    expect(cbs.closed.called).to.be.true;
  });
});