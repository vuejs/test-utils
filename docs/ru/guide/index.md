# Приступая к изучению

Добро пожаловать в Vue Test Utils, официальную библиотеку инструментов тестирования для Vue.js!

Эта документация для Vue Test Utils v2, которая предназначена для Vue 3.

Коротко:

- [Vue Test Utils 1](https://github.com/vuejs/vue-test-utils/) предназначена для [Vue 2](https://github.com/vuejs/vue/).
- [Vue Test Utils 2](https://github.com/vuejs/test-utils/) предназначена для [Vue 3](https://github.com/vuejs/core/).

## Что такое Vue Test Utils?

Vue Test Utils (VTU) это набор вспомогательных функций, предназначенных для упрощения тестирование Vue.js компонентов. Библиотека предоставляет некоторые методы для добавления и взаимодействия с Vue компонентами в изоляции от других компонентов.

Давайте рассмотрим пример:

```js
import { mount } from '@vue/test-utils'

// Компонент для тестирования
const MessageComponent = {
  template: '<p>{{ msg }}</p>',
  props: ['msg']
}

test('displays message', () => {
  const wrapper = mount(MessageComponent, {
    props: {
      msg: 'Hello world'
    }
  })

  // Сравнить текст компонента и ожидаемый текст.
  expect(wrapper.text()).toContain('Hello world')
})
```

Vue Test Utils обычно используется с программами тестирования. Популярные программы тестирования:

- [Vitest](https://vitest.dev/). На основе терминала, имеет экспериментальный браузерный интерфейс.
- [Cypress](https://cypress.io/). На основе браузера, поддерживает Vite, Webpack.
- [Playwright](https://playwright.dev/docs/test-components) (экспериментальный). На основе браузера, поддерживает Vite.
- [WebdriverIO](https://webdriver.io/docs/component-testing/vue). На основе браузера, поддерживает Vite, Webpack, кросс-браузерную поддержку.

Vue Test Utils это небольшая библиотека. Для создания чего-то более функционального, предлагаем рассмотреть [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/overview) которая имеет hot reload (быстрая перезагрузка), или [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/), которая делает акцент на селекторах при создании проверок. Оба инструмента используется Vue Test Utils под капотом и предоставляют те же самые API.

## Что дальше? 

Чтобы увидеть Vue Test Utils в действии, [попробуйте ускоренный курс](/ru/guide/essentials/a-crash-course.md), где мы создали простое Todo приложение, используя подход "сначала тест, потом реализация".

Документация разделена на 2 главных раздела:

- **Основы**: покрывает основные случаи использования, с которыми вы столкнетесь, при тестировании Vue компонентов.
- **Углубленно**: исследует продвинутые возможности библиотеки.

Вы также можете изучить полную [API](/ru/api/).

В качестве альтернативы, если вы предпочитаете изучать по видео, тут есть [плейлист с лекциями](https://www.youtube.com/playlist?list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA).
