# Asynchronous Behavior

You may have noticed some other parts of the guide using `await` when calling some methods on `wrapper`, such as `trigger` and `setValue`. What's that all about?

You might know Vue updates reactively; when you change a value, the DOM is automatically updated to reflect the latest value. Vue does this _asynchronously_. In contrast, a test runner like Jest runs _synchronously_. This can cause some surprising results in tests. Let's look at some strategies to ensure Vue is updating the DOM as expected when we run our tests.

## A Simple Example - Updating with `trigger`

Let's re-use the `<Counter>` component from [event handling](../essentials/event-handling) with one change; we now render the `count` in the `template`.

```js
const Counter = {
  template: `
    Count: {{ count }}
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

Surprisingly, this fails! The reason is although `count` is increased, Vue will not update the DOM until the next "tick" or "render cycle". For this reason, the assertion will be called before Vue updates the DOM. This has to do with the concept of "macrotasks", "microtasks" and the JavaScript Event Loop. You can read more details and see a simple example [here](https://javascript.info/event-loop#macrotasks-and-microtasks).

Implementation details aside, how can we fix this? Vue actually provides a way for us to wait until the DOM is updated: `nextTick`:

```js {7}
import { nextTick } from 'vue'

test('increments by 1', async () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  await nextTick()

  expect(wrapper.html()).toContain('Count: 1')
})
```

Now the test will pass, because we ensure the next "tick" has executed updated the DOM before the assertion runs. Since `await nextTick()` is common, VTU provides a shortcut. Methods than cause the DOM to update, such as `trigger` and `setValue` return `nextTick`! So you can just `await` those directly:

```js {4}
test('increments by 1', async () => {
  const wrapper = mount(Counter)

  await wrapper.find('button').trigger('click')

  expect(wrapper.html()).toContain('Count: 1')
})
```

## Resolving Other Asynchronous Behavior

`nextTick` is useful to ensure some change in reactivty data is reflected in the DOM before continuing the test. However, sometimes you may want to ensure other, non Vue-related asynchronous behavior is completed, too. A common example is a function that returns a `Promise` that will lead to a change in the DOM. Perhaps you mocked your `axios` HTTP client using `jest.mock`:

```js
jest.mock('axios', () => ({
  get: () => Promise.resolve({ data: 'some mocked data!' })
}))
```

In this case, Vue has no knowledge of the unresolved Promise, so calling `nextTick` will not work - your assertion may run before it is resolved. For scenarios like this, you can use `[flush-promises](https://www.npmjs.com/package/flush-promises)`, which causes all outstanding promises to resolve immediately.

Let's see an example:

```js
import flushPromises from 'flush-promises'
import axios from 'axios'

jest.mock('axios', () => ({
  get: () =>
    new Promise((resolve) => {
      resolve({ data: 'some mocked data!' })
    })
}))

test('uses a mocked axios HTTP client and flush-promises', async () => {
  // some component that makes a HTTP called in `created` using `axios`
  const wrapper = mount(AxiosComponent)

  await flushPromises() // axios promise is resolved immediately!

  // assertions!
})
```

> If you haven't tested Components with API requests before, you can learn more in [HTTP Requests](./http-requests).

## Conclusion

- Vue updates the DOM asynchronously; tests runner execute code synchronously.
- Use `await nextTick()` to ensure the DOM has updated before the test continues
- Functions that might update the DOM, like `trigger` and `setValue` return `nextTick`, so you should `await` them.
- Use `flush-promises` to resolve any unresolved promises from non-Vue dependencies.
