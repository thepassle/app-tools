# Env

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

```js
import { DEV, PROD } from '@thepassle/app-tools/env.js'; 

if (DEV) {
  console.log('Running in dev mode');
}

if (PROD) {
  console.log('Running in prod mode');
}
```

When resolving imports, Node will look for keys in the package export to figure out which file to use. For example "default", "import", or "require".

Tools however can use custom keys here as well, like "types", "browser", "development", or "production". Depending on what kind of import it is, and which environment (dev/prod) tools (like bundlers or dev servers) can resolve/distinguish between which file should actually be used.

## Acknowledgement

This was inspired by [`esm-env`](https://github.com/benmccann/esm-env) by Ben McCann. I've added to my own repo because I like to have useful utils like these centralized in one place for my personal projects, especially when they're as small and elegant as this. 