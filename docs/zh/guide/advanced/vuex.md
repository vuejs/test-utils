# 测试 Vuex

Vuex 只是一个实现细节；在测试使用 Vuex 的组件时不需要特别处理。尽管如此，还是有一些技巧可以使你的测试更易读和易写。我们将在这里讨论它们。

本指南假设你对 Vuex 已经熟悉。Vuex 4 是与 Vue.js 3 一起使用的版本。可以在[这里](https://next.vuex.vuejs.org/)阅读文档。

## 简单示例

以下是一个简单的 Vuex store 和一个依赖于 Vuex store 的组件：

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

这个 store 简单地存储了一个计数，当提交 `increment` mutation 时增加计数。以下是我们将要测试的组件：

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

## 使用真实的 Vuex store 进行测试

为了充分测试这个组件和 Vuex store 的工作情况，我们将点击 `<button>` 并断言计数是否增加。在你的 Vue 应用中，通常在 `main.js` 中，你可以这样安装 Vuex：

```js
const app = createApp(App)
app.use(store)
```

这是因为 Vuex 是一个插件。插件通过调用 `app.use` 并传入插件来应用。

Vue Test Utils 也允许你使用 `global.plugins` 挂载选项安装插件。

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

在安装插件后，我们使用 `trigger` 点击按钮并断言 `count` 是否增加。这种测试覆盖了不同系统之间的交互 (在这种情况下是组件和 store)，称为集成测试。

## 使用模拟 store 进行测试

相比之下，单元测试可能会将组件和 store 分开进行测试。如果你有一个非常大的应用程序和复杂的 store ，这可能会很有用。对于这种用例，你可以使用 `global.mocks` 模拟这个 store 中你感兴趣的部分：

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

相较于使用真实的 Vuex store 并通过 `global.plugins` 安装它，取而代之的是，我们创建了自己的模拟 store，仅实现了 Vuex 用在该组件中的部分 (在这种示例中是 `state` 和 `commit` 函数)。

虽然隔离测试 store 似乎很方便，但请注意，如果你破坏了 Vuex store 是不会收到任何警告的。请仔细考虑要模拟 Vuex store 还是使用真实的 store，并理解其中的权衡。

## 隔离测试 Vuex

你可能希望完全隔离测试你的 Vuex mutation 或 action，特别是当它们很复杂时。因为 Vuex store 只是常规的 JavaScript，所它需要 Vue Test Utils。以下是不通过 Vue Test Utils 测试 `increment` mutation 的方式：

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

## 预设 Vuex state

有时在特定的状态下获得 Vuex store 是对测试非常有帮助的。除了 `global.mocks`，我们还有一个技巧，就是创建一个 `createStore` 的包装函数，并接受一个参数来设置初始状态。在这个示例中，我们扩展 `increment` 以接受一个附加参数，该参数将被添加到 `state.count` 上。如果未提供该参数，我们只将 `state.count` 增加 1。

```js
const createVuexStore = initialState =>
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

这份 [Vue 测试手册](https://lmiller1990.github.io/vue-testing-handbook/testing-vuex.html)中有更多关于测试 Vuex 的示例。注意：这些示例适用于 Vue.js 2 和 Vue Test Utils v1。但思想和概念是相同的。Vue 测试手册将来会更新，以适用于 Vue.js 3 和 Vue Test Utils 2。

## 使用组合 API 进行测试

在使用组合 API 时，可以通过 `useStore` 函数访问 Vuex。[在这里阅读更多相关内容](https://next.vuex.vuejs.org/guide/composition-api.html)。

如 [Vuex 文档中所述](https://next.vuex.vuejs.org/guide/typescript-support.html#typing-usestore-composition-function)，`useStore` 可以与可选的唯一注入键一起使用。

它看起来像这样：

```js
import { createStore } from 'vuex'
import { createApp } from 'vue'

// 创建一个全局唯一的符号作为注入键
const key = Symbol()

const App = {
  setup() {
    // 使用唯一键访问 store
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

如果不使用注入键，store 里的数据可以通过全局 `provide` 挂载选项直接注入到组件中。注入的 store 名称必须与组件中的名称相同，例如 “store”。

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

当使用带有注入键的 store 时，之前的方法将无法工作。store 实例将不会从 `useStore` 返回。为了访问正确的 store，我们需要提供标识符。

它必须是传递给组件的 `setup` 函数中 `useStore` 的确切键，或者在自定义辅助函数中调用 `useStore` 时使用的键。由于 JavaScript symbols 是唯一的且无法重建，最好从真实的 store 中导出该键。

你可以使用 `global.provide` 和正确的键来注入 store，或者使用 `global.plugins` 安装 store 并指定键

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

- 使用 `global.plugins` 以插件形式安装 Vuex
- 使用 `global.mocks` 模拟诸如 Vuex 的全局对象，以满足高级用例
- 考虑单独测试复杂的 Vuex mutation 和 action
- 使用 `createStore` 的包装函数，以便接收参数设置特定的测试场景
