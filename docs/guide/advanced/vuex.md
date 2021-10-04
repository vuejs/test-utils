# Testing Vuex

Vuex is just an implementation detail; no special treatment is required for testing components using Vuex. That said, there are some techniques that might make your tests easier to read and write. We will look at those here.

This guide assumes you are familiar with Vuex. Vuex 4 is the version that works with Vue.js 3. Read the docs [here](https://next.vuex.vuejs.org/).

## A Simple Example

Here is a simple Vuex store, and a component that relies on a Vuex store being present:

```js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    increment(state: any) {
      state.count += 1
    }
  }
})
```

The store simply stores a count, increasing it when the `increment` mutation is committed. This is the component we will be testing:

```js
const App = {
  template: `
    <div>
      <button @click="increment" />
      Count: {{ count }}
    </div>
  `,
  computed: {
    count() {
      return this.$store.state.count
    }
  },
  methods: {
    increment() {
      this.$store.commit('increment')
    }
  }
}
```

## Testing with a Real Vuex Store

To fully test that this component and the Vuex store are working, we will click on the `<button>` and assert the count is increased. In your Vue applications, usually in `main.js`, you install Vuex like this:

```js
const app = createApp(App)
app.use(store)
```

This is because Vuex is a plugin. Plugins are applied by calling `app.use` and passing in the plugin.

Vue Test Utils allows you to install plugins as well, using the `global.plugins` mounting option.

```js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    increment(state: any) {
      state.count += 1
    }
  }
})

test('vuex', async () => {
  const wrapper = mount(App, {
    global: {
      plugins: [store]
    }
  })

  await wrapper.find('button').trigger('click')

  expect(wrapper.html()).toContain('Count: 1')
})
```

After installing the plugin, we use `trigger` to click the button and assert that `count` is increased. This kind of test, that covers the interaction between different systems (in this case, the Component and the store), is known as an integration test.

## Testing with a Mock Store

In contrast, a unit test might isolate and test the component and the store separately. This can be useful if you have a very large application with a complex store. For this use case, you can mock the parts of the store you are interested in using `global.mocks`:

```js
test('vuex using a mock store', async () => {
  const $store = {
    state: {
      count: 25
    },
    commit: jest.fn()
  }

  const wrapper = mount(App, {
    global: {
      mocks: {
        $store
      }
    }
  })

  expect(wrapper.html()).toContain('Count: 25')
  await wrapper.find('button').trigger('click')
  expect($store.commit).toHaveBeenCalled()
})
```

Instead of using a real Vuex store and installing it via `global.plugins`, we created our own mock store, only implementing the parts of Vuex used in the component (in this case, the `state` and `commit` functions).

While it might seem convenient to test the store in isolation, notice that it won't give you any warning if you break your Vuex store. Consider carefully if you want to mock the Vuex store, or use a real one, and understand the trade-offs.

## Testing Vuex in Isolation

You may want to test your Vuex mutations or actions in total isolation, especially if they are complex. You don't need Vue Test Utils for this, since a Vuex store is just regular JavaScript. Here's how you might test the `increment` mutation without Vue Test Utils:

```js
test('increment mutation', () => {
  const store = createStore({
    state: {
      count: 0
    },
    mutations: {
      increment(state) {
        state.count += 1
      }
    }
  })

  store.commit('increment')

  expect(store.state.count).toBe(1)
})
```

## Presetting the Vuex State

Sometimes it can be useful to have the Vuex store in a specific state for a test. One useful technique you can use, other than `global.mocks`, is to create a function that wraps `createStore` and takes an argument to seed the initial state. In this example we extend `increment` to take an additional argument, which will be added on to the `state.count`. If that is not provided, we just increment `state.count` by 1.

```js
const createVuexStore = (initialState) =>
  createStore({
    state: {
      count: 0,
      ...initialState
    },
    mutations: {
      increment(state, value = 1) {
        state.count += value
      }
    }
  })

test('increment mutation without passing a value', () => {
  const store = createVuexStore({ count: 20 })
  store.commit('increment')
  expect(store.state.count).toBe(21)
})

test('increment mutation with a value', () => {
  const store = createVuexStore({ count: -10 })
  store.commit('increment', 15)
  expect(store.state.count).toBe(5)
})
```

By creating a `createVuexStore` function that takes an initial state, we can easily set the initial state. This allows us to test all of the edge cases, while simplifying our tests.

The [Vue Testing Handbook](https://lmiller1990.github.io/vue-testing-handbook/testing-vuex.html) has more examples for testing Vuex. Note: the examples pertain to Vue.js 2 and Vue Test Utils v1. The ideas and concepts are the same, and the Vue Testing Handbook will be updated for Vue.js 3 and Vue Test Utils 2 in the near future.

## Testing using the Composition API

Vuex is accessed via a `useStore` function when using the Composition API. [Read more about it here](https://next.vuex.vuejs.org/guide/composition-api.html).

`useStore` can be used with an optional and unique injection key as discussed [in the Vuex documentation](https://next.vuex.vuejs.org/guide/typescript-support.html#typing-usestore-composition-function).

It looks like this:

```js
import { createStore } from 'vuex'
import { createApp } from 'vue'

// create a globally unique symbol for the injection key
const key = Symbol()

const App = {
  setup () {
    // use unique key to access store
    const store = useStore(key)
  }
}

const store = createStore({ /* ... */ })
const app = createApp({ /* ... */ })

// specify key as second argument when calling app.use(store)
app.use(store, key)
```

To avoid repeating the key parameter passing whenever `useStore` is used, the Vuex documentation recommends extracting that logic into a helper function and reuse that function instead of the default `useStore` function. [Read wore about it here](https://next.vuex.vuejs.org/guide/typescript-support.html#typing-usestore-composition-function). The approach providing a store using Vue Test Utils depends on the way the `useStore` function is used in the component.

### Testing Components that Utilize `useStore` without an Injection Key

Without an injection key, the store data can just be injected into the component via the global `provide` mounting option. The name of the injected store must be the same as the one in the component, e.g. "store". 

#### Example for providing the unkeyed `useStore`

```js
import { createStore } from 'vuex'

const store = createStore({
  // ...
})

const wrapper = mount(App, {
  global: {
    provide: {
      store: store
    },
  },
})
```

### Testing Components that Utilize `useStore` with an Injection Key

When using the store with an injection key ,the previous approach won't work. The store instance won't be returned from `useStore`. In order to access the correct store the identifier needs to be provided.

It needs to be the exact key that is passed to `useStore` in the `setup` function of the component or to `useStore` within the custom helper function. Since JavaScript symbols are unique and can't be recreated, it is best to export the key from the real store.

You can either use `global.provide` with the correct key to inject the store, or `global.plugins` to install the store and specify the key:

#### Providing the Keyed `useStore` using `global.provide`

```js
// store.js
export const key = Symbol()
```

```js
// app.spec.js
import { createStore } from 'vuex'
import { key } from './store'

const store = createStore({ /* ... */ })

const wrapper = mount(App, {
  global: {
    provide: {
      [key]: store
    },
  },
})
```

#### Providing the Keyed `useStore` using `global.plugins`

```js
// store.js
export const key = Symbol()
```

```js
// app.spec.js
import { createStore } from 'vuex'
import { key } from './store'

const store = createStore({ /* ... */ })

const wrapper = mount(App, {
  global: {
    // to pass options to plugins, use the array syntax.
    plugins: [[store, key]]
  },
})
```



## Conclusion

- Use `global.plugins` to install Vuex as a plugin
- Use `global.mocks` to mock a global object, such as Vuex, for advanced use cases
- Consider testing complex Vuex mutations and actions in isolation
- Wrap `createStore` with a function that takes an argument to set up specific test scenarios
