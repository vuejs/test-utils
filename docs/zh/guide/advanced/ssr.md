# 测试服务端渲染

Vue Test Utils provides `renderToString` to test Vue applications that use server-side rendering (SSR).
Vue Test Utils 提供了 `renderToString` 方法，用于测试使用服务器端渲染（SSR）的 Vue 应用程序。本指南将带你了解如何测试使用 SSR 的 Vue 应用程序。

## `renderToString`

`renderToString` 是一个将 Vue 组件渲染为字符串的函数。它是一个异步函数，返回一个 Promise，并接受与 `mount` 或 `shallowMount` 相同的参数。

让我们考虑一个使用 `onServerPrefetch` 钩子的简单组件：

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

你可以使用 `renderToString` 为这个组件编写测试：

```ts
import { renderToString } from '@vue/test-utils'

it('renders the value returned by onServerPrefetch', async () => {
  const contents = await renderToString(Component)
  expect(contents).toBe('<div>onServerPrefetch</div>')
})
```
