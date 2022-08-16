# Vue Test Utils

Component testing utils for Vue 3.

## Installation and Usage

- yarn: `yarn add @vue/test-utils --dev`
- npm: `npm install @vue/test-utils --save-dev`

Get started with the [documentation](https://test-utils.vuejs.org/).

## Coming from Vue 2 + Test Utils v1?

[Check the migration guide](https://test-utils.vuejs.org/migration/). It's still a work in progress. If you find a problem or something that doesn't work that previously did in Vue Test Utils v1, please open an issue.

## Documentation

See the [docs](https://test-utils.vuejs.org/).

## Development

Get started by running `pnpm install`. You can run the tests with `pnpm test`. That's it!

## Comparison with Vue Test Utils v1 (targeting Vue 2)

This is table for those coming from VTU 1, comparing the two APIs. Some things are still a work in progress.

- ✅ - implemented
- ❌ - not yet implemented
- ⚰️ - will not be implemented (if you have a compelling use case, please open an issue)

### Mounting Options

| option           | status | notes                                                                               |
| ---------------- | ------ | ----------------------------------------------------------------------------------- |
| data             | ✅     |
| slots            | ✅     |
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
| localVue         | ⚰️     | no longer required - Vue 3 there is no global Vue instance to mutate. |
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
