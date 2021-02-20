# vue-test-utils-next

The next iteration of Vue Test Utils. It targets Vue 3.

## Installation and Usage

- yarn: `yarn add @vue/test-utils@next --dev`
- npm: `npm install @vue/test-utils@next --save-dev`

Get started with the [documentation](https://next.vue-test-utils.vuejs.org/).

## Coming from Vue 2 + Vue Test Utils?

We plan on work on [some documentation to help people migrate](https://next.vue-test-utils.vuejs.org/migration/).

At this point you will have better luck trying this out with a brand new Vue 3 app, as opposed to upgrading an existing Vue 2 app. Feedback and bug reports are welcome!

## Working with `.vue` files

There is [`vue-jest`](https://github.com/vuejs/vue-jest) for loading `.vue` files into Jest. The `next` branch contains support for Vue 3. Install it with `yarn add vue-jest@next`. It lacks support for some things, namely JSX.

If you don't want to configure things, you can download a repository with Vue 3, `@vue/test-utils@next`, `vue-jest@next` and TypeScript configured [here](https://github.com/lmiller1990/vtu-next-demo).

## Documentation

See the [docs](https://next.vue-test-utils.vuejs.org/).

## Development

It's a pretty small codebase at the moment. Get started by running `yarn install`. You can run the tests with `yarn test`. That's it!

There is still some work left to do. See issues for some basic TODOs, or the table at the bottom of this page.

## Contributing

We plan on moving to RC sooner than later. If you want to add a feature, have a hack or ping someone in Discord to chat, or check out the issues and project board.

There's also some [work left to do in docs](https://github.com/vuejs/vue-test-utils-next/issues?q=is%3Aopen+is%3Aissue+label%3Adocumentation).

## Comparison with Vue Test Utils beta (targeting Vue 2)

This is table for those coming from VTU 1, comparing the two APIs. Some things are still a work in progress.

- ✅ - implemented
- ❌ - not yet implemented
- ⚰️ - will not be implemented (if you have a compelling use case, please open an issue)

### Mounting Options

| option           | status | notes                                                                               |
| ---------------- | ------ | ----------------------------------------------------------------------------------- |
| data             | ✅     |
| slots            | ✅     | has not been tested vigorously. Please try it out.                                  |
| mocks            | ✅     | nested in `global`                                                                  |
| propsData        | ✅     | now called `props`                                                                  |
| provide          | ✅     | nested in `global`                                                                  |
| mixins           | ✅     | (new!) nested in `global`                                                           |
| plugins          | ✅     | (new!) nested in `global`                                                           |
| component        | ✅     | (new!) nested in `global`                                                           |
| directives       | ✅     | (new!) nested in `global`                                                           |
| stubs            | ✅     |
| attachToDocument | ✅     | renamed `attachTo`. See [here](https://github.com/vuejs/vue-test-utils/pull/1492)   |
| attrs            | ✅     |
| scopedSlots      | ⚰️     | scopedSlots are merged with `slots` in Vue 3                                        |
| context          | ⚰️     | different from Vue 2, does not make sense anymore.                                  |
| localVue         | ⚰️     | may not make sense anymore since we do not mutate the global Vue instance in Vue 3. |
| listeners        | ⚰️     | no longer exists in Vue 3                                                           |
| parentComponent  | ⚰️     |

### Wrapper API (mount)

| method         | status | notes                                                                                                                               |
| -------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| attributes     | ✅     |
| classes        | ✅     |
| exists         | ✅     |
| find           | ✅     | only `querySelector` syntax is supported. `find(Comp)` under discussion [here](https://github.com/vuejs/vue-test-utils/issues/1498) |
| emitted        | ✅     |
| findAll        | ✅     | see above. `.vm` is different to Vue 2. We are exploring options.                                                                   |
| get            | ✅     |
| html           | ✅     |
| setValue       | ✅     | works for select, checkbox, radio button, input, textarea. Returns `nextTick`.                                                      |
| text           | ✅     |
| trigger        | ✅     | returns `nextTick`. You can do `await wrapper.find('button').trigger('click')`                                                      |
| setProps       | ✅     |
| props          | ✅     |
| setData        | ✅     |
| destroy        | ✅     | renamed to `unmount` to match Vue 3 lifecycle hook name.                                                                            |
| props          | ✅     |
| isVisible      | ✅     |
| contains       | ⚰️     | use `find`                                                                                                                          |
| emittedByOrder | ⚰️     | use `emitted`                                                                                                                       |
| setSelected    | ⚰️     | now part of `setValue`                                                                                                              |
| setChecked     | ⚰️     | now part of `setValue`                                                                                                              |
| is             | ⚰️     |
| isEmpty        | ⚰️     | use matchers such as [this](https://github.com/testing-library/jest-dom#tobeempty)                                                  |
| isVueInstance  | ⚰️     |
| name           | ⚰️     |
| setMethods     | ⚰️     |
