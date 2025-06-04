# State

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

```js
import { State } from '@thepassle/app-tools/state.js'; 

const state = new State();

/** Or pass a default state */
const state = new State({foo: 'foo'});

state.setState({foo: 'bar'}); // state === {foo: 'bar'}
state.setState((old) => ({...old, bar: 'bar'})); // state === {foo: 'bar', bar: 'bar'}

state.addEventListener('state-changed', ({state}) => {});

state.getState(); // {foo: 'bar', bar: 'bar'};
```

## Plugins

You can extend the State functionality by providing plugins. Plugins can modify state updates and perform side effects. Each plugin is an object with a `name` and optional `update` and `effect` functions:

- `update(prevState, newState)`: (optional) Called during state updates. Should return a new state.
- `effect(prevState, newState)`: (optional) Called after state changes. Can be sync or async, does not return a new state.

```js
const loggerPlugin = {
  name: 'logger',
  update(prev, next) {
    console.log('State changing from', prev, 'to', next);
    return next;
  },
  async effect(prev, next) {
    await fetch('/log', { method: 'POST', body: JSON.stringify({ prev, next }) });
  }
};

const state = new State({}, [loggerPlugin]);

state.setState({foo: 'bar'});
```

- Plugins are run in the order provided.
- `update` functions are synchronous only and are called in order; changes to the state in previous plugins will affect following plugins
- `effect`s can be asynchronous and are called with `Promise.all`