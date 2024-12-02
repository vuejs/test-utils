# 开始

欢迎使用 Vue Test Utils，这是 Vue.js 的官方测试工具库！

这是 Vue Test Utils v2 的文档，适用于 Vue 3。

简而言之：

- [Vue Test Utils 1](https://github.com/vuejs/vue-test-utils/) 适用于 [Vue 2](https://github.com/vuejs/vue/)。
- [Vue Test Utils 2](https://github.com/vuejs/test-utils/) 使用于 [Vue 3](https://github.com/vuejs/core/)。

## 什么是 Vue Test Utils？

Vue Test Utils (VTU) 是一组实用函数，旨在简化对 Vue.js 组件的测试。它提供了一些方法来以独立的方式挂载和与 Vue 组件进行交互。

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

  // 断言组件的渲染文本
  expect(wrapper.text()).toContain('Hello world')
})
```

Vue Test Utils 通常与测试运行器一起使用。流行的测试运行器包括：

- [Vitest](https://vitest.dev/)。基于终端，具有实验性的浏览器 UI。
- [Cypress](https://cypress.io/)。基于浏览器，支持 Vite、webpack。
- [Playwright](https://playwright.dev/docs/test-components) (实验性) 基于浏览器，支持 Vite。
- [WebdriverIO](https://webdriver.io/docs/component-testing/vue)。基于浏览器，支持 Vite、Webpack，跨浏览器支持。

Vue Test Utils 是一个简单且不拘泥于特定风格的库的库。如果您希望使用更具功能性、易用性和明确意见的工具，可以考虑 [Cypress 组件测试](https://docs.cypress.io/guides/component-testing/overview)，它具有热重载开发环境，或者 [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)，它在进行断言时强调可访问性选择器 (Accessibility)。这两种工具在底层都使用 Vue Test Utils，并暴露相同的 API。

## 接下来做什么？

要查看 Vue Test Utils 的实际应用，请[查阅快速上手](../guide/essentials/a-crash-course.md)，我们将使用测试优先的方法构建一个简单的待办事项应用。

文档分为两个主要部分：

- **基础知识**，涵盖您在测试 Vue 组件时可能遇到的常见用例。
- **深入学习 Vue Test Utils**，探索库的其他高级功能。

您还可以探索完整的 [API](../api/)。

或者，如果您更喜欢通过视频学习，这里有[一系列讲座可供观看](https://www.youtube.com/playlist?list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA)。
