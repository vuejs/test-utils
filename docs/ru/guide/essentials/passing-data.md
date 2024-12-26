# Передача данных в компоненты

Vue Test Utils предоставляет несколько путей для установки данных и свойств у компонента, чтобы позволить тебе полностью протестировать поведение компонента в различных ситуациях.

В этой главе мы исследуем `data` и `props` опции при создании компонента, а также `VueWrapper.setProps()` для динамического обновления свойств компонента.

## Компонент для пароля

Мы продемонстрируем вышеупомянутые возможности, при помощи создания `<Password>` компонента. Этот компонент подтверждает пароль, который удовлетворяет определенным критериями. Мы начнем с следующего и добавим возможности, а также тесты, чтобы убедиться, что функции работают правильно:

```js
const Password = {
  template: `
    <div>
      <input v-model="password">
    </div>
  `,
  data() {
    return {
      password: ''
    }
  }
}
```

Первое требование, которое мы добавим - это минимальная длина.

## Использование `props` для установки минимальной длины

Мы хотим переиспользовать этот компонент во всех наших проектах, каждый из которых может иметь различные требования. По этой причине мы создадим `minLength` **свойство**, которые мы передадим в компонент `<Password>`:

Мы покажем ошибку, если `password` меньше, чем `minLength`. Мы можем сделать так, создав `error` вычисляемое свойство, и отрисовать по условию его при помощи `v-if`:

```js
const Password = {
  template: `
    <div>
      <input v-model="password">
      <div v-if="error">{{ error }}</div>
    </div>
  `,
  props: {
    minLength: {
      type: Number
    }
  },
  data() {
    return {
      password: ''
    }
  },
  computed: {
    error() {
      if (this.password.length < this.minLength) {
        return `Password must be at least ${this.minLength} characters.`
      }
      return
    }
  }
}
```

Чтобы протестировать это, нам нужно установить `minLength`, а также `password`, который меньше, чем это число. Мы можем сделать это используя `data` и `props` опции при создании компонента. И наконец, мы проверим, что сообщение об ошибке отрисовалось:

```js
test('renders an error if length is too short', () => {
  const wrapper = mount(Password, {
    props: {
      minLength: 10
    },
    data() {
      return {
        password: 'short'
      }
    }
  })

  expect(wrapper.html()).toContain('Password must be at least 10 characters')
})
```

Написать тест для `maxLength` правила остается в качестве упражнения для читателя! Другой способ сделать проверку, могло бы быть использование `setValue` для обновления поля ввода с паролем, который будет короче нужного. Вы можете изучить подробнее в [Формы](/ru/guide/essentials/forms).

## Использование `setProps`

Иногда, вам нужно написать тест для побочного эффекта от изменения свойства. Этот простой `<Show>` компонент отрисовывает приветствие, если `show` свойство является `true`.

```vue
<template>
  <div v-if="show">{{ greeting }}</div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      greeting: 'Hello'
    }
  }
}
</script>
```

Для полного тестирования нам нужно убедиться, что `greeting` отрисовалось по умолчанию. Мы можем обновить `show` свойство, используя `setProps()`, который заставляет `greeting` скрыться:

```js
import { mount } from '@vue/test-utils'
import Show from './Show.vue'

test('renders a greeting when show is true', async () => {
  const wrapper = mount(Show)
  expect(wrapper.html()).toContain('Hello')

  await wrapper.setProps({ show: false })

  expect(wrapper.html()).not.toContain('Hello')
})
```

Мы также используем ключевое слово `await` при вызове `setProps()`, чтобы убедиться в том, что DOM изменился до того, как тест продолжится.

## Заключение

- Используйте `props` и `data` опции при создании компонента для установки начального состояния компонента.
- Используйте `setProps()`, чтобы изменить свойство во время теста.
- Используйте ключевое слово `await` перед `setProps()`, чтобы убедится, что Vue обновил DOM, перед продолжением теста.
- Взаимодействие напрямую с вашим компонентом дает больше возможностей. Рассмотрите `setValue` или `trigger` в комбинации с `data`, чтобы убедиться, что все работает верно.
