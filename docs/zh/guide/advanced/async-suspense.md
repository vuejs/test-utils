# 异步行为

你可能注意到在指南的某些部分，在调用 `wrapper` 的一些方法时使用了 `await`，例如 `trigger` 和 `setValue`。这是什么意思呢？

你可能知道 [Vue 是以响应式的方式更新的](https://v3.vuejs.org/guide/change-detection.html#async-update-queue)：当你更改一个值时，DOM 会自动更新以反映最新的值。Vue 的这些更新是异步进行的。与此相对，像 Jest 这样的测试运行器是 _同步_ 的。这可能会导致测试中出现一些意外的结果。

让我们看看一些策略，以确保在运行测试时 Vue 按预期更新 DOM。

## 简单示例 - 使用 `trigger` 更新

让我们重用来自[事件处理](../essentials/event-handling)的 `<Counter>` 组件，唯一的变化是我们现在在 `template` 中渲染 `count`。

```js
const Counter = {
  template: `
    <p>Count: {{ count }}</p>
    <button @click="handleClick">Increment</button>
  `,
  data() {
    return {
      count: 0
    }
  },
  methods: {
    handleClick() {
      this.count += 1
    }
  }
}
```

让我们写一个测试来验证 `count` 是否在增加：

```js
test('increments by 1', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')

  expect(wrapper.html()).toContain('Count: 1')
})
```

出乎意料的是，这个测试失败了！原因是虽然 `count` 增加了，但 Vue 不会在下一个事件循环的 tick 之前更新 DOM。因此，断言 (`expect()...`) 会在 Vue 更新 DOM 之前被调用。

:::tip
如果你想了解更多关于这个核心 JavaScript 行为的信息，可以阅读[事件循环及其宏任务和微任务](https://javascript.info/event-loop#macrotasks-and-microtasks)。
:::

抛开实现细节，我们该如何修复这个问题呢？实际上，Vue 提供了一种方法让我们等待 DOM 更新：`nextTick`。

```js {1,7}
import { nextTick } from 'vue'

test('increments by 1', async () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  await nextTick()

  expect(wrapper.html()).toContain('Count: 1')
})
```

现在测试将通过，因为我们确保在断言运行之前，下一个 "tick" 已经执行并且 DOM 已经更新。

由于 `await nextTick()` 是常见的，Vue Test Utils 提供了一个快捷方式。导致 DOM 更新的方法，如 `trigger` 和 `setValue` 返回 `nextTick`，因此你可以直接 `await` 它们：

```js {4}
test('increments by 1', async () => {
  const wrapper = mount(Counter)

  await wrapper.find('button').trigger('click')

  expect(wrapper.html()).toContain('Count: 1')
})
```

## 解决其他异步行为

`nextTick` 用于确保某个响应式数据的变化在继续测试之前反映在 DOM 中。然而，有时你可能还想确保其他与 Vue 无关的异步行为也已完成。

一个常见的例子是返回 `Promise` 的函数。也许你使用 `jest.mock` 模拟了你的 `axios` HTTP 客户端：

```js
jest.spyOn(axios, 'get').mockResolvedValue({ data: 'some mocked data!' })
```

在这种情况下，Vue 对未解决的 Promise 没有任何了解，因此调用 `nextTick` 将不起作用——你的断言可能在 Promise 被解决之前就运行了。对于这种情况，Vue Test Utils 提供了 [`flushPromises`](../../api/#flushPromises) 它可以立即解决所有未完成的 Promise。

让我们看一个例子：

```js{1,12}
import { flushPromises } from '@vue/test-utils'
import axios from 'axios'

jest.spyOn(axios, 'get').mockResolvedValue({ data: 'some mocked data!' })

test('uses a mocked axios HTTP client and flushPromises', async () => {
  // 某个在 `created` 中使用 `axios` 进行 HTTP 调用的组件
  const wrapper = mount(AxiosComponent)

  await flushPromises() // axios 的 Promise 被立即解决

  // 在上面的代码执行后，axios 请求已使用模拟数据解决。
})
```

:::tip
如果你想了解更多关于在组件上测试请求的信息，请确保查看[发起 HTTP 请求](http-requests.md) 指南。
:::

## 测试异步 `setup`

如果你要测试的组件使用了异步 `setup`，那么你必须在 `Suspense` 组件内挂载该组件（就像在应用程序中使用时一样）。

例如，这个 `Async` 组件：

```js
const Async = defineComponent({
  async setup() {
    // 等待某些内容
  }
})
```

必须这样测试：

```js
test('Async component', async () => {
  const TestComponent = defineComponent({
    components: { Async },
    template: '<Suspense><Async/></Suspense>'
  })

  const wrapper = mount(TestComponent)
  await flushPromises()
  // ...
})
```

注意：要访问你的 `Async` 组件的底层 `vm` 实例，请使用 `wrapper.findComponent(Async)` 的返回值。由于在这种情况下定义并挂载了一个新组件，因此 `mount(TestComponent)` 返回的 wrapper 包含它自己的（空的）`vm`。

## 结论

- Vue 以异步方式更新 DOM；测试运行器以同步方式执行代码。
- 使用 `await nextTick()` 确保在测试继续之前 DOM 已更新。
- 可能更新 DOM 的函数（如 `trigger` 和 `setValue`）返回 `nextTick`，因此你需要 `await` 它们。
- 使用 Vue Test Utils 的 `flushPromises` 来解决来自非 Vue 依赖（如 API 请求）的任何未解决的 Promise。
- 使用 `Suspense` 在异步测试函数中测试具有异步 `setup` 的组件。
