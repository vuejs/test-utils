# Installation

::: code-group

```shell [npm]
npm install --save-dev @vue/test-utils
```

```shell [yarn]
yarn add --dev @vue/test-utils
```

:::

## Usage

Vue Test Utils is framework agnostic - you can use it with whichever test runner you like.

### Vitest (Recommended)

[Vitest](https://vitest.dev/) is the recommended test runner for Vue projects. It is built on Vite, supports `.vue` files out of the box, and provides a fast, modern testing experience with native ESM support.

```shell
npm install --save-dev vitest
```

No additional transform configuration is needed when using Vitest with a Vite-based project. See the [Vitest getting started guide](https://vitest.dev/guide/) for more details.

### Jest

You can also use [Jest](https://jestjs.io/) with Vue Test Utils. To load `.vue` files with Jest, you will need `vue-jest`. You can install it with `vue-jest@next` and configure it with Jest's [transform](https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) option.

Continue reading to learn more about Vue Test Utils.
