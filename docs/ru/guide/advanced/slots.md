# Слоты

Vue Test Utils предоставляет несколько полезных функций для тестирования компонентов, используя `slots`.

## Простой пример

Возможно, у вас есть `<layout>` компонент, который использует слот по умолчанию для отображения некоторого содержимого. Например:

```js
const Layout = {
  template: `
    <div>
      <h1>Welcome!</h1>
      <main>
        <slot />
      </main>
      <footer>
        Thanks for visiting.
      </footer>
    </div>
  `
}
```

Возможно, вы хотите написать тест, чтобы убедиться в том, что содержимое слота по умолчанию отрисовано. VTU предоставляет `slots` опцию монтирования для этой цели:

```js
test('layout default slot', () => {
  const wrapper = mount(Layout, {
    slots: {
      default: 'Main Content'
    }
  })

  expect(wrapper.html()).toContain('Main Content')
})
```

Тест пройден! В этом примере мы передаем содержимое некоторого текста в слот по умолчанию. Если ты хочешь быть еще более конкретным и убедиться, что содержимое слота по умолчанию отрисовано в `<main>`, вы могли бы изменить проверку:

```js
test('layout default slot', () => {
  const wrapper = mount(Layout, {
    slots: {
      default: 'Main Content'
    }
  })

  expect(wrapper.find('main').text()).toContain('Main Content')
})
```

## Именованные слоты

У вас может быть более сложный `<layout>` компонент с несколькими именованными слотами. Например:

```js
const Layout = {
  template: `
    <div>
      <header>
        <slot name="header" />
      </header>

      <main>
        <slot name="main" />
      </main>
      <footer>
        <slot name="footer" />
      </footer>
    </div>
  `
}
```

VTU также поддерживает это. Вы можете написать тест следующим образом. Обратите внимание, в этом примере мы передаем HTML вместо содержимого текста в слоты.

```js
test('layout full page layout', () => {
  const wrapper = mount(Layout, {
    slots: {
      header: '<div>Header</div>',
      main: '<div>Main Content</div>',
      footer: '<div>Footer</div>'
    }
  })

  expect(wrapper.html()).toContain('<div>Header</div>')
  expect(wrapper.html()).toContain('<div>Main Content</div>')
  expect(wrapper.html()).toContain('<div>Footer</div>')
})
```

## Множественные слоты

Вы также можете передать массив слотов:

```js
test('layout full page layout', () => {
  const wrapper = mount(Layout, {
    slots: {
      default: [
        '<div id="one">One</div>',
        '<div id="two">Two</div>'
      ]
    }
  })

  expect(wrapper.find('#one').exists()).toBe(true)
  expect(wrapper.find('#two').exists()).toBe(true)
})
```

## Продвинутое использование

Ты также можешь передать функцию отрисовки, объект с шаблоном или даже SFC, импортированный из `vue` файла, в слот опцию монтирования:

```js
import { h } from 'vue'
import Header from './Header.vue'

test('layout full page layout', () => {
  const wrapper = mount(Layout, {
    slots: {
      header: Header,
      main: h('div', 'Main Content'),
      sidebar: { template: '<div>Sidebar</div>' },
      footer: '<div>Footer</div>'
    }
  })

  expect(wrapper.html()).toContain('<div>Header</div>')
  expect(wrapper.html()).toContain('<div>Main Content</div>')
  expect(wrapper.html()).toContain('<div>Footer</div>')
})
```

[Изучите тесты](https://github.com/vuejs/test-utils/blob/9d3c2a6526f3d8751d29b2f9112ad2a3332bbf52/tests/mountingOptions/slots.spec.ts#L124-L167) с большим количеством примеров и вариантов использования.

## Слоты с ограниченной областью действия

[Слоты с ограниченной областью действия](https://v3.vuejs.org/guide/component-slots.html#scoped-slots) и привязки также доступны. 

```js
const ComponentWithSlots = {
  template: `
    <div class="scoped">
      <slot name="scoped" v-bind="{ msg }" />
    </div>
  `,
  data() {
    return {
      msg: 'world'
    }
  }
}

test('scoped slots', () => {
  const wrapper = mount(ComponentWithSlots, {
    slots: {
      scoped: `<template #scoped="scope">
        Hello {{ scope.msg }}
        </template>
      `
    }
  })

  expect(wrapper.html()).toContain('Hello world')
})
```

Когда используется шаблоны строк для содержимого слота, **если явно не указан `<template #scoped="scopeVar">` тег**, слот становится доступным как `params` объект при вычислении слота.

```js
test('scoped slots', () => {
  const wrapper = mount(ComponentWithSlots, {
    slots: {
      scoped: `Hello {{ params.msg }}` // no wrapping template tag provided, slot scope exposed as "params"
    }
  })

  expect(wrapper.html()).toContain('Hello world')
})
```

## Заключение

- Используйте `slots` опцию монтирования для тестирования компонента, использующего `slot`, чтобы проверить правильность отрисовки.
- Содержимое может быть либо строкой, либо функцией рендеринга или импортированным SFC.
- Используйте `default` для слота по умолчанию и корректное имя для именованных слотов.
- Слоты с ограниченной областью действия и `#` сокращение также поддерживаются.
