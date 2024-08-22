# Migrating from Vue Test Utils v1

A review of changes VTU v1 -> VTU v2, and some code snippets to showcase required modifications. If you encounter a bug or difference in behavior not documented here, please [open an issue](https://github.com/vuejs/test-utils/issues/new).

## Changes

### `propsData` is now `props`

In VTU v1, you would pass props using the `propsData` mounting option. This was confusing, because you declare props inside of the `props` option in your Vue components. Now you can pass `props` using the `props` mounting option. `propsData` is and will continue to be supported for backwards compatibility.

**Before**:

```js
const App = {
  props: ['foo']
}

const wrapper = mount(App, {
  propsData: {
    foo: 'bar'
  }
}
```

**After**:

```js
const App = {
  props: ['foo']
}

const wrapper = mount(App, {
  props: {
    foo: 'bar'
  }
}
```

### No more `createLocalVue`

In Vue 2, it was common for plugins to mutate the global Vue instance and attach various methods to the prototype. As of Vue 3, this is no longer the case - you create a new Vue app using `createApp` as opposed to `new Vue`, and install plugins with `createApp(App).use(/* ... */)`.

To avoid polluting the global Vue instance in Vue Test Utils v1, we provided a `createLocalVue` function and `localVue` mounting option. This would let you have an isolated Vue instance for each test, avoiding cross test contamination. This is no longer an issue in Vue 3, since plugins, mixins etc do not mutate the global Vue instance.

For most cases where you would previously use `createLocalVue` and the `localVue` mounting option to install a plugin, mixin or directive, you now use the [`global` mounting option](/api/#global-components). Here is an example of a component and test that used `localVue`, and how it now looks (using `global.plugins`, since Vuex is a plugin):

**Before**:

```js
import Vuex from 'vuex'
import { createLocalVue, mount } from '@vue/test-utils'

const App = {
  computed: {
    count() {
      return this.$state.count
    }
  }
}

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  state: {
    return { count: 1 }
  }
})

const wrapper = mount(App, {
  store
  localVue
})
```

**After**:

```js
import { createStore } from 'vuex'
import { mount } from '@vue/test-utils'

const App = {
  computed: {
    count() {
      return this.$state.count
    }
  }
}

const store = createStore({
  state() {
    return { count: 1 }
  }
})

const wrapper = mount(App, {
  global: {
    plugins: [store]
  }
})
```

### `mocks` and `stubs` are now in `global`

`mocks` and `stubs` are applied to all components, not just the one you are passing to `mount`. To reflect this, `mocks` and `stubs` are in the new `global` mounting option:

**Before**:

```js
const $route = {
  params: {
    id: '1'
  }
}

const wrapper = mount(App, {
  stubs: {
    Foo: true
  },
  mocks: {
    $route
  }
}
```

**After**:

```js
const $route = {
  params: {
    id: '1'
  }
}

const wrapper = mount(App, {
  global: {
    stubs: {
      Foo: true
    },
    mocks: {
      $route
    }
  }
}
```

### `shallowMount` and `renderStubDefaultSlot`

`shallowMount` is intended to stub out any custom components. While this was the case in Vue Test Utils v1, stubbed components would still render their default `<slot />`. While this was unintended, some users came to enjoy this feature. This behavior is corrected in v2 - **the slot content for a stubbed component is not rendered**.

Given this code:

```js
import { shallowMount } from '@vue/test-utils'

const Foo = {
  template: `<div><slot /></div>`
}

const App = {
  components: { Foo },
  template: `
    <div>
      <Foo>
        Foo Slot
      </Foo>
    </div>
  `
}
```

**Before**:

```js
describe('App', () => {
  it('renders', () => {
    const wrapper = shallowMount(App)
    console.log(wrapper.html())
    // renders:
    // <div>
    //   <foo-stub>
    //     Foo Slot
    //   </foo-stub>
    // </div>
  })
})
```

**After**:

```js
describe('App', () => {
  it('renders', () => {
    const wrapper = shallowMount(App)
    console.log(wrapper.html())
    // renders:
    // <div>
    //   <foo-stub>
    //   </foo-stub>
    // </div>
  })
})
```

You can enable the old behavior like this:

```js
import { config } from '@vue/test-utils'

config.global.renderStubDefaultSlot = true
```

### `destroy` is now `unmount` to match Vue 3

Vue 3 renamed the `vm.$destroy` to `vm.$unmount`. Vue Test Utils has followed suit; `wrapper.destroy()` is now `wrapper.unmount()`.

### `scopedSlots` is now merged with `slots`

Vue 3 united the `slot` and `scoped-slot` syntax under a single syntax, `v-slot`, which you can read about in the [the docs](https://v3.vuejs.org/guide/migration/slots-unification.html#overview). Since `slot` and `scoped-slot` are now merged, the `scopedSlots` mounting option is now deprecated - just use the `slots` mounting option for everything.

### `slots`‘s scope is now exposed as `params`

When using string templates for slot content, if not explicitly defined using a wrapping `<template #slot-name="scopeVar">` tag, slot scope becomes available as a `params` object when the slot is evaluated.

```diff
shallowMount(Component, {
-  scopedSlots: {
+  slots: {
-    default: '<p>{{props.index}},{{props.text}}</p>'
+    default: '<p>{{params.index}},{{params.text}}</p>'
  }
})
````

### `findAll().at()` removed

`findAll()` now returns an array of DOMWrappers.

**Before:**

```js
wrapper.findAll('[data-test="token"]').at(0);
```

**After:**

```js
wrapper.findAll('[data-test="token"]')[0];
```

### `createWrapper()` removed

`createWrapper()` is now an internal function only and cannot be imported anymore. If you need access to a wrapper for a DOM element which isn't a Vue component, you can use `new DOMWrapper()` constructor.

**Before:**

```js
import { createWrapper } from "@vue/test-utils";

describe('App', () => {
  it('renders', () => {
    const body = createWrapper(document.body);
    expect(body.exists()).toBe(true);
  })

```

**After:**

```js
import { DOMWrapper } from "@vue/test-utils";

describe('App', () => {
  it('renders', () => {
    const body = new DOMWrapper(document.body);
    expect(body.exists()).toBe(true);
  })
```

### No more `ref` selector in `findAllComponents`

The `ref` syntax is not supported anymore in `findAllComponents`. You can set a `data-testid` instead and update the selector:

`Component.vue`:

```diff
<template>
-  <FooComponent v-for="number in [1, 2, 3]" :key="number" ref="number">
+  <FooComponent v-for="number in [1, 2, 3]" :key="number" data-test="number">
    {{ number }}
  </FooComponent>
</template>
```

`Component.spec.js`:

```diff
- wrapper.findAllComponents({ ref: 'number' })
+ wrapper.findAllComponents('[data-test="number"]')
```

## Test runners upgrade notes

> Vue Test Utils is framework agnostic - you can use it with whichever test runner you like.

This statement is at the core of `@vue/test-utils`. But we do relate to the fact that migrating code bases and corresponding test suites to `vue@3` can be, in some scenarios, a pretty big effort.

This section tries to compile some common gotchas spotted by our community while doing their migrations and also updating their underlying test running stack to more modern versions. These are unrelated to `@vue/test-utils`, but we hope it can help you out completing this important migration step.

### `@vue/vue3-jest` + `jest@^28`

If you've decided to take the opportunity and upgrade your test runner tools to a more modern version, have these in mind.

#### `ReferenceError: Vue is not defined` [vue-jest#479](https://github.com/vuejs/vue-jest/issues/479)

When `jest-environment-jsdom` package is used, it defaults to load libraries from `package.json` [`browser` entry](https://jestjs.io/docs/configuration#testenvironmentoptions-object). You can override it to use `node` imports instead and fix this error:

```js
// jest.config.js
module.exports = {
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  }
}
```
<br/>

#### Snapshots now include my comment nodes

If you use snapshot testing and comment nodes are leaking into your snapshots, note that `comments` are now always [preserved](https://vuejs.org/api/application.html#app-config-compileroptions-comments) and only removed in production. You can override this behaviour by tweaking `app.config.compilerOptions` to remove them from snapshots as well:
- via `vue-jest` [config](https://github.com/vuejs/vue-jest#compiler-options-in-vue-3).
  ```js
  // jest.config.js
  module.exports = {
    globals: {
      'vue-jest': {
        compilerOptions: {
          comments: false
        }
      }
    }
  }
  ```
- Via `@vue/test-utils` [`mountingOptions.global.config`](https://test-utils.vuejs.org/api/#global) either globally or on per-test basis.

## Comparison with v1

This is table for those coming from VTU 1, comparing the two APIs.

### Base API

| export            | notes                                                                            |
|-------------------|----------------------------------------------------------------------------------|
| enableAutoDestroy | replaced by `enableAutoUnmount`                                                  |

### Mounting Options

| option           | notes                                                                             |
|------------------|-----------------------------------------------------------------------------------|
| mocks            | nested in `global`                                                                |
| propsData        | now called `props`                                                                |
| provide          | nested in `global`                                                                |
| mixins           | nested in `global`                                                                |
| plugins          | nested in `global`                                                                |
| component        | nested in `global`                                                                |
| directives       | nested in `global`                                                                |
| attachToDocument | renamed `attachTo`. See [here](https://github.com/vuejs/vue-test-utils/pull/1492) |
| scopedSlots      | removed. ScopedSlots are merged with `slots` in Vue 3                             |
| context          | removed. Different from Vue 2, does not make sense anymore.                       |
| localVue         | removed. No longer required - in Vue 3 there is no global Vue instance to mutate. |
| listeners        | removed. No longer exists in Vue 3                                                |
| parentComponent  | removed                                                                           |

### Wrapper API (mount)

| method         | notes                                                                                       |
|----------------|---------------------------------------------------------------------------------------------|
| find           | only `querySelector` syntax is supported. Use `findComponent(Comp)` to find a Vue component |
| setValue       | works for select, checkbox, radio button, input, textarea. Returns `nextTick`.              |
| trigger        | returns `nextTick`. You can do `await wrapper.find('button').trigger('click')`              |
| destroy        | renamed to `unmount` to match Vue 3 lifecycle hook name.                                    |
| contains       | removed. Use `find`                                                                         |
| emittedByOrder | removed. Use `emitted`                                                                      |
| setSelected    | removed. Now part of `setValue`                                                             |
| setChecked     | removed. Now part of `setValue`                                                             |
| is             | removed                                                                                     |
| isEmpty        | removed. Use matchers such as [this](https://github.com/testing-library/jest-dom#tobeempty) |
| isVueInstance  | removed                                                                                     |
| name           | removed                                                                                     |
| setMethods     | removed                                                                                     |
