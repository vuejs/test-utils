# 编写易于测试的组件

Vue Test Utils 帮助你为 Vue 组件编写测试。然而，VTU 的功能是有限的。

以下是一些建议，旨在帮助你编写更易于测试的代码，以及编写有意义且易于维护的测试。

以下列表提供了通用指导，可能在常见场景中派上用场。

## 不要测试实现细节

从用户的角度考虑输入和输出。以下大致是在为 Vue 组件编写测试时应当考虑的所有内容：

| **输入** | 示例                                |
| -------- | ----------------------------------- |
| 交互     | 点击、输入……及任何“人类”交互          |
| Props    | 组件接收的参数                      |
| 数据流   | 从 API 调用、数据订阅等中传入的数据 |

| **输出** | 示例                         |
| -------- | ---------------------------- |
| DOM 元素 | 渲染到文档中的任何可观察节点 |
| 事件     | 触发的事件（使用 `$emit`）   |
| 副作用   | 如 `console.log` 或 API 调用 |

**其他一切都是实现细节**。

注意，这个列表不包含内部方法、中间状态或甚至数据等元素。

经验法则是**测试在重构时不应失败**，也就是说，当我们更改其内部实现而不改变其行为时，测试不应失败。如果发生这种情况，则测试可能依赖于实现细节。

例如，假设有一个简单的计数器组件，包含一个增加计数的按钮：

```vue
<!-- Counter.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
</script>

<template>
  <p class="paragraph">Times clicked: {{ count }}</p>
  <button @click="increment">Increment</button>
</template>
```

我们可以编写以下测试：

```js
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

test('counter text updates', async () => {
  const wrapper = mount(Counter)
  const paragraph = wrapper.find('.paragraph')

  expect(paragraph.text()).toBe('Times clicked: 0')

  await wrapper.setData({ count: 2 })

  expect(paragraph.text()).toBe('Times clicked: 2')
})
```

注意这里我们在更新其内部数据，并且也依赖于用户视角的细节，如 CSS 类。

:::tip
注意，更改数据或 CSS 类名都会导致测试失败。然而，组件仍然可以按预期工作。这种情况称为**误报 (false positive)**。
:::

相反，以下测试尽量使用前文提到的输入和输出：

```js
import { mount } from '@vue/test-utils'

test('text updates on clicking', async () => {
  const wrapper = mount(Counter)

  expect(wrapper.text()).toContain('Times clicked: 0')

  const button = wrapper.find('button')
  await button.trigger('click')
  await button.trigger('click')

  expect(wrapper.text()).toContain('Times clicked: 2')
})
```

像 [Vue Testing Library](https://github.com/testing-library/vue-testing-library/) 这样的库就是基于这些原则构建的。如果你对这种方法感兴趣，一定要看看。

## 构建更小、更简单的组件

根据经验，一个组件的功能越少，它就越容易测试。

构建更小的组件将使它们更易于组合和理解。以下是一些让组件更简单的建议。

### 提取 API 调用

你通常会在应用中执行一些 HTTP 请求。从测试的角度来看，HTTP 请求为组件提供输入，组件也可以发送 HTTP 请求。

:::tip
如果你不熟悉测试 API 调用，请查看[发起 HTTP 请求](../advanced/http-requests.md)指南。
:::

### 提取复杂方法

有时，一个组件可能包含复杂的方法、密集的计算或使用多个依赖项。

这里的建议是**提取该方法并将其导入组件**。这样，你可以使用 Jest 或其他测试运行器独立测试该方法。

这样做还有一个好处，就是组件最终会更易于理解，因为复杂的逻辑被封装在另一个文件中。

此外，如果这个复杂方法难以调试或速度较慢，你可能希望对其进行模拟，以使测试更简单和更快速。[发起 HTTP 请求](../advanced/http-requests.md)中的示例就是一个很好的例子——axios 是一个很复杂的库！

## 在编写组件之前编写测试

如果你提前编写测试，就不会写出不可测试的代码！

我们的[快速上手](../essentials/a-crash-course.md)提供了一个示例，说明如何在编写代码之前编写测试，从而使组件可以测试。这也帮助你发现和测试边缘情况。
