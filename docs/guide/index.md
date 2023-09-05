# Getting Started

Welcome to Vue Test Utils, the official testing utility library for Vue.js!

This is the documentation for Vue Test Utils v2, which targets Vue 3.

In short:

- [Vue Test Utils 1](https://github.com/vuejs/vue-test-utils/) targets [Vue 2](https://github.com/vuejs/vue/).
- [Vue Test Utils 2](https://github.com/vuejs/test-utils/) targets [Vue 3](https://github.com/vuejs/core/).

## What is Vue Test Utils?

Vue Test Utils (VTU) is a set of utility functions aimed to simplify testing Vue.js components. It provides some methods to mount and interact with Vue components in an isolated manner.

Let's see an example:

```js
import { mount } from '@vue/test-utils'

// The component to test
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

  // Assert the rendered text of the component
  expect(wrapper.text()).toContain('Hello world')
})
```

Vue Test Utils is commonly used with a test runner. Popular test runners include:

- [Vitest](https://vitest.dev/). Terminal based, has experimental browser UI.
- [Cypress](https://cypress.io/). Browser based, supports Vite, webpack.
- [Playwright](https://playwright.dev/docs/test-components) (experimental). Browser based, supports Vite.

Vue Test Utils is a minimal and unopinionated library. For something more featureful, ergonomic and opinionated you may want to consider [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/overview) which has a hot reload development environment, or [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/) which emphasizes accessibility based selectors when making assertions. Both of these tools use Vue Test Utils under the hood and expose the same API.

## What Next?

To see Vue Test Utils in action, [take the Crash Course](../guide/essentials/a-crash-course.md), where we build a simple Todo app using a test-first approach.

Docs are split into two main sections:

- **Essentials**, to cover common use cases you'll face when testing Vue components.
- **Vue Test Utils in Depth**, to explore other advanced features of the library.

You can also explore the full [API](../api/).

Alternatively, if you prefer to learn via video, there is [a number of lectures available here](https://www.youtube.com/playlist?list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA).
