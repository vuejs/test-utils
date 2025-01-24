# Асинхронное поведение

Возможно, вы заметили некоторые другие части руководства используют `await`, когда вызываются некоторые методы у `wrapper`, такие как `trigger` и `setValue`. Что все это значит?

Возможно, вы знаете, Vue обновляется реактивно: когда ты меняешь значение, DOM автоматически изменяется, чтобы отразить последнее изменение. [Vue делает эти обновления асинхронно](https://v3.vuejs.org/guide/change-detection.html#async-update-queue). В отличие от программ тестирования, например, Jest обновляется _синхронно_. Это может вызвать некоторые неожиданные результаты в тестах.

Давайте посмотрим на некоторые стратегии, чтобы убедиться, что Vue обновляет DOM, как ожидается, когда мы запускаем наши тесты.

## Простой пример - Обновление при помощи `trigger`

Давайте используем компонент `<Counter>` из [обработка события](/ru/guide/essentials/event-handling) с одним изменением; мы сейчас отобразим `count` в `template`.

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

Давайте напишем тест, чтобы убедиться в том, что `count` увеличиться:

```js
test('increments by 1', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')

  expect(wrapper.html()).toContain('Count: 1')
})
```

К удивлению, тест не пройден! Причина в том, что, не смотря на увеличение `count`, Vue не обновит DOM до следующего event loop тика. По этой причине, проверка (`expect()...`) будет вызвана до того, как Vue обновит DOM.

:::tip
Если ты хочешь изучить больше об этом базовом JavaScript поведении, прочитайте про [Event Loop и его macrotasks и microtasks](https://javascript.info/event-loop#macrotasks-and-microtasks).
:::

Как мы можем изменить это? Vue в действительности предоставляет возможность нам ждать, пока DOM не обновится: `nextTick`.

```js {1,7}
import { nextTick } from 'vue'

test('increments by 1', async () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  await nextTick()

  expect(wrapper.html()).toContain('Count: 1')
})
```

Теперь тест будет пройден, чтобы мы убедились в том, что следующий "тик" выполнился и DOM обновился перед запуском дальнейших проверок.

Поскольку `await nextTick()` является распространенным, Vue Test Utils предоставляет сокращение. Методы, которые вызывают обновление DOM, такие как `trigger` и `setValue`, вернут `nextTick`, поэтому ты можешь просто указать `await` перед ними:

```js {4}
test('increments by 1', async () => {
  const wrapper = mount(Counter)

  await wrapper.find('button').trigger('click')

  expect(wrapper.html()).toContain('Count: 1')
})
```

## Другое асинхронное поведение

`nextTick` будет полезным, чтобы убедиться в том, что некоторые изменения в реактивных данных были отображены в DOM до продолжения теста. Однако, иногда вы можете захотеть убедиться в другом, что асинхронное поведение, не связанное с Vue, тоже завершено.

Распространенный пример - это функция, которая возвращает `Promise`. Возможно, вы имитировали `axios` HTTP-клиент, используя `jest.mock`:

```js
jest.spyOn(axios, 'get').mockResolvedValue({ data: 'some mocked data!' })
```

В данном случае Vue не знает о невыполненном Promise, поэтому вызов `nextTick` не будет работать - ваша проверка может выполниться до того, как Promise выполнится. Для таких сценариев Vue Test Utils предоставляет [`flushPromises`](/ru/api/#flushPromises), который заставляет все невыполненные промисы выполниться немедленно.

Давайте посмотрим на пример:

```js{1,12}
import { flushPromises } from '@vue/test-utils'
import axios from 'axios'

jest.spyOn(axios, 'get').mockResolvedValue({ data: 'some mocked data!' })

test('uses a mocked axios HTTP client and flushPromises', async () => {
  // какой-то компонент, который выполняет HTTP запрос, 
  // вызванный в `created`, используя `axios`
  const wrapper = mount(AxiosComponent)

  await flushPromises() // axios промис выполнился сразу

  // после линии выше axios запрос выполнился с имитированными данными.
})
```

:::tip
Если вы хотите узнать больше о тестировании запросов в компонентах, ознакомьтесь с руководством [Выполнение HTTP запросов](/ru/guide/advanced/http-requests.md).
:::

## Тестирование асинхронного `setup`

Если компонент, который вы хотите протестировать, использует асинхронный `setup`, тогда вы должны создать компонент внутри `Suspense` компонента (как вы делали, когда использовали его в вашем приложении).

Например, этот `Async` компонент:

```js
const Async = defineComponent({
  async setup() {
    // await something
  }
})
```

должно быть протестировано следующим образом:

```js
test('Async component', async () => {
  const TestComponent = defineComponent({
    components: { Async },
    template: '<Suspense><Async/></Suspense>'
  })

  const wrapper = mount(TestComponent)
  await flushPromises();
  // ...
})
```

Обратите внимание: для получения доступа к экземпляру `vm` вашего `Async` компонента используйте возвращаемое значение у `wrapper.findComponent(Async)`. Поскольку новый компонент определен и добавлен в этом сценарии, оболочка, возвращаемая `mount(TestComponent)` , содержит его собственный (пустой) `vm`.

## Заключение

- Vue обновляет DOM асинхронно, но программы тестирования выполняют код синхронно.
- Используйте `await nextTick()`, чтобы удостовериться в том, что DOM обновился до того, как тесты продолжаться.
- Функции, которые могут обновлять DOM (например, `trigger` и `setValue`) возвращают `nextTick`, поэтому вам нужно использовать `await`.
- Используйте `flushPromises` из Vue Test Utils, чтобы выполнить любые невыполненные промисы, не связанные с Vue (такие как API запросы).
- Используйте `Suspense` для тестирования компонентов с асинхронным `setup`, указывая `async` для функции теста.
