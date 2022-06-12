# fragments

This repository is a demo repository for studying Clouding Computing.

---

## install packages

At root, run npm install

```sh
npm install
```

## .env Setting

Please create `.env` file at your root, and make sure fill out your Environment Variables by referring to [env.example](.env.example)

## Prettier and EsLint Setup

By setting [prettierrc](.prettierrc) and [eslintrc](.eslintrc.js), not only do all codes follow a consistent code style, but they also look for errors or anti-patterns. (you can modify these configurations if you have your own style)

> [Prettier](https://prettier.io/docs/en/options.html) and [Eslint](https://eslint.org/docs/user-guide/configuring/)

## Script Setup

1. `test`: run all tests using our [jest.config.js](jest.config.ts) configuration one-by-one.

   > The final `--` means that we'll pass any arguments we receive via the npm invocation to Jest, allowing us to run a single test or set of tests. More on this below.

2. `test:watch`: watch the files for changes and re-run tests when we update our code (e.g., save a file)

3. `coverage`: by using test [coverage](https://jestjs.io/docs/cli#--coverageboolean), we can see which files and lines of code are being tested, and which ones aren't

4. `lint` : finds and notifies you of errors that go against the set rules among the `src/**`.

5. `start` : runs [server.js](src/server.js) via node.

6. `dev:local` : runs [server.js](src/server.js) via nodemon with `.env.development`. [More Details](.env.example)
7. `dev:staging`: runs [server.js](src/server.js) via nodemon with `.env.staging`. [More Details](.env.example)
8. `dev:aws`: runs [server.js](src/server.js) via nodemon with `.env.production`. [More Details](.env.example)

9. `debug` : runs [server.js](src/server.js) via nodemon and starts the [node inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/) on port `9229` as well, so that you can attach a debugger.

[More Details](package.json)

> NOTE: The difference between `node` and `nodemon` is that `nodemon` automatically restarts the server whenever all files in `src/**` are updated.

> [Error]
>
> - **Situation**: When I run `debug` script in VSCode, my breakpoint does not work.
> - **How to fix** : open `command Palette` (⇧⌘P) under `View` and make sure [Toggle Auto Attach](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_auto-attach) enable. Lastly, re-open your VSCode's Integrated terminal.

## Set up Continuous Integration (CI)

### 1. Set up CI Workflow with GitHub Actions

1. **What is the GitHub Actions?**

   - Github Actions is a powerful CI/CD tool that works with Github Repository to automate software build, test, and deployment.
   - Various events in Github can be used as triggers through a simple [YAML syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions), and a workflow can also be configured by a developer simply through the YAML syntax.
     <br/>

2. **Why should I use Github Actions?**

   - For teams using Github, development convenience is greatly increased. Github Actions is strongly coupled with Github.
   - Developers can create CI/CD workflows simply by making YAML and committing them.
     <br/>

3. **How to use Github Actions?**

   1. create the following folders in the root of your repository: `.github/workflows`
   2. create a workflow YAML file for our Continuous Integration (CI) job: [`.github/workflows/**.yml`](.github/workflows/ci.yml). (_The name you give this file doesn't matter_)

> NOTE: One of the most important rules of Continuous Integration (CI) is that you never leave CI in a broken state, or put another way, the source tree must always stay green. This means that you should avoid pushing code to GitHub that will break CI, and if you do, you need to quickly push a fix so that other developers working on your team don't get blocked with code that can't pass CI. CI is where we all integrate our code changes, so it needs to be kept in working order (imagine a kitchen that's shared by a number of roommates, and one person leaving their dirty dishes everywhere, making it hard for anyone else to cook). It's a good idea to test your changes locally (i.e,. npm run lint, etc.) before you push, so you can avoid pushing a failing commit to CI.

4. **What workflows do I have?**
   1. ESlint
   2. Unit Tests

### 2. Adding Unit Tests in CI Workflow

1. **What is the Unit Test?**

   - A unit test is an automated test that ensures a piece of code (i.e., a unit of code) does what it is supposed to do.
     <br/>

2. **Setting for the Unit Test with [Jest](https://jestjs.io/)**

   1. Create an environment file in the root of the project for use tests: [`env.jest`](env.jest)
   2. Create a config file in the root of the project for Jest: [`jest.config.ts`](jest.config.ts)

      - This config file will load our env.jest test environment variables and set various options for how the tests will run:

   3. Update [`eslintrc.json`](.eslintrc.json) configuration file so that ESLint knows that we're using Jest

      - adding another `env` setting for `jest` with `true`

   4. Add some **npm scripts** to [`package.json`](package.json) to run our unit tests. We'll run our tests in various ways:

      - `test` - run all tests using our [`jest.config.json`](jest.config.ts) configuration one-by-one vs. in parallel (it's easier to test serially than in parallel). The final `--` means that we'll pass any arguments we receive via the `npm` invocation to Jest, allowing us to run a single test or set of tests. More on this below.
      - `test:watch` - same idea as `test`, but don't quit when the tests are finished. Instead, watch the files for changes and re-run tests when we update our code (e.g., save a file). This is helpful when you're editing code and want to run tests in a loop as you edit and save the code.
      - `coverage` - same idea as `test` but collect test coverage information, so that we can see which files and lines of code are being tested, and which ones aren't.

   5. Add `supertest` for testing for REST API endpoints.

      - can create **HTTP requests** to our Express routes, and write assertions about what we expect to get back (e.g., which HTTP response code and what should be in the response body).

   6. Create unit test files

      1. Create a folder in the root of the project: `tests/unit`
      2. Create a file in the folder made above.
         - with Jest, the file is named the same as the file it tests, but adds `.test`.
         - For example, [`response.test.ts`](tests/unit/response.test.ts) is a test for [`response.ts`](./src//response.ts)

   7. Using [HTTP Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) and [Apache htpasswd utility](https://httpd.apache.org/docs/2.4/programs/htpasswd.html)

      1. HTTP Basic Authentication

         - Instead of the OAuth2.0 complex authentication flow, using HTTP Basic Authentication, where a username and password are included in a request's Authorization header.

      2. Apache htpasswd - Create a test user account and put them into an [`htpasswd`](tests/.htpasswd).

         - These accounts won't ever be used in production, only during testing. (i.e., the username and password don't matter)
         - `npx htpasswd -cbB tests/.htpasswd user1@email.com password1`

> NOTE: A few notes about what to include and what not to: normally we don't put `.env` files in git, but `env.jest` file is OK to include in git because we need it for tests and it won't contain secrets. Similarly, the `tests/.htpasswd` file contains usernames and passwords; however, these are fake credentials used only during testing. As such, both files are fine to include in git. The `.env` file should NOT be included in git because it will contain AWS credentials and secrets. Also, the `coverage` folder should NOT be included in git because it's a generated folder (i.e., we don't need to store it because we can always re-create it with `npm run coverage`). Everything else in `src/` and `tests/` can get added to git. You can check it in [`.gitignore`](./.gitignore).
