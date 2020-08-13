## Vue Test Utils Documentation

Welcome to Vue Test Utils, the official testing utility library for Vue.js!

<!-- content to be removed when we merge VTU repos -->
This is the documentation for Vue Test Utils v2, which targets Vue 3.

In short:
* [Vue Test Utils 1](https://github.com/vuejs/vue-test-utils/) targets [Vue 2](https://github.com/vuejs/vue/).
* [Vue Test Utils 2](https://github.com/vuejs/vue-test-utils-next/) targets [Vue 3](https://github.com/vuejs/vue-next/).

## What is Vue Test Utils?

Vue Test Utils (VTU) is a set of utility functions aimed to simplify testing Vue.js components. It provides some methods to mount and interact with Vue components in an isolated manner.

Let's see an example:

```js
import { mount } from '@vue/test-utils'

// The component to test
const MessageComponent = {
  template: '<p>{{ msg }}</p>',
  props: ['msg'],
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

To see Vue Test Utils in action, [take the Crash Course](/guide/a-crash-course/), where we build a simple Todo app using a test-first approach.

Docs are split into two main sections:

* **Essentials**, to cover common uses cases you'll face when testing Vue components.
* **Vue Test Utils in Depth**, to explore other advanced features of the library.

Alternatively, you can explore the full [API](/api/).
