# 测试 Vuex

Vuex 只是一个实现细节；在测试使用 Vuex 的组件时不需要特别处理。尽管如此，有一些技术可以使你的测试更易读和易写。我们将在这里讨论这些技术。

本指南假设你对 Vuex 已经熟悉。Vuex 4 是与 Vue.js 3 一起使用的版本。可以在 [这里](https://next.vuex.vuejs.org/) 阅读文档。

## 简单示例

以下是一个简单的 Vuex 存储和一个依赖于 Vuex 存储的组件：

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

这个存储简单地存储了一个计数，当提交 `increment` 变更时增加计数。以下是我们将要测试的组件：

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

## 使用真实的 Vuex 存储进行测试

为了充分测试这个组件和 Vuex 存储的工作情况，我们将点击 `<button>` 并断言计数是否增加。在你的 Vue 应用中，通常在 `main.js` 中，你可以这样安装 Vuex：

```js
const app = createApp(App)
app.use(store)
```

这是因为 Vuex 是一个插件。插件通过调用 `app.use` 并传入插件来应用。

Vue Test Utils 也允许你安装插件，使用 `global.plugins` 挂载选项。

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

在安装插件后，我们使用 `trigger` 点击按钮并断言 `count` 是否增加。这种测试覆盖了不同系统之间的交互（在这种情况下是组件和存储），称为集成测试。

## 使用模拟存储进行测试

相比之下，单元测试可能会将组件和存储分开进行测试。如果你有一个非常大的应用程序和复杂的存储，这可能会很有用。对于这种用例，你可以使用 `global.mocks` 模拟你感兴趣的存储部分

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

我们没有使用真实的 Vuex 存储并通过 `global.plugins` 安装它，而是创建了自己的模拟存储，仅实现了组件中使用的 Vuex 部分（在这种情况下是 `state` 和 `commit` 函数）。

虽然在隔离中测试存储似乎很方便，但请注意，如果你破坏了 Vuex 存储，它不会给你任何警告。请仔细考虑是否要模拟 Vuex 存储，或者使用真实的存储，并理解其中的权衡。

## 独立测试 Vuex

你可能希望完全独立地测试你的 Vuex 变更或动作，特别是如果它们很复杂。你不需要 Vue Test Utils，因为 Vuex 存储只是常规的 JavaScript。以下是如何在没有 Vue Test Utils 的情况下测试 `increment` 变更：

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

## 预设 Vuex 状态

有时在测试中将 Vuex 存储设置为特定状态是有用的。除了 `global.mocks`，你可以使用创建一个包装 `createStore` 的函数，并接受一个参数来设置初始状态。在这个示例中，我们扩展 `increment` 以接受一个附加参数，该参数将添加到 `state.count` 上。如果未提供该参数，我们只将 `state.count` 增加 1。

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

通过创建一个接受初始状态的 `createVuexStore` 函数，我们可以轻松设置初始状态。这使我们能够测试所有边界情况，同时简化我们的测试。

[Vue 测试手册](https://lmiller1990.github.io/vue-testing-handbook/testing-vuex.html)中有更多关于测试 Vuex 的示例。注意：这些示例适用于 Vue.js 2 和 Vue Test Utils v1。思想和概念是相同的，Vue 测试手册将在不久的将来更新为 Vue.js 3 和 Vue Test Utils 2。

## 使用组合 API 进行测试

在使用组合 API 时，通过 `useStore` 函数访问 Vuex。[在这里阅读更多相关内容](https://next.vuex.vuejs.org/guide/composition-api.html)。

`useStore` 可以与可选的唯一注入键一起使用，如 [Vuex 文档中所述](https://next.vuex.vuejs.org/guide/typescript-support.html#typing-usestore-composition-function)。

它看起来像这样：

```js
import { createStore } from 'vuex'
import { createApp } from 'vue'

// 创建一个全局唯一的符号作为注入键
const key = Symbol()

const App = {
  setup() {
    // 使用唯一键访问存储
    const store = useStore(key)
  }
}

const store = createStore({
  /* ... */
})
const app = createApp({
  /* ... */
})

// 在调用 app.use(store) 时指定键作为第二个参数
app.use(store, key)
```

为了避免在每次使用 `useStore` 时重复传递键参数，Vuex 文档建议将该逻辑提取到一个辅助函数中，并重用该函数，而不是使用默认的 `useStore` 函数。[在这里阅读更多内容](https://next.vuex.vuejs.org/guide/typescript-support.html#typing-usestore-composition-function)。使用 Vue Test Utils 提供存储的方法取决于组件中 `useStore` 函数的使用方式。

### 测试不使用注入键的 `useStore` 的组件

如果不使用注入键，存储数据可以通过全局 `provide` 挂载选项直接注入到组件中。注入的存储名称必须与组件中的名称相同，例如 "store"。

#### 提供未键入的 `useStore` 示例

```js
import { createStore } from 'vuex'

const store = createStore({
  // ...
})

const wrapper = mount(App, {
  global: {
    provide: {
      store: store
    }
  }
})
```

### 测试使用注入键的 `useStore` 的组件

当使用带有注入键的存储时，之前的方法将无法工作。存储实例将不会从 `useStore` 返回。为了访问正确的存储，需要提供标识符。

它必须是传递给组件的 `setup` 函数中 `useStore` 的确切键，或者在自定义辅助函数中调用 `useStore` 时使用的键。由于 JavaScript symbols 是唯一的且无法重建，最好从真实的存储中导出该键。

你可以使用 `global.provide` 和正确的键来注入存储，或者使用 `global.plugins` 安装存储并指定键

#### 使用 `global.provide` 提供带有键的 `useStore`

```js
// store.js
export const key = Symbol()
```

```js
// app.spec.js
import { createStore } from 'vuex'
import { key } from './store'

const store = createStore({
  /* ... */
})

const wrapper = mount(App, {
  global: {
    provide: {
      [key]: store
    }
  }
})
```

#### 使用 `global.plugins` 提供带有键的 `useStore`

```js
// store.js
export const key = Symbol()
```

```js
// app.spec.js
import { createStore } from 'vuex'
import { key } from './store'

const store = createStore({
  /* ... */
})

const wrapper = mount(App, {
  global: {
    // 要传递选项给插件，请使用数组语法。
    plugins: [[store, key]]
  }
})
```

## 结论

- 使用 `global.plugins` 安装 Vuex 作为插件
- 使用 `global.mocks` 模拟全局对象，例如 Vuex，以满足高级用例
- 考虑单独测试复杂的 Vuex 变更和动作
- 使用一个接受参数的函数来封装 `createStore`，以便设置特定的测试场景
