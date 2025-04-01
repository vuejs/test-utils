# Write components that are easy to test

Vue Test Utils helps you write tests for Vue components. However, there's only so much VTU can do.

Following is a list of suggestions to write code that is easier to test, and to write tests that are meaningful and simple to maintain.

The following list provide general guidance and it might come in handy in common scenarios.

## Do not test implementation details

Think in terms of inputs and outputs from a user perspective. Roughly, this is everything you should take into account when writing a test for a Vue component:

| **Inputs**   | Examples                                          |
| ------------ | ------------------------------------------------- |
| Interactions | Clicking, typing... any "human" interaction       |
| Props        | The arguments a component receives                |
| Data streams | Data incoming from API calls, data subscriptions… |

| **Outputs**  | Examples                                       |
| ------------ | ---------------------------------------------- |
| DOM elements | Any _observable_ node rendered to the document |
| Events       | Emitted events (using `$emit`)                 |
| Side Effects | Such as `console.log` or API calls             |

**Everything else is implementation details**.

Notice how this list does not include elements such as internal methods, intermediate states or even data.

The rule of thumb is that **a test should not break on a refactor**, that is, when we change its internal implementation without changing its behavior. If that happens, the test might rely on implementation details.

For example, let's assume a basic Counter component that features a button to increment a counter:

```vue
<!-- Counter.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
</script>

<template>
  <p class="paragraph">Times clicked: {{ count }}</p>
  <button @click="increment">increment</button>
</template>
```

We could write the following test:

```js
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

test('counter text updates', async () => {
  const wrapper = mount(Counter)
  const paragraph = wrapper.find('.paragraph')

  expect(paragraph.text()).toBe('Times clicked: 0')

  await wrapper.setData({ count: 2 })

  expect(paragraph.text()).toBe('Times clicked: 2')
})
```

Notice how here we're updating its internal data, and we also rely on details (from a user perspective) such as CSS classes.

:::tip
Notice that changing either the data or the CSS class name would make the test fail. The component would still work as expected, though. This is known as a **false positive**.
:::

Instead, the following test tries to stick with the inputs and outputs listed above:

```js
import { mount } from '@vue/test-utils'

test('text updates on clicking', async () => {
  const wrapper = mount(Counter)

  expect(wrapper.text()).toContain('Times clicked: 0')

  const button = wrapper.find('button')
  await button.trigger('click')
  await button.trigger('click')

  expect(wrapper.text()).toContain('Times clicked: 2')
})
```

Libraries such as [Vue Testing Library](https://github.com/testing-library/vue-testing-library/) are build upon these principles. If you are interested in this approach, make sure you check it out.

## Build smaller, simpler components

A general rule of thumb is that if a component does less, then it will be easier to test.

Making smaller components will make them more composable and easier to understand. Following is a list of suggestions to make components simpler.

### Extract API calls

Usually, you will perform several HTTP requests throughout your application. From a testing perspective, HTTP requests provide inputs to the component, and a component can also send HTTP requests.

:::tip
Check out the [Making HTTP requests](../advanced/http-requests.md) guide if you are unfamiliar with testing API calls.
:::

### Extract complex methods

Sometimes a component might feature a complex method, perform heavy calculations, or use several dependencies.

The suggestion here is to **extract this method and import it to the component**. This way, you can test the method in isolation using Jest or any other test runner.

This has the additional benefit of ending up with a component that's easier to understand because complex logic is encapsulated in another file.

Also, if the complex method is hard to set up or slow, you might want to mock it to make the test simpler and faster. Examples on [making HTTP requests](../advanced/http-requests.md) is a good example – axios is quite a complex library!

## Write tests before writing the component

You can't write untestable code if you write tests beforehand!

Our [Crash Course](../essentials/a-crash-course.md) offers an example of how writing tests before code leads to testable components. It also helps you detect and test edge cases.
