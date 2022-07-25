# State

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

```js
import { State } from '@thepassle/app-tools/state.js'; 

const state = new State({});

state.setState({foo: 'bar'}); // state === {foo: 'bar'}
state.setState((old) => ({...old, bar: 'bar'})); // state === {foo: 'bar', bar: 'bar'}

state.addEventListener('state-changed', ({state}) => {});

state.getState(); // {foo: 'bar', bar: 'bar'};
```