# Testing Server-side Rendering

Vue Test Utils provides `renderToString` to test Vue applications that use server-side rendering (SSR).
This guide will walk you through the process of testing a Vue application that uses SSR.

## `renderToString`

`renderToString` is a function that renders a Vue component to a string.
It is an asynchronous function that returns a Promise,
and accepts the same parameters as `mount` or `shallowMount`.

Let's consider a simple component that uses the `onServerPrefetch` hook:

```ts
function fakeFetch(text: string) {
  return Promise.resolve(text)
}

const Component = defineComponent({
  template: '<div>{{ text }}</div>',
  setup() {
    const text = ref<string | null>(null)

    onServerPrefetch(async () => {
      text.value = await fakeFetch('onServerPrefetch')
    })

    return { text }
  }
})
```

You can write a test for this component using `renderToString`:

```ts
import { renderToString } from '@vue/test-utils'

it('renders the value returned by onServerPrefetch', async () => {
  const contents = await renderToString(Component)
  expect(contents).toBe('<div>onServerPrefetch</div>')
})
```
