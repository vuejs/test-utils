# Тестирование Server-side Rendering

Vue Test Utils предоставляет `renderToString` для тестирования Vue приложений, которые используют server-side rendering (SSR).
Это руководство проведет тебя через процесс тестирования Vue приложений, которые используют SSR.

## `renderToString`

`renderToString` - это функция, которая преобразует Vue компонент к строке.
Это асинхронная функция, которая возвращает Promise, и принимает те же параметры, как и `mount` или `shallowMount`.

Давайте рассмотрим простой компонент, который использует `onServerPrefetch` хук:

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

Вы можете написать тест для этого компонента, используя `renderToString`:

```ts
import { renderToString } from '@vue/test-utils'

it('renders the value returned by onServerPrefetch', async () => {
  const contents = await renderToString(Component)
  expect(contents).toBe('<div>onServerPrefetch</div>')
})
```
