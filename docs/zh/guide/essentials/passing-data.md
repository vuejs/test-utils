# 传递数据到组件

Vue Test Utils 提供了几种方法来设置组件的数据和属性，以便您可以在不同场景下充分测试组件的行为。

在本节中，我们将探讨 `data` 和 `props` 的挂载选项，以及 `VueWrapper.setProps()`，以动态更新组件接收的属性。

## 密码组件

我们将通过构建一个 `<Password>` 组件来演示上述功能。该组件验证密码是否符合某些标准，例如长度和复杂性。我们将从以下代码开始，并添加功能以及测试以确保这些功能正常工作：

```js
const Password = {
  template: `
    <div>
      <input v-model="password">
    </div>
  `,
  data() {
    return {
      password: ''
    }
  }
}
```

我们将添加的第一个要求是最小长度。

## 使用 `props` 设置最小长度

我们希望在所有项目中重用此组件，而每个项目可能有不同的要求。因此，我们将把 `minLength` 作为一个 **prop** 传递给 `<Password>` 组件：

如果 `password` 的长度小于 `minLength`，我们将显示一个错误。我们可以通过创建一个 `error` 计算属性，并使用 `v-if` 有条件地渲染它来实现：

```js
const Password = {
  template: `
    <div>
      <input v-model="password">
      <div v-if="error">{{ error }}</div>
    </div>
  `,
  props: {
    minLength: {
      type: Number
    }
  },
  data() {
    return {
      password: ''
    }
  },
  computed: {
    error() {
      if (this.password.length < this.minLength) {
        return `密码必须至少包含 ${this.minLength} 个字符.`
      }
      return
    }
  }
}
```

为了测试这一点，我们需要设置 `minLength` 以及一个小于该数字的 `password`。我们可以使用 `data` 和 `props` 的挂载选项来实现。最后，我们将断言错误消息是否被渲染：

```js
test('renders an error if length is too short', () => {
  const wrapper = mount(Password, {
    props: {
      minLength: 10
    },
    data() {
      return {
        password: 'short'
      }
    }
  })

  expect(wrapper.html()).toContain('密码必须至少包含 10 个字符')
})
```

编写 `maxLength` 规则的测试留给读者作为练习！另一种实现方式是使用 `setValue` 更新输入为过短的密码。您可以在[测试表单](./forms)部分了解更多信息。

## 使用 `setProps`

有时您可能需要编写测试来验证属性更改的副作用。这个简单的 `<Show>` 组件在 `show` 属性为 `true` 时渲染一个问候语。

```vue
<template>
  <div v-if="show">{{ greeting }}</div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      greeting: 'Hello'
    }
  }
}
</script>
```

为了全面测试这一点，我们可能想要验证 `greeting` 是否默认渲染。我们可以使用 `setProps()` 更新 `show` 属性，这将导致 `greeting` 被隐藏：

```js
import { mount } from '@vue/test-utils'
import Show from './Show.vue'

test('renders a greeting when show is true', async () => {
  const wrapper = mount(Show)
  expect(wrapper.html()).toContain('Hello')

  await wrapper.setProps({ show: false })

  expect(wrapper.html()).not.toContain('Hello')
})
```

我们在调用 `setProps()` 时也使用了 `await` 关键字，以确保在断言运行之前 DOM 已被更新。

## 结论

- 使用 `props` 和 `data` 的挂载选项预设组件的状态。
- 使用 `setProps()` 在测试期间更新属性。
- 在 `setProps()` 前使用 await 关键字，以确保 Vue 在测试继续之前会更新 DOM。
- 直接与组件交互可以提供更大的覆盖率。考虑结合使用 `setValue` 或 `trigger` 以及 `data` 来确保一切正常工作。
