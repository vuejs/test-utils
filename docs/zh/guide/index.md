# 开始

欢迎使用 Vue Test Utils，这是 Vue.js 的官方测试工具库！

这是 Vue Test Utils v2 的文档，适用于 Vue 3。

简而言之：

- [Vue Test Utils 1](https://github.com/vuejs/vue-test-utils/) 适用于 [Vue 2](https://github.com/vuejs/vue/)。
- [Vue Test Utils 2](https://github.com/vuejs/test-utils/) 使用于 [Vue 3](https://github.com/vuejs/core/)。

## 什么是 Vue Test Utils？

Vue Test Utils (VTU) 是一组实用函数，旨在简化 Vue.js 的组件测试。它提供了一些方法来独立地挂载 Vue 组件并与 Vue 组件进行交互。

让我们看一个例子：

```js
import { mount } from '@vue/test-utils'

// 要测试的组件
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

  // 断言组件渲染出的文本
  expect(wrapper.text()).toContain('Hello world')
})
```

Vue Test Utils 通常需要和一个测试运行器配合使用。流行的测试运行器包括：

- [Vitest](https://vitest.dev/)。基于终端，具有实验性的浏览器 UI。
- [Cypress](https://cypress.io/)。基于浏览器，支持 Vite、webpack。
- [Playwright](https://playwright.dev/docs/test-components) (实验性) 基于浏览器，支持 Vite。
- [WebdriverIO](https://webdriver.io/docs/component-testing/vue)。基于浏览器，支持 Vite、Webpack，跨浏览器支持。

Vue Test Utils 是最小化且不含偏见的库。如果你想要功能更丰富、更易用且偏好更鲜明的工具，获取可以考虑具有热重载开发环境的 [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/overview)、或者在断言时强调基于可访问性选择器的 [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)。这两种工具在底层都使用 Vue Test Utils 并暴露相同的 API。

## 接下来做什么？

要查看 Vue Test Utils 的实际运用，请[查阅快速上手](../guide/essentials/a-crash-course.md)，在那里，我们使用测试优先的思路构建了一个简单的待办事项应用。

我们的文档分为两个主要部分：

- **基础知识**，涵盖你在测试 Vue 组件时可能遇到的常见用例。
- **深入学习 Vue Test Utils**，探索库的其他高级功能。

你还可以探索完整的 [API](../api/)。

或者，如果你更喜欢通过视频学习，这里有[一系列讲座可供观看](https://www.youtube.com/playlist?list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA)。
