# Тестирование Teleport

Vue 3 предоставляет новый встроенный компонент: `<Teleport>`, который позволяет компонентам "телепортировать" их содержимое далеко за пределы их собственного `<template>`. Большинство тестов, написанные при помощи Vue Test Utils, ограничены компонентом, переданным в `mount`, который привносит некоторую сложность, когда нужно протестировать компонент, который телепортирован за пределы компонента, где он был изначально отрисован.

Вот несколько стратегий и техник для тестирования компонентов, используя `<Teleport>`.

::: tip
Если вы хотите протестировать остальную часть вашего компонента, игнорируя `teleport`, вы можете поставить заглушку на `teleport`, передав `teleport: true` в [global stubs option](../../api/#global-stubs).
:::

## Пример

В этом примере мы тестируем `<Navbar>` компонент. Он отрисовывает `<Signup>` компонент внутри `<Teleport>`. `target` атрибут `<Teleport>` - это элемент, расположенный за пределами `<Navbar>` компонента.

Это `Navbar.vue` компонент:

```vue
<template>
  <Teleport to="#modal">
    <Signup />
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Signup from './Signup.vue'

export default defineComponent({
  components: {
    Signup
  }
})
</script>
```

Он просто телепортирует `<Signup>` в другое место. Для целей нашего примера это просто.

`Signup.vue` - это форма, которая проверяет, содержит ли `username` больше чем 8 символов. Если да, то когда форма отправлена, генерируется `signup` событие с `username` в качестве параметра. Протестировать это будет нашей целью.

```vue
<template>
  <div>
    <form @submit.prevent="submit">
      <input v-model="username" />
    </form>
  </div>
</template>

<script>
export default {
  emits: ['signup'],
  data() {
    return {
      username: ''
    }
  },
  computed: {
    error() {
      return this.username.length < 8
    }
  },
  methods: {
    submit() {
      if (!this.error) {
        this.$emit('signup', this.username)
      }
    }
  }
}
</script>
```

## Создание компонента

Начнем с простого теста:

```ts
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'
import Signup from './Signup.vue'

test('emits a signup event when valid', async () => {
  const wrapper = mount(Navbar)
})
```

Запуск этого теста выдаст вам предупреждение: `[Vue warn]: Failed to locate Teleport target with selector "#modal"`. Давайте создадим его:

```ts {5-15}
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'
import Signup from './Signup.vue'

beforeEach(() => {
  // создать teleport target
  const el = document.createElement('div')
  el.id = 'modal'
  document.body.appendChild(el)
})

afterEach(() => {
  // очистить
  document.body.innerHTML = ''
})

test('teleport', async () => {
  const wrapper = mount(Navbar)
})
```

Мы используем Jest для этого примера, который не сбрасывает DOM каждый тест. По этой причине желательно очищать DOM после каждого теста при помощи `afterEach`.

## Взаимодействие с телепортированным компонентом

Следующая вещь, которую мы должны сделать, - это заполнить пользовательский input. К несчастью, мы не можем использовать `wrapper.find('input')`. Почему нет? Быстрый `console.log(wrapper.html())` покажет нам:

```html
<!--teleport start-->
<!--teleport end-->
```

Мы видим несколько комментариев, используемых Vue для обработки `<Teleport>`, но без `<input>`. Поскольку `<Signup>` компонент (и его HTML) не отрисован внутри `<Navbar>` где-либо, он был телепортирован за пределы компонента.

Хотя фактический HTML был телепортирован за пределы, оказывается, что Virtual DOM, связанный с `<Navbar>`, поддерживает ссылку на оригинальный компонент. Это значит, что вы можете использовать `getComponent` и `findComponent`, которые работают с Virtual DOM, но не с обычным DOM.

```ts {12}
beforeEach(() => {
  // ...
})

afterEach(() => {
  // ...
})

test('teleport', async () => {
  const wrapper = mount(Navbar)

  wrapper.getComponent(Signup) // получен!
})
```

`getComponent` вернет `VueWrapper`. Теперь вы можете использовать методы такие как `get`, `find` и `trigger`.

Давайте закончим тест:

```ts {4-8}
test('teleport', async () => {
  const wrapper = mount(Navbar)

  const signup = wrapper.getComponent(Signup)
  await signup.get('input').setValue('valid_username')
  await signup.get('form').trigger('submit.prevent')

  expect(signup.emitted().signup[0]).toEqual(['valid_username'])
})
```

Он пройден!

Полный тест:

```ts
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'
import Signup from './Signup.vue'

beforeEach(() => {
  // создать teleport target
  const el = document.createElement('div')
  el.id = 'modal'
  document.body.appendChild(el)
})

afterEach(() => {
  // очистить
  document.body.innerHTML = ''
})

test('teleport', async () => {
  const wrapper = mount(Navbar)

  const signup = wrapper.getComponent(Signup)
  await signup.get('input').setValue('valid_username')
  await signup.get('form').trigger('submit.prevent')

  expect(signup.emitted().signup[0]).toEqual(['valid_username'])
})
```

Вы можете заглушить `teleport`, используя `teleport: true`:

```ts
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'

test('teleport', async () => {
  const wrapper = mount(Navbar, {
    global: {
      stubs: {
        teleport: true
      }
    }
  })
})
```

## Заключение

- Создайте элемент для телепортирования при помощи `document.createElement`.
- Найдите телепортированные компоненты при помощи `getComponent` или `findComponent`, которые работают с Virtual DOM.
