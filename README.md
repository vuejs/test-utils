# vue-test-utils-next

The next iteration of Vue Test Utils. It targets Vue 3.

## Installation and Usage

- yarn: `yarn add @vue/test-utils@next --dev`
- npm: `npm install @vue/test-utils@next --save-dev`

## Working with `.vue` files

There is [`vue-jest`](https://github.com/vuejs/vue-jest) for loading `.vue` files into Jest. The `next` branch contains support for Vue 3. Install it with `yarn add vue-jest@next`. It lacks support for some things, namely JSX. 

If you don't want to configure things, you can download a repository with Vue 3, `@vue/test-utils@next`, `vue-jest` and TypeScript configured [here](https://github.com/lmiller1990/vtu-next-demo).

## Docs

Docs are located in [this repo](https://github.com/vuejs/vue-test-utils-next-docs). Read them [here](https://vuejs.github.io/vue-test-utils-next-docs/guide/introduction.html). They are in a separate repository because running Vuepress alongside a repo with Vue 3 causes conflicts - Vuepress expects to be running against Vue 2. This seems like the most simple solution for now.

## Development

It's a pretty small codebase at the moment. Get started by running `yarn install`. You can run the tests with `yarn test`. That's it!

There is a lot of work to do. See issues for some basic TODOs, or the table at the bottom of this page.

## What works?

See the [docs](https://vuejs.github.io/vue-test-utils-next-docs/guide/introduction.html). Most basic DOM interactions work. Advanced features like `shallowMount` and `stubs` are a work in progress.

## Contributing

This is still very much alpha - if you want to add a feature, have a hack or ping someone in Discord to chat, or check out the issues and project board.

## Comparsion with Vue Test Utils beta (targeting Vue 2)

This is table for those coming from VTU beta, comparing the two APIs. A lot of things are still a work in progress.

- ✅ - implemented
- ❌ - not yet implemented
- ⚰️ - will not be implemented (if you have a compelling use case, please open an issue)

Q: Where is `shallowMount`?
A: Still figuring out how to best implement it. There is an issue and a PR open.

### Mounting Options

| option | status | notes |
|---------|-------|------|
context | ⚰️ | different from Vue 2, may not make sense anymore.
data | ✅
slots | ✅ | has not been tested vigorously. Please try it out.
scopedSlots | ⚰️ | scopedSlots are merged with slots in Vue 3
stubs | ❌ 
mocks | ✅ | nested in [`global`](https://vuejs.github.io/vue-test-utils-next-docs/api/#global)
localVue | ⚰️ | may not make sense anymore since we do not mutate the global Vue instance in Vue 3.
attachToDocument | ❌| will rename to `attachTo`. See [here](https://github.com/vuejs/vue-test-utils/pull/1492)
attrs | ❌ |
propsData | ✅ | now called `props`
listeners | ⚰️ | no longer exists in Vue 3
parentComponent | ⚰️ |
provide | ✅ | nested in [`global`](https://vuejs.github.io/vue-test-utils-next-docs/api/#global)
mixins | ✅ | (new!) nested in [`global`](https://vuejs.github.io/vue-test-utils-next-docs/api/#global)
plugins | ✅ | (new!) nested in [`global`](https://vuejs.github.io/vue-test-utils-next-docs/api/#global)
component | ✅ | (new!) nested in [`global`](https://vuejs.github.io/vue-test-utils-next-docs/api/#global)
directives | ✅ | (new!) nested in [`global`](https://vuejs.github.io/vue-test-utils-next-docs/api/#global)


### Wrapper API (mount)

| method | status | notes |
|---------|-------|------|
attributes | ✅
classes | ✅
contains | ⚰️| use `find` 
destroy | ❌
emitted | ✅
emittedByOrder | ⚰️| use `emitted`
exists | ✅
find | ✅ | only `querySelector` syntax is supported. `find(Comp)` under discussion [here](https://github.com/vuejs/vue-test-utils/issues/1498)
findAll | ✅ | see above. `.vm` is different to Vue 2. We are exploring options.
get | ❌
html | ✅
is | ❌
isEmpty | ❌
isVisible | ❌
isVueInstance | ❌
name | ⚰️ |
props | ❌
setChecked ⚰️| now part of `setValue` 
setData | ❌ | 
setMethods | ⚰️ | 
setProps | ❌
setSelected ⚰️ now part of `setValue` 
setValue | ✅ | works for select, checkbox, radio button, input, textarea. Returns `nextTick`.
text | ✅
trigger | ✅ | returns `nextTick`. You can do `await wrapper.find('button').trigger('click')`
