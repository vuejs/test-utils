# Переиспользование и композиция

Обычно:

- `global.mixins`.
- `global.directives`.

## Тестирование composables

При работе с composition API и созданием composables вам часто хочется протестировать только composable. Давайте начнем с простого примера:

```typescript
export function useCounter() {
  const counter = ref(0)

  function increase() {
    counter.value += 1
  }

  return { counter, increase }
}
```

В данном случае вам даже не нужен `@vue/test-utils`. Вот соответствующий тест:

```typescript
test('increase counter on call', () => {
  const { counter, increase } = useCounter()

  expect(counter.value).toBe(0)

  increase()

  expect(counter.value).toBe(1)
})
```

Для более сложных composables, которые используют хуки жизненного цикла, например, `onMounted` или `provide`/`inject`, вы можете создать простой вспомогательный компонент для тестирования. Следующий composable получает данные пользователя внутри `onMounted` хука.

```typescript
export function useUser(userId) {
  const user = ref()
  
  function fetchUser(id) {
    axios.get(`users/${id}`)
      .then(response => (user.value = response.data))
  }

  onMounted(() => fetchUser(userId))

  return { user }
}
```

Для тестирования этого composable вы можете создать простой `TestComponent` в рамках тестов. `TestComponent` должен использовать composable точно так же, как использовали бы его настоящие компоненты.

```typescript
// Имитированный API запрос
jest.spyOn(axios, 'get').mockResolvedValue({ data: { id: 1, name: 'User' } })

test('fetch user on mount', async () => {
  const TestComponent = defineComponent({
    props: {
      // Определить props, чтобы протестировать composable 
      // с различными входными аргументами
      userId: {
        type: Number,
        required: true
      }
    },
    setup (props) {
      return {
        // Вызовите composable и верните все значения в ваш компонент,
        // чтобы вы могли получить доступ к ним при помощи wrapper.vm
        ...useUser(props.userId)
      }
    }
  })

  const wrapper = mount(TestComponent, {
    props: {
      userId: 1
    }
  })

  expect(wrapper.vm.user).toBeUndefined()

  await flushPromises()

  expect(wrapper.vm.user).toEqual({ id: 1, name: 'User' })
})
```

## Provide / inject

Vue предоставляет возможность передать props во все дочерние компоненты при помощи `provide` и `inject`. Лучший вариант протестировать это поведение - это протестировать все дерево (родитель + дети). Но иногда это невозможно, потому что дерево слишком сложное, либо вы хотите только протестировать один composable.

### Тестирование `provide`

Давайте предположим следующий компонент, который вы хотите протестировать:

```vue
<template>
  <div>
    <slot />
  </div>
</template>

<script setup>
provide('my-key', 'some-data')
</script>
```

В этом случае вы могли бы отрисовать настоящий дочерний компонент и протестировать правильное использование `provide`, либо вы можете создать простой вспомогательный компонент для тестирования и передать его в слот по умолчанию. 

```typescript
test('provides correct data', () => {
  const TestComponent = defineComponent({
    template: '<span id="provide-test">{{value}}</span>',
    setup () {
      const value = inject('my-key')
      return { value }
    }
  })

  const wrapper = mount(ParentComponent, {
    slots: {
      default: () => h(TestComponent)
    }
  })

  expect(wrapper.find('#provide-test').text()).toBe('some-data')
})
```

Если твой компонент не содержит слот, вы можете использовать [`stub`](./stubs-shallow-mount.md#Stubbing-a-single-child-component)
и заменить дочерний компонент на ваш вспомогательный компонент:

```vue
<template>
  <div>
    <SomeChild />
  </div>
</template>

<script setup>
import SomeChild from './SomeChild.vue'

provide('my-key', 'some-data')
</script>
```

И тест:

```typescript
test('provides correct data', () => {
  const TestComponent = defineComponent({
    template: '<span id="provide-test">{{value}}</span>',
    setup () {
      const value = inject('my-key')
      return { value }
    }
  })

  const wrapper = mount(ParentComponent, {
    global: {
      stubs: {
        SomeChild: TestComponent
      }
    }
  })

  expect(wrapper.find('#provide-test').text()).toBe('some-data')
})
```

### Тестирование `inject`

Когда ваш компонент использует `inject` и вам нужно передать данные при помощи `provide`, вы можете использовать `global.provide` опцию.

```vue
<template>
  <div>
    {{ value }}
  </div>
</template>

<script setup>
const value = inject('my-key')
</script>
```

Unit тест мог выглядеть примерно так: 

```typescript
test('renders correct data', () => {
  const wrapper = mount(MyComponent, {
    global: {
      provide: {
        'my-key': 'some-data'
      }
    }
  })

  expect(wrapper.text()).toBe('some-data')
})
```

## Заключение

- тестируйте простые composables без компонентов и `@vue/test-utils`
- создавайте вспомогательные компоненты для тестирования более сложных composables
- создавайте вспомогательные компоненты для тестирования ваших компонентов, обеспечивая правильные данные с `provide`
- используйте `global.provide` для передачи данных в ваш компонент, который использует `inject`