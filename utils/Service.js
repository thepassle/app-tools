import { when } from './index.js';

export function createService(defaults) {
  return class Service {
    constructor(host, promise) {
      (this.host = host).addController(this);
      
      this.promise = promise;
      this.state = 'initialized';
    }
  
    setPromise(promise) {
      this.promise = promise;
    }
  
    setError(msg) {
      this.errorMessage = msg;
      this.state = 'error';
      this.host.requestUpdate();
    }
  
    request(params) {
      this.state = 'pending';
      this.host.requestUpdate();
  
      return this.promise(params)
        .then(data => {
          this.state = 'success';
          this.data = data;
          this.host.requestUpdate();
          return data;
        })
        .catch(e => {
          this.errorMessage = e?.message;
          this.state = 'error';
          this.host.requestUpdate();
          throw e;
        });
    }
    
    /**
     * Use states individually, useful if you may need to render stuff in different locations
     */
    initialized(templateFn) {
      return when(this.state === 'initialized', templateFn || defaults.initialized);
    }
  
    pending(templateFn) {
      return when(this.state === 'pending', templateFn || defaults.pending);
    }
  
    success(templateFn) {
      const template = templateFn || defaults.success;
      return when(this.state === 'success', () => template(this.data));
    }
    
    error(templateFn) {
      const template = templateFn || defaults.error;
      return when(this.state === 'error', () => template(this.errorMessage));
    }
  
    /**
     * Combined render method, if you want to just render everything in place
     */
    render(templates) {
      const states = {
        ...defaults,
        ...templates,
      }
  
      switch(this.state) {
        case 'initialized':
          return states.initialized();
        case 'pending':
          return states.pending();
        case 'success':
          return states.success(this.data);
        case 'error':
          return states.error(this.errorMessage);
      }
    }
  }  
}