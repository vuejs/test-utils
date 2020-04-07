# vue-test-utils-next

The next iteration of Vue Test Utils. 

Docs are located in [this repo](https://github.com/vuejs/vue-test-utils-next-docs). Read them [here](https://vuejs.github.io/vue-test-utils-next-docs/guide/introduction.html). They are in a separate repository because running Vuepress alongside a repo with Vue 3 causes conflicts - Vuepress expects to be running against Vue 2. This seems like the most simple solution for now.

## Development

It's a pretty small codebase at the moment. Get started by running `yarn install`. You can run the tests with `yarn test`. That's it!

ots to do. See issues for some basic TODOs.

## Working with `.vue` files

There is [`vue-jest`](https://github.com/vuejs/vue-jest) for loading `.vue` files into Jest. The `next` branch contains support for Vue 3. Install it with `yarn add vue-jest@next`.

## What works?

See the [docs](https://vuejs.github.io/vue-test-utils-next-docs/guide/introduction.html). Most basic DOM interactions work. Advanced features like `shallowMount`, `stubs` and `mocks` are a work in progress.

## Contributing

This is still very much alpha - if you want to add a feature, have a hack or ping someone in Discord to chat, or check out the issues and project board.
