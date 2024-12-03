# 快速上手

让我们直接开始吧！通过构建一个简单的待办事项应用程序并逐步编写测试，来学习 Vue Test Utils (VTU)。本指南将涵盖以下内容：

- 挂载组件
- 查找元素
- 填写表单
- 触发事件

## 开始

我们将从一个简单的 `TodoApp` 组件开始，该组件包含一个待办事项：

```vue
<template>
  <div></div>
</template>

<script>
export default {
  name: 'TodoApp',

  data() {
    return {
      todos: [
        {
          id: 1,
          text: 'Learn Vue.js 3',
          completed: false
        }
      ]
    }
  }
}
</script>
```

## 第一个测试 - 渲染待办事项

我们将编写的第一个测试验证待办事项是否被渲染。先看测试代码，然后讨论每个部分：

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('renders a todo', () => {
  const wrapper = mount(TodoApp)

  const todo = wrapper.get('[data-test="todo"]')

  expect(todo.text()).toBe('Learn Vue.js 3')
})
```

我们首先导入 `mount`——这是在 VTU 中渲染组件的主要方式。使用 `test` 函数声明一个测试，并给出简短的描述。`test` 和 `expect` 函数在大多数测试运行器中是全局可用的 (此示例使用 [Jest](https://jestjs.io/))。如果 `test` 和 `expect` 看起来令人困惑，Jest 文档中有一个[更简单的示例](https://jestjs.io/docs/getting-started)，可以帮助你理解它们的用法和工作原理。

接下来，我们调用 `mount` 并将组件作为第一个参数传入——这是几乎每个测试都会执行的操作。根据约定，我们将结果赋值给一个名为 `wrapper` 的变量，因为 `mount` 提供了一个简单的 “包装器”，它为测试提供了一些方便的方法。

最后，我们使用另一个在许多测试运行器中常见的全局函数 - `expect`。我们的想法是，我们正在断言或*期望*实际输出与我们认为的应该匹配。在这个例子中，我们使用选择器 `data-test="todo"` 查找元素——在 DOM 中，这将看起来像 `<div data-test="todo">...</div>`。然后我们调用 `text` 方法获取内容，并期望它是 `'Learn Vue.js 3'`。

> 使用 `data-test` 选择器并不是必需的，但它可以使你的测试更加稳定。随着应用程序的增长，类和 ID 往往会变化或移动——通过使用 `data-test`，其他开发人员可以清楚地知道哪些元素在测试中被使用，并且不应更改。

## 使测试通过

如果我们现在运行这个测试，它会失败，并显示以下错误信息：`Unable to get [data-test="todo"]`。这是因为我们没有渲染任何待办事项，因此 `get()` 调用未能返回一个包装器 (记住，VTU 将所有组件和 DOM 元素包装在一个带有一些方便方法的 “包装器 (wrapper)” 中)。让我们更新 `TodoApp.vue` 中的 `<template>` 来渲染 todos 数组：

```vue
<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" data-test="todo">
      {{ todo.text }}
    </div>
  </div>
</template>
```

通过这个更改，测试通过了。恭喜你！你编写了第一个组件测试。

## 添加新的待办事项

我们将添加的下一个功能是允许用户创建新的待办事项。为此，我们需要一个包含输入框的表单，用户可以在其中输入文本。当用户提交表单时，我们期望新的待办事项被渲染。测试如下：

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('creates a todo', () => {
  const wrapper = mount(TodoApp)
  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(1)

  wrapper.get('[data-test="new-todo"]').setValue('New todo')
  wrapper.get('[data-test="form"]').trigger('submit')

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
})
```

和往常一样，我们首先使用 `mount` 渲染元素。我们还断言只有 1 个待办事项被渲染——这使得我们清楚地知道我们正在添加一个额外的待办事项，正如测试的最后一行所暗示的那样。

要更新 `<input>`，我们使用 `setValue`——这允许我们设置输入的值。

在更新 `<input>` 之后，我们使用 `trigger` 方法来模拟用户提交表单。最后，我们断言待办事项的数量从 1 增加到 2。

如果我们运行这个测试，它显然会失败。让我们更新 `TodoApp.vue` 以包含 `<form>` 和 `<input>` 元素，并使测试通过：

