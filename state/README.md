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