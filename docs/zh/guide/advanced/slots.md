# 插槽

Vue Test Utils 提供了一些有用的功能，用于测试使用 `slots` 的组件。

## 简单示例

你可能有一个通用的 `<layout>` 组件，它使用默认插槽来渲染一些内容。例如：

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

你可能想编写一个测试，以确保默认插槽的内容被正确渲染。VTU 提供了 `slots` 挂载选项来实现这一目的：

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

测试通过！在这个示例中，我们将一些文本内容传递给默认插槽。如果你想更具体地验证默认插槽的内容是否渲染在 `<main>` 中，你可以修改断言：

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

## 命名插槽

你可能有一个更复杂的 `<layout>` 组件，带有一些命名插槽。例如：

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

VTU 也支持这一点。你可以编写如下测试。在这个示例中，我们将 HTML 而不是文本内容传递给插槽

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

## 多个插槽

你也可以传递一个插槽数组：

```js
test('layout full page layout', () => {
  const wrapper = mount(Layout, {
    slots: {
      default: ['<div id="one">One</div>', '<div id="two">Two</div>']
    }
  })

  expect(wrapper.find('#one').exists()).toBe(true)
  expect(wrapper.find('#two').exists()).toBe(true)
})
```

## 高级用法

你还可以将渲染函数、带有模板的对象，甚至从 `vue` 文件导入的单文件组件传递给插槽挂载选项：

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

[参考测试](https://github.com/vuejs/test-utils/blob/9d3c2a6526f3d8751d29b2f9112ad2a3332bbf52/tests/mountingOptions/slots.spec.ts#L124-L167) 获取更多示例和用例。

## 作用域插槽

[作用域插槽](https://v3.vuejs.org/guide/component-slots.html#scoped-slots) 和绑定也得到了支持。

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

当使用字符串模板作为插槽内容时，**如果没有使用包裹的** `<template #scoped="scopeVar">` **标签显式定义**，插槽作用域在插槽内容被解析时将作为 `params` 对象。

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

## 结论

- 使用 `slots` 挂载选项来测试组件使用 `<slot>` 是否正确渲染内容。
- 内容可以是字符串、渲染函数或导入的单文件组件(SFC)。
- 使用 `default` 表示默认插槽，使用正确的名称表示命名插槽。
- 作用域插槽和 `#` 简写也得到了支持。