```vue
<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" data-test="todo">
      {{ todo.text }}
    </div>

    <form data-test="form" @submit.prevent="createTodo">
      <input data-test="new-todo" v-model="newTodo" />
    </form>
  </div>
</template>

<script>
export default {
  name: 'TodoApp',

  data() {
    return {
      newTodo: '',
      todos: [
        {
          id: 1,
          text: 'Learn Vue.js 3',
          completed: false
        }
      ]
    }
  },

  methods: {
    createTodo() {
      this.todos.push({
        id: 2,
        text: this.newTodo,
        completed: false
      })
    }
  }
}
</script>
```

我们使用 `v-model` 绑定到 `<input>`，并使用 `@submit` 监听表单提交。当表单被提交时，`createTodo` 被调用，将新的待办事项插入到 `todos` 数组中。

虽然这看起来不错，但运行测试会显示一个错误：

```
expect(received).toHaveLength(expected)

    Expected length: 2
    Received length: 1
    Received array:  [{"element": <div data-test="todo">Learn Vue.js 3</div>}]
```

待办事项的数量没有增加。问题在于 Jest 以同步方式执行测试，在最后一个函数调用后立即结束测试。然而，Vue 会异步更新 DOM。我们需要将测试标记为 `async`，并在任何可能导致 DOM 变化的方法上调用 `await`。`trigger` 和 `setValue` 都是这样的函数，我们只需在前面添加 `await`，测试就应该按预期工作：

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('creates a todo', async () => {
  const wrapper = mount(TodoApp)

  await wrapper.get('[data-test="new-todo"]').setValue('New todo')
  await wrapper.get('[data-test="form"]').trigger('submit')

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
})
```

现在测试终于通过了！

## 完成待办事项

现在我们可以创建待办事项，让我们给用户增加一个功能，允许他们通过复选框标记待办事项为完成/未完成。像之前一样，让我们从失败的测试开始：

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('completes a todo', async () => {
  const wrapper = mount(TodoApp)

  await wrapper.get('[data-test="todo-checkbox"]').setValue(true)

  expect(wrapper.get('[data-test="todo"]').classes()).toContain('completed')
})
```

这个测试与之前的两个测试类似；我们找到一个元素并以相同的方式与之交互 (我们再次使用 `setValue`，因为我们在与 `<input>` 交互)。

最后，我们进行断言。我们将为已完成的待办事项应用一个 `completed` 类——我们可以使用这个类来添加一些样式，以直观地指示待办事项的状态。

我们可以通过更新 `<template>` 来使这个测试通过，以包含 `<input type="checkbox">` 和对待办事项元素的类绑定：

```vue
<template>
  <div>
    <div
      v-for="todo in todos"
      :key="todo.id"
      data-test="todo"
      :class="[todo.completed ? 'completed' : '']"
    >
      {{ todo.text }}
      <input
        type="checkbox"
        v-model="todo.completed"
        data-test="todo-checkbox"
      />
    </div>

    <form data-test="form" @submit.prevent="createTodo">
      <input data-test="new-todo" v-model="newTodo" />
    </form>
  </div>
</template>
```

恭喜你！你编写了第一个组件测试。

## 安排、执行、断言

你可能注意到每个测试中的代码之间有一些新行。让我们再次详细查看第二个测试：

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('creates a todo', async () => {
  const wrapper = mount(TodoApp)

  await wrapper.get('[data-test="new-todo"]').setValue('New todo')
  await wrapper.get('[data-test="form"]').trigger('submit')

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
})
```

测试分为三个不同的阶段，用新行分隔。这三个阶段代表了测试的三个阶段：**安排 (Arrange)**、**执行 (Act)** 和**断言 (Assert)**。

在_安排 (Arrange)_ 阶段，我们为测试设置场景。更复杂的示例可能需要创建 Vuex 存储或填充数据库。

在_执行 (Act)_ 阶段，我们模拟用户如何与组件或应用程序交互。

在_断言 (Assert)_ 阶段，我们对组件的当前状态进行断言。

几乎所有测试都将遵循这三个阶段。你不需要像本指南那样用新行将它们分开，但在编写测试时，牢记这三个阶段是很好的。

## 结论

- 使用 `mount()` 渲染组件。
- 使用 `get()` 和 `findAll()` 查询 DOM。
- `trigger()` 和 `setValue()` 是模拟用户输入的助手。
- 更新 DOM 是一个异步操作，因此请确保使用 `async` 和 `await`。
- 测试通常由三个阶段组成：安排、执行和断言。
