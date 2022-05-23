# fragments

This repository is a demo repository for studying Clouding Computing.

---

## install packages

At root, run npm install

```sh
npm install
```

## Prettier and EsLint Setup

By setting [prettierrc](.prettierrc) and [eslintrc](.eslintrc.js), not only do all codes follow a consistent code style, but they also look for errors or anti-patterns. (you can modify these configurations if you have your own style)

> [Prettier](https://prettier.io/docs/en/options.html) and [Eslint](https://eslint.org/docs/user-guide/configuring/)

## Script Setup

1. `lint` : finds and notifies you of errors that go against the set rules among the `src/**`.

2. `start` : runs [server.js](src/server.js) via node.

3. `dev` : runs [server.js](src/server.js) via nodemon.

4. `debug` : runs [server.js](src/server.js) via nodemon and starts the [node inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/) on port `9229` as well, so that you can attach a debugger.

> NOTE: The difference between `node` and `nodemon` is that `nodemon` automatically restarts the server whenever all files in `src/**` are updated.

> [Error]
>
> - **Situation**: When I run `debug` script in VSCode, my breakpoint does not work.
> - **How to fix** : open `command Palette` (⇧⌘P) under `View` and make sure [Toggle Auto Attach](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_auto-attach) enable. Lastly, re-open your VSCode's Integrated terminal.

## .env Setting

Please create `.env` file at your root, and make sure fill out your Environment Variables by referring to [env.example](.env.example)
