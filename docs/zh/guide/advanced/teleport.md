# 测试 Teleport

Vue 3 引入了一个新的内置组件：`<Teleport>`，它允许组件将其内容“传送”到其 `<template>` 之外的某处。大多数使用 Vue Test Utils 编写的测试都是针对传递给 `mount` 的组件，这在测试被传送到最初渲染组件之外的组件时引入了一些复杂性。

以下是一些使用 `<Teleport>` 测试组件的策略和技术。

::: tip
如果您想测试组件的其余部分，而忽略 `teleport`，可以通过在 [全局stubs选项](../../api/#global-stubs) 中传递 `teleport: true` 来stub `teleport`。
:::

## 示例

在这个示例中，我们正在测试一个 `<Navbar>` 组件。它在 `<Teleport>` 中渲染一个 `<Signup>` 组件。`<Teleport>` 的 `target` 属性是位于 `<Navbar>` 组件之外的一个元素。

这是 `Navbar.vue` 组件：

```vue
<template>
  <Teleport to="#modal">
    <Signup />
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Signup from './Signup.vue'

export default defineComponent({
  components: {
    Signup
  }
})
</script>
```

它简单地将一个 `<Signup>` 传送到其他地方。这对于此示例的目的来说很简单。

`Signup.vue` 是一个表单，用于验证 `username` 是否大于 8 个字符。如果是，当提交时，它会发出一个 `signup` 事件，并将 `username` 作为有效载荷。测试这个将是我们的目标。

```vue
<template>
  <div>
    <form @submit.prevent="submit">
      <input v-model="username" />
    </form>
  </div>
</template>

<script>
export default {
  emits: ['signup'],
  data() {
    return {
      username: ''
    }
  },
  computed: {
    error() {
      return this.username.length < 8
    }
  },
  methods: {
    submit() {
      if (!this.error) {
        this.$emit('signup', this.username)
      }
    }
  }
}
</script>
```

## 挂载组件

从一个最小的测试开始：

```ts
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'
import Signup from './Signup.vue'

test('emits a signup event when valid', async () => {
  const wrapper = mount(Navbar)
})
```

运行此测试会给出一个警告：`[Vue warn]: Failed to locate Teleport target with selector "#modal"`。让我们创建它：

```ts {5-15}
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'
import Signup from './Signup.vue'

beforeEach(() => {
  // 创建 teleport 的目标
  const el = document.createElement('div')
  el.id = 'modal'
  document.body.appendChild(el)
})

afterEach(() => {
  // 清理
  document.body.innerHTML = ''
})

test('teleport', async () => {
  const wrapper = mount(Navbar)
})
```

我们在这个示例中使用 Jest，它不会在每个测试中重置 DOM。因此，在每个测试后使用 `afterEach` 进行清理是一个好主意。

## 与 Teleport 组件交互

接下来要做的是填写用户名输入。不幸的是，我们无法使用 `wrapper.find('input')`。为什么呢？执行 `console.log(wrapper.html())` 显示给我们以下内容：

```html
<!--teleport start-->
<!--teleport end-->
```

我们看到 Vue 用于处理 `<Teleport>` 的一些注释——但没有 `<input>`。这是因为 `<Signup>` 组件（及其 HTML）不再渲染在 `<Navbar>` 内部——它被传送到了外面。

尽管实际的 HTML 被传送到外部，但与 `<Navbar>` 相关的虚拟 DOM 仍然保持对原始组件的引用。这意味着您可以使用 `getComponent` 和 `findComponent`，它们在虚拟 DOM 上操作，而不是常规 DOM。

```ts {12}
beforeEach(() => {
  // ...
})

afterEach(() => {
  // ...
})

test('teleport', async () => {
  const wrapper = mount(Navbar)

  wrapper.getComponent(Signup) // got it!
})
```

`getComponent` 返回一个 `VueWrapper`。现在您可以使用 `get`、`find` 和 `trigger` 等方法。

让我们完成测试：

```ts {4-8}
test('teleport', async () => {
  const wrapper = mount(Navbar)

  const signup = wrapper.getComponent(Signup)
  await signup.get('input').setValue('valid_username')
  await signup.get('form').trigger('submit.prevent')

  expect(signup.emitted().signup[0]).toEqual(['valid_username'])
})
```

它通过了！

完整的测试：

```ts
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'
import Signup from './Signup.vue'

beforeEach(() => {
  // 创建 teleport 的目标
  const el = document.createElement('div')
  el.id = 'modal'
  document.body.appendChild(el)
})

afterEach(() => {
  // 清理
  document.body.innerHTML = ''
})

test('teleport', async () => {
  const wrapper = mount(Navbar)

  const signup = wrapper.getComponent(Signup)
  await signup.get('input').setValue('valid_username')
  await signup.get('form').trigger('submit.prevent')

  expect(signup.emitted().signup[0]).toEqual(['valid_username'])
})
```

您可以通过使用 `teleport: true` 来 stub teleport：

```ts
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'

test('teleport', async () => {
  const wrapper = mount(Navbar, {
    global: {
      stubs: {
        teleport: true
      }
    }
  })
})
```

## 结论

- 使用 `document.createElement` 创建一个 teleport 目标。
- 使用 `getComponent` 或 `findComponent` 查找传送的组件，这些方法在虚拟 DOM 层面上操作
