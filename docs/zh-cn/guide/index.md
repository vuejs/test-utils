# 入门指南

欢迎使用 Vue Test Utils，这是 Vue.js 官方的测试工具库！

这是一份针对 Vue3 的 Vue Test Utils v2 的文档。

简单来说：

- [Vue Test Utils 1](https://github.com/vuejs/vue-test-utils/) 适用于 [Vue 2](https://github.com/vuejs/vue/).
- [Vue Test Utils 2](https://github.com/vuejs/test-utils/) 适用于 [Vue 3](https://github.com/vuejs/vue-next/).

## 什么是 Vue Test Utils？

Vue Test Utils (VTU) 是一套致力于简化 Vue.js 组件测试的工具函数集。它提供了一些方法，以隔离的方式挂载 Vue 组件并与之交互。

我们看这一个示例：

```js
import { mount } from '@vue/test-utils'

// 需要测试的组件
const MessageComponent = {
  template: '<p>{{ msg }}</p>',
  props: ['msg']
}

test('displays message', () => {
  const wrapper = mount(MessageComponent, {
    props: {
      msg: 'Hello world'
    }
  })

  // 断言组件渲染出来的文字
  expect(wrapper.text()).toContain('Hello world')
})
```

Vue Test Utils 通常与一个测试工具配合使用。流行的测试工具有如下：

- [Vitest](https://vitest.dev/). 基于终端，且有一个实验性的浏览器 UI。
- [Cypress](https://cypress.io/). 基于浏览器，其支持 Vite, webpack。
- [Playwright](https://playwright.dev/docs/test-components) (实验性)。基于浏览器, 支持 Vite。

Vue Test Utils 是一个轻量级且无主见的库。对于功能更丰富，更符合人体工学已经更有主见的 For something more featureful, ergonomic and opinionated you may want to consider [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/overview) which has a hot reload development environment, or [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/) which emphasizes accessability based selectors when making assertions. Both of these tools use Vue Test Utils under the hood and expose the same API.

## 下一步？

要了解 Vue Test Utils 实战， [请看快速课程](../guide/essentials/a-crash-course.md)，我们使用测试优先的方法构建一个简单的 Todo 应用程序。

文档分为两个主要部分：

- **要点**, 包含了你在测试 Vue 组件时将要面对的常见用例。
- **深入 Vue Test Utils**, 探索该库其他高级功能。

你也可以浏览完整的 [API](../api/)。

或者，如果您更喜欢通过视频学习，这里有 [很多课程](https://www.youtube.com/playlist?list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA)。
