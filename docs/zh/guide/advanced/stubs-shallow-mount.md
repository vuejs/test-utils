# 桩 (Stubs) 与浅层挂载

Vue Test Utils 提供了一些高级功能用于 _ 桩 _ 组件和指令。*桩*是指将自定义组件或指令的现有实现替换为一个不执行任何操作的虚拟实现，这可以简化本来复杂的测试。让我们来看一个例子。

## 桩化单个子组件

一个常见的例子是当你想要测试一个在组件层级中非常高的组件时。

在这个例子中，我们有一个 `<App>` 组件，它渲染一条消息，还有一个 `FetchDataFromApi` 组件，它进行 API 调用并渲染结果。

```js
const FetchDataFromApi = {
  name: 'FetchDataFromApi',
  template: `
    <div>{{ result }}</div>
  `,
  async mounted() {
    const res = await axios.get('/api/info')
    this.result = res.data
  },
  data() {
    return {
      result: ''
    }
  }
}

const App = {
  components: {
    FetchDataFromApi
  },
  template: `
    <h1>Welcome to Vue.js 3</h1>
    <fetch-data-from-api />
  `
}
```

在这个特定的测试中，我们不想进行 API 调用，我们只想断言消息是否被渲染。在这种情况下，我们可以使用 `stubs`，它出现在 `global` 挂载选项中。

```js
test('stubs component with custom template', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        FetchDataFromApi: {
          template: '<span />'
        }
      }
    }
  })

  console.log(wrapper.html())
  // <h1>Welcome to Vue.js 3</h1><span></span>

  expect(wrapper.html()).toContain('Welcome to Vue.js 3')
})
```

注意，模板中显示的是 `<span></span>`，而不是 `<fetch-data-from-api />`。我们用一个桩替换了它——在这种情况下，我们通过传入一个 `template` 提供了自己的实现。

你也可以获取一个默认的桩，而不需要提供自己的实现：

```js
test('stubs component', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        FetchDataFromApi: true
      }
    }
  })

  console.log(wrapper.html())
  /*
    <h1>Welcome to Vue.js 3</h1>
    <fetch-data-from-api-stub></fetch-data-from-api-stub>
  */

  expect(wrapper.html()).toContain('Welcome to Vue.js 3')
})
```

这将桩化整个渲染树中的*所有* `<FetchDataFromApi />` 组件，而不管它们出现在哪个层级。这就是为什么它在 `global` 挂载选项中的原因。

::: tip
要桩化组件，你可以使用 `components` 中的键或组件的名称。如果在 `global.stubs` 中同时给出这两者，将优先使用键。
:::

## 桩化所有子组件

有时你可能想要桩化 _ 所有 _ 自定义组件。例如，你可能有这样的组件：

```js
const ComplexComponent = {
  components: { ComplexA, ComplexB, ComplexC },
  template: `
    <h1>Welcome to Vue.js 3</h1>
    <ComplexA />
    <ComplexB />
    <ComplexC />
  `
}
```

想象一下，每个 `<Complex>` 组件都做一些复杂的事情，而你只对测试 `<h1>` 是否渲染正确的问候语感兴趣。你可以这样做：

```js
const wrapper = mount(ComplexComponent, {
  global: {
    stubs: {
      ComplexA: true,
      ComplexB: true,
      ComplexC: true
    }
  }
})
```

但这需要很多样板代码。VTU 有一个 `shallow` 挂载选项，可以自动桩化所有子组件：

```js {3}
test('shallow stubs out all child components', () => {
  const wrapper = mount(ComplexComponent, {
    shallow: true
  })

  console.log(wrapper.html())
  /*
    <h1>Welcome to Vue.js 3</h1>
    <complex-a-stub></complex-a-stub>
    <complex-b-stub></complex-b-stub>
    <complex-c-stub></complex-c-stub>
  */
})
```

::: tip
如果你使用的是 VTU V1，你可能记得这个方法叫 `shallowMount`。这个方法仍然可用——它与写 `shallow: true` 是一样的。
:::

