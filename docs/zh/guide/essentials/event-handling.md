# 事件处理

Vue 组件通过 props 和调用 `$emit` 触发事件来进行交互。在本指南中，我们将介绍如何使用 `emitted()` 函数来验证事件是否正确触发。

本文也有[短视频](https://www.youtube.com/watch?v=U_j-nDur4oU&list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA&index=14)可供观看。

## 计数器组件

这是一个简单的 `<Counter>` 组件。它包含一个按钮，当点击时，会增加一个内部计数变量并触发该值的事件：

```js
const Counter = {
  template: '<button @click="handleClick">Increment</button>',
  data() {
    return {
      count: 0
    }
  },
  methods: {
    handleClick() {
      this.count += 1
      this.$emit('increment', this.count)
    }
  }
}
```

为了全面测试这个组件，我们需要验证是否触发了带有最新 `count` 值的 `increment` 事件。

## 断言触发的事件

为此，我们将依赖 `emitted()` 方法。它**返回一个对象，包含组件触发的所有事件**，其参数以数组的形式呈现。让我们看看它是如何工作的：

```js
test('emits an event when clicked', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  wrapper.find('button').trigger('click')

  expect(wrapper.emitted()).toHaveProperty('increment')
})
```

> 如果你之前没有见过 `trigger()`，不要担心。它用于模拟用户交互。你可以在[测试表单](./forms)中了解更多。

首先要注意的是，`emitted()` 返回一个对象，其中每个键都匹配一个已触发的事件。在这个例子中是 `increment`。

这个测试应该通过。我们确保发出了具有适当名称的事件。

## 断言事件的参数

这很好，但我们可以做得更好！我们需要检查在调用 `this.$emit('increment', this.count)` 时是否发出了正确的参数。

我们的下一步是断言事件包含 `count` 值。我们通过将参数传递给 `emitted()` 来实现这一点。

```js {9}
test('emits an event with count when clicked', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  wrapper.find('button').trigger('click')

  // `emitted()` 接受一个参数。它返回一个包含所有 `this.$emit('increment')` 发生情况的数组。
  const incrementEvent = wrapper.emitted('increment')

  // 我们“点击”了两次，所以 `increment` 的数组应该有两个值。
  expect(incrementEvent).toHaveLength(2)

  // 断言第一次点击的结果。
  // 注意，值是一个数组。
  expect(incrementEvent[0]).toEqual([1])

  // 然后是第二次的结果。
  expect(incrementEvent[1]).toEqual([2])
})
```

让我们回顾一下并分解 `emitted()` 的输出。每个键都包含测试期间触发的不同值：

```js
// console.log(wrapper.emitted('increment'))
;[
  [1], // 第一次调用时，`count` 为 1
  [2] // 第二次调用时，`count` 为 2
]
```

## 断言复杂事件

假设我们的 `<Counter>` 组件现在需要触发一个包含附加信息的对象。例如，我们需要告诉任何监听 `@increment` 事件的父组件 `count` 是偶数还是奇数：

```js {12-15}
const Counter = {
  template: `<button @click="handleClick">Increment</button>`,
  data() {
    return {
      count: 0
    }
  },
  methods: {
    handleClick() {
      this.count += 1

      this.$emit('increment', {
        count: this.count,
        isEven: this.count % 2 === 0
      })
    }
  }
}
```

正如我们之前所做的那样，我们需要在 `<button>` 元素上触发 `click` 事件。然后，我们使用 `emitted('increment')` 来确保触发了正确的值。

```js
test('emits an event with count when clicked', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  wrapper.find('button').trigger('click')

  // 我们“点击”了两次，因此 `increment` 的数组应该有两个值。
  expect(wrapper.emitted('increment')).toHaveLength(2)

  // 然后，我们可以确保 `wrapper.emitted('increment')` 的每个元素包含一个带有预期对象的数组。
  expect(wrapper.emitted('increment')[0]).toEqual([
    {
      count: 1,
      isEven: false
    }
  ])

  expect(wrapper.emitted('increment')[1]).toEqual([
    {
      count: 2,
      isEven: true
    }
  ])
})
```

测试复杂事件负载 (如对象) 与测试简单值 (如数字或字符串) 没有区别。

## 组合 API

如果你使用的是组合 API，你将调用 `context.emit()` 而不是 `this.$emit()`。`emitted()` 可以捕获两者的事件，因此你可以使用本文中描述的相同方法来测试你的组件。

## 结论

- 使用 `emitted()` 来访问从 Vue 组件触发的事件。
- `emitted(eventName)` 返回一个数组，其中每个元素代表一个已触发的事件。
- 参数存储在 `emitted(eventName)[index]` 中，按触发顺序以数组形式呈现。
