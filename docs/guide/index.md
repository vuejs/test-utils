# Getting Started

Welcome to Vue Test Utils, the official testing utility library for Vue.js!

This is the documentation for Vue Test Utils v2, which targets Vue 3.

In short:

- [Vue Test Utils 1](https://github.com/vuejs/vue-test-utils/) targets [Vue 2](https://github.com/vuejs/vue/).
- [Vue Test Utils 2](https://github.com/vuejs/test-utils/) targets [Vue 3](https://github.com/vuejs/vue-next/).

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

## What Next?

To see Vue Test Utils in action, [take the Crash Course](../guide/essentials/a-crash-course.md), where we build a simple Todo app using a test-first approach.

Docs are split into two main sections:

- **Essentials**, to cover common use cases you'll face when testing Vue components.
- **Vue Test Utils in Depth**, to explore other advanced features of the library.

You can also explore the full [API](../api/).

Alternatively, if you prefer to learn via video, there is [a number of lectures available here](https://www.youtube.com/playlist?list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA).
