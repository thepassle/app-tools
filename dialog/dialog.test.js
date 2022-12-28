import { expect, oneEvent } from '@open-wc/testing';
import { stub } from 'sinon';
import { Dialog } from './index.js';

describe('Dialog', () => {
  let dialog;

  beforeEach(() => {
    dialog = new Dialog({
      foo: { opening: ({dialog}) => dialog.form.innerHTML = 'hello world' }
    });
  });

  afterEach(async () => {
    if(dialog.open) await dialog.close();
  });

  it('opens', async () => {
    await dialog.open({id: 'foo'});
    await dialog.opened;
    expect(dialog.isOpen).to.be.true;
  });

  it('closes', async () => {
    await dialog.open({id: 'foo'});
    await dialog.opened;
    await dialog.close();
    await dialog.closed;
    expect(dialog.isOpen).to.be.false;
  });

  it('modify', async () => {
    await dialog.open({id: 'foo'});

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

    await dialog.open({id: 'foo'});
    await dialog.opened;
    
    expect(cbs.opening.called).to.be.true;
    expect(cbs.opened.called).to.be.true;
    expect(cbs.closing.called).to.be.false;
    expect(cbs.closed.called).to.be.false;

    dialog.close()
    await dialog.closed;

    expect(cbs.opening.called).to.be.true;
    expect(cbs.opened.called).to.be.true;
    expect(cbs.closing.called).to.be.true;
    expect(cbs.closed.called).to.be.true;
  });
});