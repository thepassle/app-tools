// test/state.test.js
import { expect } from '@open-wc/testing';
import { State, StateEvent } from './index.js';

describe('State', () => {
  describe('StateEvent', () => {
    it('should create a state-changed event with state data', () => {
      const testState = { count: 5 };
      const event = new StateEvent(testState);
      
      expect(event.type).to.equal('state-changed');
      expect(event.state).to.deep.equal(testState);
    });
  });

  describe('State', () => {
    describe('constructor', () => {
      it('should initialize with given state', () => {
        const initialState = { count: 0 };
        const state = new State(initialState);
        
        expect(state.getState()).to.deep.equal(initialState);
      });
    });

    describe('getState', () => {
      it('should return current state', () => {
        const initialState = { value: 'test' };
        const state = new State(initialState);
        
        expect(state.getState()).to.deep.equal(initialState);
      });
    });

    describe('setState', () => {
      it('should update state with object', () => {
        const state = new State({ count: 0 });
        const newState = { count: 5 };
        
        state.setState(newState);
        
        expect(state.getState()).to.deep.equal(newState);
      });

      it('should update state with function', () => {
        const state = new State({ count: 0 });
        
        state.setState(prev => ({ count: prev.count + 1 }));
        
        expect(state.getState()).to.deep.equal({ count: 1 });
      });

      it('should dispatch state-changed event by default', (done) => {
        const state = new State({ count: 0 });
        const newState = { count: 5 };
        
        state.addEventListener('state-changed', (event) => {
          expect(event).to.be.instanceOf(StateEvent);
          expect(event.state).to.deep.equal(newState);
          done();
        });
        
        state.setState(newState);
      });

      it('should not dispatch event when broadcast is false', () => {
        const state = new State({ count: 0 });
        let eventFired = false;
        
        state.addEventListener('state-changed', () => {
          eventFired = true;
        });
        
        state.setState({ count: 5 }, false);
        
        expect(eventFired).to.be.false;
      });
    });

    describe('plugins', () => {
      describe('update plugins', () => {
        it('should apply update plugins in order', () => {
          const plugin1 = {
            name: 'add-one',
            update: (prev, next) => ({ ...next, count: next.count + 1 })
          };
          
          const plugin2 = {
            name: 'multiply-two',
            update: (prev, next) => ({ ...next, count: next.count * 2 })
          };
          
          const state = new State({ count: 0 }, [plugin1, plugin2]);
          
          state.setState({ count: 5 });
          
          // Should be: 5 -> 6 (plugin1) -> 12 (plugin2)
          expect(state.getState().count).to.equal(12);
        });

        it('should handle plugin errors gracefully', () => {
          const errorPlugin = {
            name: 'error-plugin',
            update: () => { throw new Error('Plugin error'); }
          };
          
          const goodPlugin = {
            name: 'good-plugin',
            update: (prev, next) => ({ ...next, processed: true })
          };
          
          const state = new State({ count: 0 }, [errorPlugin, goodPlugin]);
          
          // Should not throw and should apply good plugin
          state.setState({ count: 5 });
          
          expect(state.getState()).to.deep.equal({ count: 5, processed: true });
        });

        it('should pass correct prev and next states to plugins', () => {
          let capturedPrev, capturedNext;
          
          const plugin = {
            name: 'capture-plugin',
            update: (prev, next) => {
              capturedPrev = prev;
              capturedNext = next;
              return next;
            }
          };
          
          const state = new State({ count: 0 }, [plugin]);
          state.setState({ count: 5 });
          
          expect(capturedPrev).to.deep.equal({ count: 0 });
          expect(capturedNext).to.deep.equal({ count: 5 });
        });
      });

      describe('effect plugins', () => {
        it('should run effect plugins after state update', async () => {
          let effectRan = false;
          let effectState;
          
          const plugin = {
            name: 'effect-plugin',
            effect: (prev, next) => {
              effectRan = true;
              effectState = next;
            }
          };
          
          const state = new State({ count: 0 }, [plugin]);
          state.setState({ count: 5 });
          
          await new Promise(resolve => setTimeout(resolve, 0));
          
          expect(effectRan).to.be.true;
          expect(effectState).to.deep.equal({ count: 5 });
        });

        it('should handle async effect plugins', async () => {
          let effectRan = false;
          
          const plugin = {
            name: 'async-effect-plugin',
            effect: async (prev, next) => {
              await new Promise(resolve => setTimeout(resolve, 10));
              effectRan = true;
            }
          };
          
          const state = new State({ count: 0 }, [plugin]);
          state.setState({ count: 5 });
          
          await new Promise(resolve => setTimeout(resolve, 20));
          
          expect(effectRan).to.be.true;
        });

        it('should handle effect plugin errors gracefully', async () => {
          const errorPlugin = {
            name: 'error-effect-plugin',
            effect: () => { throw new Error('Effect error'); }
          };
          
          const state = new State({ count: 0 }, [errorPlugin]);
          
          expect(() => state.setState({ count: 5 })).to.not.throw();
          
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        it('should run effects even when update plugins are present', async () => {
          let effectRan = false;
          
          const updatePlugin = {
            name: 'update-plugin',
            update: (prev, next) => ({ ...next, updated: true })
          };
          
          const effectPlugin = {
            name: 'effect-plugin',
            effect: (prev, next) => {
              effectRan = true;
            }
          };
          
          const state = new State({ count: 0 }, [updatePlugin, effectPlugin]);
          state.setState({ count: 5 });
          
          await new Promise(resolve => setTimeout(resolve, 0));
          
          expect(state.getState()).to.deep.equal({ count: 5, updated: true });
          expect(effectRan).to.be.true;
        });
      });

      describe('combined plugins', () => {
        it('should work with plugins that have both update and effect', async () => {
          let effectCalled = false;
          let effectReceivedState;
          
          const plugin = {
            name: 'combined-plugin',
            update: (prev, next) => ({ ...next, fromUpdate: true }),
            effect: (prev, next) => {
              effectCalled = true;
              effectReceivedState = next;
            }
          };
          
          const state = new State({ count: 0 }, [plugin]);
          state.setState({ count: 5 });
          
          await new Promise(resolve => setTimeout(resolve, 0));
          
          expect(state.getState()).to.deep.equal({ count: 5, fromUpdate: true });
          expect(effectCalled).to.be.true;
          expect(effectReceivedState).to.deep.equal({ count: 5, fromUpdate: true });
        });
      });
    });

    describe('complex scenarios', () => {
      it('should handle multiple state updates correctly', () => {
        const state = new State({ count: 0 });
        
        state.setState({ count: 1 });
        state.setState({ count: 2 });
        state.setState(prev => ({ count: prev.count + 3 }));
        
        expect(state.getState().count).to.equal(5);
      });

      it('should maintain state immutability', () => {
        const initialState = { nested: { value: 1 } };
        const state = new State(initialState);
        
        const retrievedState = state.getState();
        retrievedState.nested.value = 999;
        
        expect(state.getState().nested.value).to.equal(1);
      });

      it('should work with complex state objects', () => {
        const complexState = {
          user: { id: 1, name: 'John' },
          items: [1, 2, 3],
          settings: { theme: 'dark' }
        };
        
        const state = new State(complexState);
        
        state.setState(prev => ({
          ...prev,
          user: { ...prev.user, name: 'Jane' }
        }));
        
        expect(state.getState().user.name).to.equal('Jane');
        expect(state.getState().items).to.deep.equal([1, 2, 3]);
      });
    });
  });
});