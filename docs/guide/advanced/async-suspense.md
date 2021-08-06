# Asynchronous Behavior

You may have noticed some other parts of the guide using `await` when calling some methods on `wrapper`, such as `trigger` and `setValue`. What's that all about?

You might know Vue updates reactively: when you change a value, the DOM is automatically updated to reflect the latest value. [Vue does these updates asynchronously](https://v3.vuejs.org/guide/change-detection.html#async-update-queue). In contrast, a test runner like Jest runs _synchronously_. This can cause some surprising results in tests.

Let's look at some strategies to ensure Vue is updating the DOM as expected when we run our tests.

## A Simple Example - Updating with `trigger`

Let's re-use the `<Counter>` component from [event handling](../essentials/event-handling) with one change; we now render the `count` in the `template`.

```js
const Counter = {
  template: `
    <p>Count: {{ count }}</p>
    <button @click="handleClick">Increment</button>
  `,
  data() {
    return {
      count: 0
    }
  },
  methods: {
    handleClick() {
      this.count += 1
    }
  }
}
```

Let's write a test to verify the `count` is increasing:

```js
test('increments by 1', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')

  expect(wrapper.html()).toContain('Count: 1')
})
```

Surprisingly, this fails! The reason is although `count` is increased, Vue will not update the DOM until the next event loop tick. For this reason, the assertion (`expect()...`) will be called before Vue updates the DOM.

:::tip
If you want to learn more about this core JavaScript behavior, read about the [Event Loop and its macrotasks and microtasks](https://javascript.info/event-loop#macrotasks-and-microtasks).
:::

Implementation details aside, how can we fix this? Vue actually provides a way for us to wait until the DOM is updated: `nextTick`.

```js {1,7}
import { nextTick } from 'vue'

test('increments by 1', async () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  await nextTick()

  expect(wrapper.html()).toContain('Count: 1')
})
```

Now the test will pass because we ensure the next "tick" has been executed and the DOM has been updated before the assertion runs.

Since `await nextTick()` is common, Vue Test Utils provides a shortcut. Methods that cause the DOM to update, such as `trigger` and `setValue` return `nextTick`, so you can just `await` those directly:

```js {4}
test('increments by 1', async () => {
  const wrapper = mount(Counter)

  await wrapper.find('button').trigger('click')

  expect(wrapper.html()).toContain('Count: 1')
})
```

## Resolving Other Asynchronous Behavior

`nextTick` is useful to ensure some change in reactive data is reflected in the DOM before continuing the test. However, sometimes you may want to ensure other, non Vue-related asynchronous behavior is completed, too.

A common example is a function that returns a `Promise`. Perhaps you mocked your `axios` HTTP client using `jest.mock`:

```js
jest.mock('axios', () => ({
  get: () => Promise.resolve({ data: 'some mocked data!' })
}))
```

In this case, Vue has no knowledge of the unresolved Promise, so calling `nextTick` will not work - your assertion may run before it is resolved. For scenarios like this, Vue Test Utils exposes [`flushPromises`](../../api/#flushPromises), which causes all outstanding promises to resolve immediately.

Let's see an example:

```js{1,12}
import { flushPromises } from '@vue/test-utils'
import axios from 'axios'

jest.mock('axios', () => ({
  get: () => Promise.resolve({ data: 'some mocked data!' })
}))

test('uses a mocked axios HTTP client and flushPromises', async () => {
  // some component that makes a HTTP called in `created` using `axios`
  const wrapper = mount(AxiosComponent)

  await flushPromises() // axios promise is resolved immediately

  // after the line above, axios request has resolved with the mocked data.
})
```

:::tip
If you want to learn more about testing requests on Components, make sure you check [Making HTTP Requests](http-requests.md) guide.
:::

## Conclusion

- Vue updates the DOM asynchronously; tests runner executes code synchronously instead.
- Use `await nextTick()` to ensure the DOM has updated before the test continues.
- Functions that might update the DOM (like `trigger` and `setValue`) return `nextTick`, so you need to `await` them.
- Use `flushPromises` from Vue Test Utils to resolve any unresolved promises from non-Vue dependencies (such as API requests).