## 桩化所有子组件但有例外

有时你想要桩化 _ 所有 _ 自定义组件，除了特定的一个。让我们考虑一个例子：

```js
const ComplexA = {
  template: '<h2>Hello from real component!</h2>'
}

const ComplexComponent = {
  components: { ComplexA, ComplexB, ComplexC },
  template: `
    <h1>Welcome to Vue.js 3</h1>
    <ComplexA />
    <ComplexB />
    <ComplexC />
  `
}
```

通过使用 `shallow` 挂载选项，可以自动桩化所有子组件。如果我们想要明确选择不桩化特定组件，可以在 `stubs` 中提供其名称，值设置为 `false。`

```js {3}
test('shallow allows opt-out of stubbing specific component', () => {
  const wrapper = mount(ComplexComponent, {
    shallow: true,
    global: {
      stubs: { ComplexA: false }
    }
  })

  console.log(wrapper.html())
  /*
    <h1>Welcome to Vue.js 3</h1>
    <h2>Hello from real component!</h2>
    <complex-b-stub></complex-b-stub>
    <complex-c-stub></complex-c-stub>
  */
})
```

## 桩化异步组件

如果你想要桩化一个异步组件，则有两种行为。例如，你可能有这样的组件：

```js
// AsyncComponent.js
export default defineComponent({
  name: 'AsyncComponent',
  template: '<span>AsyncComponent</span>'
})

// App.js
const App = defineComponent({
  components: {
    MyComponent: defineAsyncComponent(() => import('./AsyncComponent'))
  },
  template: '<MyComponent/>'
})
```

第一种行为是使用你在组件中定义的键来加载异步组件。在这个例子中，我们使用了键 “MyComponent”。
在测试用例中不需要使用 `async/await`，因为组件在解析之前已经被桩化。

```js
test('stubs async component without resolving', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        MyComponent: true
      }
    }
  })

  expect(wrapper.html()).toBe('<my-component-stub></my-component-stub>')
})
```

第二种行为是使用异步组件的名称。在这个例子中，我们使用了名称 “AsyncComponent”。
现在需要使用 `async/await`，因为异步组件需要解析，然后才能通过在异步组件中定义的名称进行桩化。

**确保在异步组件中定义名称！**

```js
test('stubs async component with resolving', async () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        AsyncComponent: true
      }
    }
  })

  await flushPromises()

  expect(wrapper.html()).toBe('<async-component-stub></async-component-stub>')
})
```

## 桩化指令

有时指令会执行非常复杂的操作，比如进行大量的 DOM 操作，这可能导致测试中的错误 (由于 JSDOM 与整个 DOM 行为不相似)。一个常见的例子是来自各种库的工具提示指令，它们通常严重依赖于测量 DOM 节点的位置/大小。

在这个例子中，我们有另一个 `<App>`，它渲染带有工具提示的消息：

```js
// 在某处声明的工具提示指令，命名为 `Tooltip`

const App = {
  directives: {
    Tooltip
  },
  template: '<h1 v-tooltip title="Welcome tooltip">Welcome to Vue.js 3</h1>'
}
```

我们不想在这个测试中执行 `Tooltip` 指令的代码，我们只想断言消息是否被渲染。在这种情况下，我们可以使用 `stubs`，它出现在 `global` 挂载选项中，传入 `vTooltip`。

```js
test('stubs component with custom template', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        vTooltip: true
      }
    }
  })

  console.log(wrapper.html())
  // <h1>Welcome to Vue.js 3</h1>

  expect(wrapper.html()).toContain('Welcome to Vue.js 3')
})
```

