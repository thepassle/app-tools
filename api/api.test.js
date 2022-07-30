import { expect } from '@open-wc/testing';
import { stub } from 'sinon';
import { Api } from './index.js';
import { jsonPrefix } from './plugins/jsonPrefix.js';
import { mock } from './plugins/mock.js';
import { xsrf } from './plugins/xsrf.js';
import { cache, cachePlugin } from './plugins/cache.js';
import { abort } from './plugins/abort.js';

const response = () => new Response(JSON.stringify({bar: 'bar'}), {status: 222, statusText: 'foo'});
const sleep = ms => new Promise(r => setTimeout(r, ms));

describe('Api', () => {
  let api;
  let fetchStub;

  beforeEach(() => {
    api = new Api();
    fetchStub = stub(globalThis, 'fetch');
    fetchStub.onCall(0).resolves(new Response(JSON.stringify({foo: 'bar'}), {status: 200}));
    fetchStub.onCall(1).resolves(new Response(JSON.stringify({foo: 'bar'}), {status: 200}));
    fetchStub.onCall(2).resolves(new Response(JSON.stringify({foo: 'bar'}), {status: 200}));
  });

  afterEach(() => {
    fetchStub.restore();
  });

  describe('config', () => {
    it('Sets correctly defaults', () => {
      expect(api.config).to.deep.equal({
        plugins: [],
        responseType: 'json'
      });
    });

    it('Overrides default config correctly', () => {
      api = new Api({
        responseType: 'text'
      });
  
      expect(api.config).to.deep.equal({
        plugins: [],
        responseType: 'text'
      });
    });

    it('addPlugin', () => {
      api.addPlugin({});
      expect(api.config.plugins.length).to.equal(1);
      api.addPlugin({});
      expect(api.config.plugins.length).to.equal(2);
    });
  });

  describe('plugins', () => {
    let beforeStub = stub();
    let afterStub = stub();

    it('defaults', async () => {
      await api.get('/foo', {
        plugins: [{
          beforeFetch: beforeStub,
          afterFetch: afterStub,
        }]
      });
      expect(beforeStub.called).to.equal(true);
      expect(beforeStub.getCall(0).firstArg).to.deep.equal({
        data: undefined,
        method: 'GET',
        fetchFn: window.fetch,
        headers: new Headers(),
        opts: {
          plugins: [{
            afterFetch: afterStub,
            beforeFetch: beforeStub
          }]
        },
        baseURL: '',
        responseType: 'json',
        url: '/foo'
      })

      expect(afterStub.called).to.equal(true);
      const afterArgs = afterStub.getCall(0).firstArg;
      expect(afterArgs.status).to.equal(200);
      expect(afterArgs.ok).to.equal(true);
      expect(afterArgs.statusText).to.equal('');
    });

    it('overrides MetaParams', async () => {
      await api.get('/foo', {
        plugins: [{
          beforeFetch: (meta) => ({...meta, url: '/bar'})
        }]
      })
      const url = fetchStub.getCall(0).args[0];
      expect(url).to.equal('/bar');
    });
  });

  describe('functionality', () => {
    it('defaults', async () => {
      await api.get('/foo', { method: 'GET' });

      const opts = fetchStub.getCall(0).args[1];

      expect(fetchStub.called).to.equal(true);
      expect(opts).to.deep.equal({
        method: 'GET',
        headers: new Headers()
      });
    });

    it('throws', async () => {
      try {
        await api.get('/foo', { plugins: [mock(() => new Response('', {status: 400, statusText: 'foo'}))] });
      } catch (e) {
        expect(e.message).to.equal('foo');
      }
    });

    it('get', async () => {
      const r = await api.get('/foo');
      expect(r.foo).to.equal('bar');
    });

    it('post', async () => {
      const r = await api.post('/foo', {foo:'foo'});

      const opts = fetchStub.getCall(0).args[1];

      expect(opts).to.deep.equal({
        method: 'POST',
        headers: new Headers(),
        body: JSON.stringify({foo: 'foo'})
      });
      expect(r.foo).to.equal('bar');
    });

    it('native fetch overrides', async () => {
      await api.get('/foo', {
        mode: 'foo', 
        credentials: 'foo', 
        cache: 'foo', 
        redirect: 'foo', 
        referrer: 'foo', 
        integrity: 'foo', 
        keepalive: 'foo', 
        signal: 'foo', 
        referrerPolicy: 'foo', 
        headers: new Headers(), 
        method: 'foo'
      });

      const opts = fetchStub.getCall(0).args[1];

      expect(opts).to.deep.equal({
        method: 'GET',
        headers: new Headers(),
        mode: 'foo', 
        credentials: 'foo', 
        cache: 'foo', 
        redirect: 'foo', 
        referrer: 'foo', 
        integrity: 'foo', 
        keepalive: 'foo', 
        signal: 'foo', 
        referrerPolicy: 'foo',
      });
    });

    it('params', async () => {
      await api.get('/foo', { params: {foo: 'bar', bar: 'baz'} });
      const url = fetchStub.getCall(0).args[0];
      expect(url).to.equal('/foo?foo=bar&bar=baz');
    });

    it('appends params correctly', async () => {
      await api.get('/foo?foo=bar', { params: {bar: 'baz'} });
      const url = fetchStub.getCall(0).args[0];
      expect(url).to.equal('/foo?foo=bar&bar=baz');
    });

    it('baseURL', async () => {
      await api.get('/foo', { baseURL: 'https://api.foo.com' });
      const url = fetchStub.getCall(0).args[0];
      expect(url).to.equal('https://api.foo.com/foo');
    });
  });

  // @TODO test for abort plugin
  describe('plugins', () => {
    describe('transform', () => {
      it('transforms data', async () => {
        const result = await api.get('/foo', {plugins: [{transform: (data) => {
          data.foo = 'bar';
          return data;
        }}]})
        expect(result.foo).to.equal('bar');
      })
    });

    describe('jsonPrefix', () => {
      it('JSON Prefix', async () => {
        api = new Api({ plugins: [ jsonPrefix ]});
  
        const result = await api.get('/foo', {
          plugins: [
            mock(response()),
            {
              afterFetch: (res) => {
                expect(res.status).to.equal(222);
                expect(res.statusText).to.equal('foo');
                return res;
              }
            }
          ]
        });
        expect(result.bar).to.equal('bar');
      });
  
      it('JSON Prefix, response without prefix', async () => {
        api = new Api({ plugins: [jsonPrefix] });
  
        const result = await api.get('/foo', {
          plugins: [
            mock(response()),
            {
              afterFetch: (res) => {
                expect(res.status).to.equal(222);
                expect(res.statusText).to.equal('foo');
                return res;
              }
            }
          ]
        });
        expect(result.bar).to.equal('bar');
      });
    });

    describe('mock', () => {
      it('mocks requests', async () => {
        const result = await api.get('/foo', {
          plugins: [
            mock(response())
          ]
        });
        expect(result.bar).to.equal('bar');
      });

      it('mocks requests', async () => {
        const result = await api.get('/foo', {
          plugins: [
            mock(response())
          ]
        });
        expect(result.bar).to.equal('bar');
      });
    });

    describe('cache', () => {
      it('useCache', async () => {
        await api.get('/foo', {plugins: [cache]});
        await api.get('/foo', {plugins: [cache]});
  
        expect(fetchStub.callCount).to.equal(1);
      });
  
      it('cacheOptions', async () => {
        const c = cachePlugin({maxAge: 5});
        await api.get('/foo', {plugins: [c] });
        await api.get('/foo', {plugins: [c] });
        expect(fetchStub.callCount).to.equal(1);
        await sleep(10);
        await api.get('/foo', {plugins: [c] });
        expect(fetchStub.callCount).to.equal(2);
      }); 
    });

    describe('abort', () => {
      it('abort', async () => {
        const originalAbort = window.AbortController;
        const abortStub = stub();
        window.AbortController = class {
          signal;
          abort = abortStub;
        }

        api.get('/foo', {plugins: [abort]});
        await api.get('/foo', {plugins: [abort]});
  
        expect(abortStub.callCount).to.equal(1);
        window.AbortController = originalAbort;
      });

      it('abort error handling', async () => {
        api.get('/foo', {plugins: [abort]});
        await api.get('/foo', {plugins: [abort]});
      });
    });

    describe('xsrf', () => {
      it('xsrf', async () => {
        document.cookie = 'XSRF-TOKEN=foo';
        await api.get('/foo', {plugins: [
          xsrf,
          {
            beforeFetch: (meta) => {
              expect(meta.headers.get('X-CSRF-TOKEN')).to.equal('foo');
            }
          }
        ]});
      });
    })
  });
});