# Installation

```bash
npm install --save-dev @vue/test-utils

# or
yarn add --dev @vue/test-utils
```

## Usage

Vue Test Utils is framework agnostic - you can use it with whichever test runner you like. The easiest way to try it out is using [Jest](https://jestjs.io/), a popular test runner.

To load `.vue` files with Jest, you will need `vue-jest`. `vue-jest` v5 is the one that supports Vue 3. It is still in alpha, much like the rest of the Vue.js 3 ecosystem, so if you find a bug please report it [here](https://github.com/vuejs/vue-jest/) and specify you are using `vue-jest` v5.

You can install it with `vue-jest@next`. Then you need to configure it with Jest's [transform](https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) option.

If you don't want to configure it yourself, you can get a minimal repository with everything set up [here](https://github.com/lmiller1990/vtu-next-demo).

Continue reading to learn more about Vue Test Utils.
