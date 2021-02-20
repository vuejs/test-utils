# Slots

Vue Test Utils provides some useful features for testing components using `slots`.

## A Simple Example

You might have a generic `<layout>` component that uses a default slot to render some content. For example:

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

You might want to write a test to ensure the default slot content is rendered. VTU provides the `slots` mounting option for this purpose:

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

It passes! In this example, we are passing some text content to the default slot. If you want to be even more specific, and verify the default slot content is rendered inside `<main>`, you could change the assertion:

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

## Named Slots

You may have more complex `<layout>` component with some named slots. For example:

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

VTU also supports this. You can write a test as follows. Note that in this example we are passing HTML instead of text content to the slots.

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

## Advanced Usage

You can also pass a render function to a slot mounting option, or even an SFC imported from a `vue` file:

```js
import { h } from 'vue'
import Header from './Header.vue'

test('layout full page layout', () => {
  const wrapper = mount(Layout, {
    slots: {
      header: Header
      main: h('div', 'Main content')
      footer: '<div>Footer</div>'
    }
  })

  expect(wrapper.html()).toContain('<div>Header</div>')
  expect(wrapper.html()).toContain('<div>Main Content</div>')
  expect(wrapper.html()).toContain('<div>Footer</div>')
})
```

Note: passing a component using `{ template: '<div /> }` is not supported. Use a HTML string, render function, plain text, or an SFC.

## Scoped Slots

[Scoped slots](https://v3.vuejs.org/guide/component-slots.html#scoped-slots) and bindings are also supported.

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
      scoped: `<template #scoped="params">
        Hello {{ params.msg }}
        </template>
      `
    }
  })

  expect(wrapper.html()).toContain('Hello world')
})
```

## Conclusion

- Use the `slots` mounting option to test components using `<slot>` are rendering content correctly.
- Content can either be a string, a render function or an imported SFC.
- Use `default` for the default slot, and the correct name for a named slots.
- scoped slots and the `#` shorthand is also supported.