::: tip
使用 `vCustomDirective` 命名方案来区分组件和指令，灵感来自于[相同方法](https://vuejs.org/api/sfc-script-setup.html#using-custom-directives)在 `<script setup>` 中的使用。
:::

有时，我们需要指令功能的一部分 (通常是因为某些代码依赖于它)。假设我们的指令在执行时添加 `with-tooltip` CSS 类，而这对我们的代码是重要的行为。在这种情况下，我们可以用我们的模拟指令实现替换 `true`。

```js
test('stubs component with custom template', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        vTooltip: {
          beforeMount(el: Element) {
            console.log('directive called')
            el.classList.add('with-tooltip')
          }
        }
      }
    }
  })

  // 'directive called' 被记录到控制台

  console.log(wrapper.html())
  // <h1 class="with-tooltip">Welcome to Vue.js 3</h1>

  expect(wrapper.classes('with-tooltip')).toBe(true)
})
```

我们刚刚用自己的实现替换了指令的实现！

::: warning
桩化指令在功能组件或 `<script setup>` 中不起作用，因为在 [withDirectives](https://vuejs.org/api/render-function.html#withdirectives) 函数中缺少指令名称。如果你需要模拟在功能组件中使用的指令，请考虑通过你的测试框架模拟指令模块。请参见 https://github.com/vuejs/core/issues/6887 以解锁此功能。
:::

## 默认插槽和 `shallow`

由于 `shallow` 会桩化组件的所有内容，因此在使用 `shallow` 时，任何 `<slot>` 都不会被渲染。虽然在大多数情况下这不是问题，但在某些场景下这并不理想。

```js
const CustomButton = {
  template: `
    <button>
      <slot />
    </button>
  `
}
```

你可能会这样使用它：

```js
const App = {
  props: ['authenticated'],
  components: { CustomButton },
  template: `
    <custom-button>
      <div v-if="authenticated">Log out</div>
      <div v-else>Log in</div>
    </custom-button>
  `
}
```

如果你使用 `shallow`，插槽将不会被渲染，因为 `<custom-button />` 中的渲染函数被桩化了。这意味着你将无法验证是否渲染了正确的文本！

对于这种用例，你可以使用 `config.renderStubDefaultSlot`，即使在使用 `shallow` 时也会渲染默认插槽内容：

```js {1,4,8}
import { config, mount } from '@vue/test-utils'

beforeAll(() => {
  config.global.renderStubDefaultSlot = true
})

afterAll(() => {
  config.global.renderStubDefaultSlot = false
})

test('shallow with stubs', () => {
  const wrapper = mount(AnotherApp, {
    props: {
      authenticated: true
    },
    shallow: true
  })

  expect(wrapper.html()).toContain('Log out')
})
```

由于此行为是全局的，而不是逐个 `mount` 的基础上，你需要记得在每个测试之前和之后启用/禁用它。

::: tip
你也可以通过在测试设置文件中导入 `config` 并将 `renderStubDefaultSlot` 设置为 `true` 来全局启用此功能。不幸的是，由于技术限制，此行为不扩展到默认插槽以外的插槽。
:::

## `mount`、`shallow` 和 `stubs`：选择哪个，何时使用？

根据经验，**你的测试越像软件的使用方式**，它们就能给你提供越多的信心。

使用 `mount` 的测试将渲染整个组件层次结构，这与用户在真实浏览器中的体验更接近。

另一方面，使用 `shallow` 的测试则专注于特定组件。`shallow` 对于在完全隔离的情况下测试高级组件非常有用。如果你只有一两个与测试无关的组件，考虑使用 `mount` 结合 `stubs` 而不是 `shallow`。你桩化得越多，测试就越不具备生产环境的特性。

请记住，无论你选择全挂载还是浅层渲染 (shallow render)，好的测试都应专注于输入 (`props` 和用户交互，如使用 `trigger`) 和输出 (渲染的 DOM 元素和事件)，而不是实现细节。

因此，无论你选择哪种挂载方法，我们建议你牢记这些指导原则。

## 结论

- 使用 `global.stubs` 将组件或指令替换为虚拟实现，以简化测试
- 使用 `shallow: true` (或 `shallowMount`) 来桩化所有子组件
- 使用 `global.renderStubDefaultSlot` 渲染桩化组件的默认 `<slot>`
