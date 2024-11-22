---
sidebar: auto
---

# API 参考

## mount

创建一个包含已挂载和渲染的 Vue 组件的 Wrapper 以进行测试。
请注意，当使用 Vitest 模拟日期/计时器时，必须在 `vi.setSystemTime` 之后调用此方法。

**签名:**

```ts
interface MountingOptions<Props, Data = {}> {
  attachTo?: Element | string
  attrs?: Record<string, unknown>
  data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
  props?: (RawProps & Props) | ({} extends Props ? null : never)
  slots?: { [key: string]: Slot } & { default?: Slot }
  global?: GlobalMountOptions
  shallow?: boolean
}

function mount(Component, options?: MountingOptions): VueWrapper
```

**详细信息:**

`mount` 是 Vue Test Utils 提供的主要方法。它创建一个 Vue 3 应用程序，该应用程序持有并渲染正在测试的组件。作为返回，它创建一个 Wrapper 以对组件进行操作和断言。

```js
import { mount } from '@vue/test-utils'

const Component = {
  template: '<div>Hello world</div>'
}

test('mounts a component', () => {
  const wrapper = mount(Component, {})

  expect(wrapper.html()).toContain('Hello world')
})
```

注意 `mount` 接受第二个参数以定义组件的状态配置。

**示例 : 使用组件属性和 Vue 应用插件进行挂载**

```js
const wrapper = mount(Component, {
  props: {
    msg: 'world'
  },
  global: {
    plugins: [vuex]
  }
})
```

#### options.global

组件状态中，您可以通过 [`MountingOptions.global` 配置属性](#global) 配置上述 Vue 3 应用程序。这对于提供组件期望可用的模拟值非常有用。

::: tip
如果您发现自己需要为许多测试设置共同的应用配置，则可以使用导出的 [`config` 对象](#config) 为整个测试套件设置配置。
:::

### attachTo

指定要挂载组件的节点。当使用 `renderToString` 时，此选项不可用。

**签名:**

```ts
attachTo?: Element | string
```

**详细信息:**

可以是有效的 CSS 选择器，或者是连接到文档的 [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element)。

注意，组件是附加到节点上的，并不会替换节点的整个内容。如果在多个测试中将组件挂载到同一个节点上，请确保在每个测试后调用 `wrapper.unmount()` 以卸载它，这将从节点中移除渲染的元素。

`Component.vue`:

```vue
<template>
  <p>Vue Component</p>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

document.body.innerHTML = `
  <div>
    <h1>Non Vue app</h1>
    <div id="app"></div>
  </div>
`

test('mounts on a specific element', () => {
  const wrapper = mount(Component, {
    attachTo: document.getElementById('app')
  })

  expect(document.body.innerHTML).toBe(`
  <div>
    <h1>Non Vue app</h1>
    <div id="app"><div data-v-app=""><p>Vue Component</p></div></div>
  </div>
`)
})
```

### attrs

为组件设置 HTML 属性。

**签名:**

```ts
attrs?: Record<string, unknown>
```

**详细信息:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('attrs', () => {
  const wrapper = mount(Component, {
    attrs: {
      id: 'hello',
      disabled: true
    }
  })

  expect(wrapper.attributes()).toEqual({
    disabled: 'true',
    id: 'hello'
  })
})
```

请注意，已定义的属性会覆盖 HTML 属性的设置:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('attribute is overridden by a prop with the same name', () => {
  const wrapper = mount(Component, {
    props: {
      message: 'Hello World'
    },
    attrs: {
      message: 'this will get overridden'
    }
  })

  expect(wrapper.props()).toEqual({ message: 'Hello World' })
  expect(wrapper.attributes()).toEqual({})
})
```

### data

覆盖组件的默认 `data`。必须是一个函数。

**签名:**

```ts
data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
```

**详细信息:**

`Component.vue`

```vue
<template>
  <div>Hello {{ message }}</div>
</template>

<script>
export default {
  data() {
    return {
      message: 'everyone'
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('data', () => {
  const wrapper = mount(Component, {
    data() {
      return {
        message: 'world'
      }
    }
  })

  expect(wrapper.html()).toContain('Hello world')
})
```

### props

在组件挂载时设置 props。

**签名:**

```ts
props?: (RawProps & Props) | ({} extends Props ? null : never)
```

**详细信息:**

`Component.vue`:

```vue
<template>
  <span>Count: {{ count }}</span>
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      required: true
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('props', () => {
  const wrapper = mount(Component, {
    props: {
      count: 5
    }
  })

  expect(wrapper.html()).toContain('Count: 5')
})
```

### slots

为组件的插槽设置值。

**签名:**

```ts
type Slot = VNode | string | { render: Function } | Function | Component

slots?: { [key: string]: Slot } & { default?: Slot }
```

**详细信息:**

插槽可以是一个字符串或任何有效的组件定义，既可以从 `.vue` 文件中导入，也可以内联提供。

`Component.vue`:

```vue
<template>
  <slot name="first" />
  <slot />
  <slot name="second" />
</template>
```

`Bar.vue`:

```vue
<template>
  <div>Bar</div>
</template>
```

`Component.spec.js`:

```js
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import Component from './Component.vue'
import Bar from './Bar.vue'

test('renders slots content', () => {
  const wrapper = mount(Component, {
    slots: {
      default: 'Default',
      first: h('h1', {}, 'Named Slot'),
      second: Bar
    }
  })

  expect(wrapper.html()).toBe('<h1>Named Slot</h1>Default<div>Bar</div>')
})
```

### global

**签名:**

```ts
type GlobalMountOptions = {
  plugins?: (Plugin | [Plugin, ...any[]])[]
  config?: Partial<Omit<AppConfig, 'isNativeTag'>>
  mixins?: ComponentOptions[]
  mocks?: Record<string, any>
  provide?: Record<any, any>
  components?: Record<string, Component | object>
  directives?: Record<string, Directive>
  stubs?: Stubs = Record<string, boolean | Component> | Array<string>
  renderStubDefaultSlot?: boolean
}
```

您可以在每个测试基础上以及整个测试套件中配置所有 `global` 选项。 [请参见此处以了解如何配置项目范围的默认值](#config-global)。

#### global.components

将组件全局注册到挂载的组件中。

**签名:**

```ts
components?: Record<string, Component | object>
```

**详细信息:**

`Component.vue`:

```vue
<template>
  <div>
    <global-component />
  </div>
</template>

<script>
import GlobalComponent from '@/components/GlobalComponent'

export default {
  components: {
    GlobalComponent
  }
}
</script>
```

`GlobalComponent.vue`:

```vue
<template>
  <div class="global-component">My Global Component</div>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import GlobalComponent from '@/components/GlobalComponent'
import Component from './Component.vue'

test('global.components', () => {
  const wrapper = mount(Component, {
    global: {
      components: {
        GlobalComponent
      }
    }
  })

  expect(wrapper.find('.global-component').exists()).toBe(true)
})
```

#### global.config

配置 [Vue 的应用程序全局配置](https://v3.vuejs.org/api/application-config.html#application-config)。

**签名:**

```ts
config?: Partial<Omit<AppConfig, 'isNativeTag'>>
```

#### global.directives

将 [指令](https://v3.vuejs.org/api/directives.html#directives) 全局注册到挂载的组件中。

**签名:**

```ts
directives?: Record<string, Directive>
```

**详细信息:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'

import Directive from '@/directives/Directive'

const Component = {
  template: '<div v-bar>Foo</div>'
}

test('global.directives', () => {
  const wrapper = mount(Component, {
    global: {
      directives: {
        Bar: Directive // Bar matches v-bar
      }
    }
  })
})
```

#### global.mixins

将 [混入](https://v3.vuejs.org/guide/mixins.html) 全局注册到挂载的组件中。

**签名:**

```ts
mixins?: ComponentOptions[]
```

**详细信息:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.mixins', () => {
  const wrapper = mount(Component, {
    global: {
      mixins: [mixin]
    }
  })
})
```

#### global.mocks

模拟全局实例属性。可用于模拟 `this.$store`、`this.$router` 等。

**签名:**

```ts
mocks?: Record<string, any>
```

**详细信息:**

::: warning
此功能旨在模拟由第三方插件注入的变量，而不是 Vue 的原生属性，如 $root、$children 等。
:::

`Component.vue`:

```vue
<template>
  <button @click="onClick" />
</template>

<script>
export default {
  methods: {
    onClick() {
      this.$store.dispatch('click')
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.mocks', async () => {
  const $store = {
    dispatch: jest.fn()
  }

  const wrapper = mount(Component, {
    global: {
      mocks: {
        $store
      }
    }
  })

  await wrapper.find('button').trigger('click')

  expect($store.dispatch).toHaveBeenCalledWith('click')
})
```

#### global.plugins

在挂载的组件上安装插件。

**签名:**

```ts
plugins?: (Plugin | [Plugin, ...any[]])[]
```

**详细信息:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

import myPlugin from '@/plugins/myPlugin'

test('global.plugins', () => {
  mount(Component, {
    global: {
      plugins: [myPlugin]
    }
  })
})
```

要使用带选项的插件，可以传递选项数组。

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.plugins with options', () => {
  mount(Component, {
    global: {
      plugins: [Plugin, [PluginWithOptions, 'argument 1', 'another argument']]
    }
  })
})
```

#### global.provide

提供数据，以便在 `setup` 函数中通过 `inject` 接收。

**签名:**

```ts
provide?: Record<any, any>
```

**详细信息:**

`Component.vue`:

```vue
<template>
  <div>Theme is {{ theme }}</div>
</template>

<script>
import { inject } from 'vue'

export default {
  setup() {
    const theme = inject('Theme')
    return {
      theme
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.provide', () => {
  const wrapper = mount(Component, {
    global: {
      provide: {
        Theme: 'dark'
      }
    }
  })

  console.log(wrapper.html()) //=> <div>Theme is dark</div>
})
```

如果您使用 ES6 `Symbol` 作为提供键，可以将其用作动态键：

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

const ThemeSymbol = Symbol()

mount(Component, {
  global: {
    provide: {
      [ThemeSymbol]: 'value'
    }
  }
})
```

#### global.renderStubDefaultSlot

即使在使用 `shallow` 或 `shallowMount` 时，也会渲染 `default` 插槽内容。

**签名:**

```ts
renderStubDefaultSlot?: boolean
```

**详细信息:**

默认为 **false**。

`Component.vue`

```vue
<template>
  <slot />
  <another-component />
</template>

<script>
export default {
  components: {
    AnotherComponent
  }
}
</script>
```

`AnotherComponent.vue`

```vue
<template>
  <p>Another component content</p>
</template>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.renderStubDefaultSlot', () => {
  const wrapper = mount(ComponentWithSlots, {
    slots: {
      default: '<div>My slot content</div>'
    },
    shallow: true,
    global: {
      renderStubDefaultSlot: true
    }
  })

  expect(wrapper.html()).toBe(
    '<div>My slot content</div><another-component-stub></another-component-stub>'
  )
})
```

由于技术限制，**此行为无法扩展到除默认插槽之外的其他插槽**。

#### global.stubs

在挂载的组件上使用全局替代组件（stub）。

**签名:**

```ts
stubs?: Record<any, any>
```

**详细信息:**

默认情况下，`Transition` 和 `TransitionGroup` 组件会被自动 stub 掉。

`Component.vue`:

```vue
<template>
  <div><foo /></div>
</template>

<script>
import Foo from '@/Foo.vue'

export default {
  components: { Foo }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.stubs using array syntax', () => {
  const wrapper = mount(Component, {
    global: {
      stubs: ['Foo']
    }
  })

  expect(wrapper.html()).toEqual('<div><foo-stub></div>')
})

test('global.stubs using object syntax', () => {
  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: true }
    }
  })

  expect(wrapper.html()).toEqual('<div><foo-stub></div>')
})

test('global.stubs using a custom component', () => {
  const CustomStub = {
    name: 'CustomStub',
    template: '<p>custom stub content</p>'
  }

  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: CustomStub }
    }
  })

  expect(wrapper.html()).toEqual('<div><p>custom stub content</p></div>')
})
```

### shallow

组件的所有子组件替换为 stub。

**签名:**

```ts
shallow?: boolean
```

**详细信息:**

默认为 **false**。

`Component.vue`

```vue
<template>
  <a-component />
  <another-component />
</template>

<script>
export default {
  components: {
    AComponent,
    AnotherComponent
  }
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('shallow', () => {
  const wrapper = mount(Component, { shallow: true })

  expect(wrapper.html()).toEqual(
    `<a-component-stub></a-component-stub><another-component-stub></another-component-stub>`
  )
})
```

::: tip
`shallowMount()` 是使用 `shallow: true` 挂载组件的别名。
:::

## Wrapper methods

当你使用 `mount` 时，会返回一个 `VueWrapper`，它包含了一些用于测试的有用方法。`VueWrapper` 是对你的组件实例的一个轻量级包装。

请注意，像 `find` 这样的函数返回一个 `DOMWrapper`，它是对你组件及其子组件中的 DOM 节点的一个轻量级包装。两者都实现了类似的 API。

### attributes

返回 DOM 节点上的属性。

**签名:**

```ts
attributes(): { [key: string]: string }
attributes(key: string): string
attributes(key?: string): { [key: string]: string } | string
```

**详细信息:**

`Component.vue`:

```vue
<template>
  <div id="foo" :class="className" />
</template>

<script>
export default {
  data() {
    return {
      className: 'bar'
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('attributes', () => {
  const wrapper = mount(Component)

  expect(wrapper.attributes('id')).toBe('foo')
  expect(wrapper.attributes('class')).toBe('bar')
})
```

### classes

**签名:**

```ts
classes(): string[]
classes(className: string): boolean
classes(className?: string): string[] | boolean
```

**详细信息:**

返回元素上的类名数组。

`Component.vue`:

```vue
<template>
  <span class="my-span" />
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('classes', () => {
  const wrapper = mount(Component)

  expect(wrapper.classes()).toContain('my-span')
  expect(wrapper.classes('my-span')).toBe(true)
  expect(wrapper.classes('not-existing')).toBe(false)
})
```

### emitted

返回组件发出的所有事件。

**签名:**

```ts
emitted<T = unknown>(): Record<string, T[]>
emitted<T = unknown>(eventName: string): undefined | T[]
emitted<T = unknown>(eventName?: string): undefined | T[] | Record<string, T[]>
```

**详细信息:**

参数被存储在一个数组中，因此你可以验证每个事件发出时的参数。

`Component.vue`:

```vue
<script>
export default {
  created() {
    this.$emit('greet', 'hello')
    this.$emit('greet', 'goodbye')
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('emitted', () => {
  const wrapper = mount(Component)

  // wrapper.emitted() equals to { greet: [ ['hello'], ['goodbye'] ] }

  expect(wrapper.emitted()).toHaveProperty('greet')
  expect(wrapper.emitted().greet).toHaveLength(2)
  expect(wrapper.emitted().greet[0]).toEqual(['hello'])
  expect(wrapper.emitted().greet[1]).toEqual(['goodbye'])
})
```

### exists

验证一个元素是否存在。

**签名:**

```ts
exists(): boolean
```

**详细信息:**

您可以使用与 `querySelector` 实现相同的语法。

`Component.vue`:

```vue
<template>
  <span />
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('exists', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('span').exists()).toBe(true)
  expect(wrapper.find('p').exists()).toBe(false)
})
```

### find

查找一个元素，如果找到则返回一个 `DOMWrapper`。

**签名:**

```ts
find<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>
find<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>
find<T extends Element>(selector: string): DOMWrapper<T>
find(selector: string): DOMWrapper<Element>
find<T extends Node = Node>(selector: string | RefSelector): DOMWrapper<T>;
```

**详细信息:**

您可以使用与 `querySelector` 相同的语法。`find` 基本上是 `querySelector` 的别名。此外，您还可以搜索元素引用。

它与 `get` 类似，但如果未找到元素，`find` 将返回一个 ErrorWrapper，而 [`get`](#get) 会抛出一个错误。

根据经验，当您断言某个元素不存在时，请始终使用 `find`。如果您断言某个元素确实存在，请使用 [`get`](#get)。

`Component.vue`:

```vue
<template>
  <span>Span</span>
  <span data-test="span">Span</span>
  <span ref="span">Span</span>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('find', () => {
  const wrapper = mount(Component)

  wrapper.find('span') //=> found; returns DOMWrapper
  wrapper.find('[data-test="span"]') //=> found; returns DOMWrapper
  wrapper.find({ ref: 'span' }) //=> found; returns DOMWrapper
  wrapper.find('p') //=> nothing found; returns ErrorWrapper
})
```

### findAll

与 `find` 类似，但返回的是一个 `DOMWrapper` 数组。

**签名:**

```ts
findAll<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>[]
findAll<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>[]
findAll<T extends Element>(selector: string): DOMWrapper<T>[]
findAll(selector: string): DOMWrapper<Element>[]
```

**详细信息:**

`Component.vue`:

```vue
<template>
  <span v-for="number in [1, 2, 3]" :key="number" data-test="number">
    {{ number }}
  </span>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import BaseTable from './BaseTable.vue'

test('findAll', () => {
  const wrapper = mount(BaseTable)

  // .findAll() returns an array of DOMWrappers
  const thirdRow = wrapper.findAll('span')[2]
})
```

### findComponent

找到一个 Vue 组件实例并返回一个 `VueWrapper`（如果找到）。否则返回 `ErrorWrapper`。

**签名:**

```ts
findComponent<T extends never>(selector: string): WrapperLike
findComponent<T extends DefinedComponent>(selector: T | Exclude<FindComponentSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>
findComponent<T extends FunctionalComponent>(selector: T | string): DOMWrapper<Element>
findComponent<T extends never>(selector: NameSelector | RefSelector): VueWrapper
findComponent<T extends ComponentPublicInstance>(selector: T | FindComponentSelector): VueWrapper<T>
findComponent(selector: FindComponentSelector): WrapperLike
```

**详细信息:**

`findComponent` 支持几种语法：

| 语法            | 示例                          | 详情                                       |
| --------------- | ----------------------------- | ------------------------------------------ |
| querySelector   | `findComponent('.component')` | 匹配标准查询选择器。                       |
| 组件名称        | `findComponent({name: 'a'})`  | 匹配 PascalCase、snake-case 和 camelCase。 |
| 组件引用        | `findComponent({ref: 'ref'})` | 仅可用于已挂载组件的直接引用子组件。       |
| 单文件组件(SFC) | `findComponent(Component)`    | 直接传入导入的组件。                       |

`Foo.vue`

```vue
<template>
  <div class="foo">Foo</div>
</template>

<script>
export default {
  name: 'Foo'
}
</script>
```

`Component.vue`:

```vue
<template>
  <Foo data-test="foo" ref="foo" class="foo" />
</template>

<script>
import Foo from '@/Foo'

export default {
  components: { Foo }
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

import Foo from '@/Foo.vue'

test('findComponent', () => {
  const wrapper = mount(Component)

  // All the following queries would return a VueWrapper

  wrapper.findComponent('.foo')
  wrapper.findComponent('[data-test="foo"]')

  wrapper.findComponent({ name: 'Foo' })

  wrapper.findComponent({ ref: 'foo' })

  wrapper.findComponent(Foo)
})
```

:::warning
如果组件中的 `ref` 指向 HTML 元素，`findComponent` 将返回一个空的包装器。这是预期的行为。
:::

:::warning 使用 CSS 选择器时的注意事项
使用 `findComponent` 和 CSS 选择器可能会导致混淆的行为。

考虑以下示例：

```js
const ChildComponent = {
  name: 'Child',
  template: '<div class="child"></div>'
}
const RootComponent = {
  name: 'Root',
  components: { ChildComponent },
  template: '<child-component class="root" />'
}
const wrapper = mount(RootComponent)
const rootByCss = wrapper.findComponent('.root') // => finds Root
expect(rootByCss.vm.$options.name).toBe('Root')
const childByCss = wrapper.findComponent('.child')
expect(childByCss.vm.$options.name).toBe('Root') // => still Root
```

这种行为的原因是 `RootComponent` 和 `ChildComponent` 共享相同的 DOM 节点，并且每个唯一的 DOM 节点只包含第一个匹配的组件。
:::

:::info 使用 CSS 选择器时的 WrapperLike 类型
例如，当使用 `wrapper.findComponent('.foo')` 时，VTU 将返回 `WrapperLike` 类型。这是因为功能组件需要一个 `DOMWrapper`，否则返回的是 `VueWrapper`。你可以通过提供正确的组件类型来强制返回 `VueWrapper`：

```typescript
wrapper.findComponent('.foo') // returns WrapperLike
wrapper.findComponent<typeof FooComponent>('.foo') // returns VueWrapper
wrapper.findComponent<DefineComponent>('.foo') // returns VueWrapper
```

:::

### findAllComponents

**签名:**

```ts
findAllComponents<T extends never>(selector: string): WrapperLike[]
findAllComponents<T extends DefinedComponent>(selector: T | Exclude<FindAllComponentsSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>[]
findAllComponents<T extends FunctionalComponent>(selector: string): DOMWrapper<Element>[]
findAllComponents<T extends FunctionalComponent>(selector: T): DOMWrapper<Node>[]
findAllComponents<T extends never>(selector: NameSelector): VueWrapper[]
findAllComponents<T extends ComponentPublicInstance>(selector: T | FindAllComponentsSelector): VueWrapper<T>[]
findAllComponents(selector: FindAllComponentsSelector): WrapperLike[]
```

**详细信息:**

与 `findComponent` 类似，但查找所有匹配查询的 Vue 组件实例。返回一个 `VueWrapper` 数组。

:::warning
`ref` 语法在 `findAllComponents` 中不支持。所有其他查询语法都是有效的。
:::

`Component.vue`:

```vue
<template>
  <FooComponent v-for="number in [1, 2, 3]" :key="number" data-test="number">
    {{ number }}
  </FooComponent>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('findAllComponents', () => {
  const wrapper = mount(Component)

  // Returns an array of VueWrapper
  wrapper.findAllComponents('[data-test="number"]')
})
```

:::warning 使用 CSS 选择器
`findAllComponents` 在使用 CSS 选择器时具有与 [findComponent](#findcomponent) 相同的行为。
:::

### get

获取一个元素，如果找到则返回一个 `DOMWrapper`，否则抛出错误。

**签名:**

```ts
get<K extends keyof HTMLElementTagNameMap>(selector: K): Omit<DOMWrapper<HTMLElementTagNameMap[K]>, 'exists'>
get<K extends keyof SVGElementTagNameMap>(selector: K): Omit<DOMWrapper<SVGElementTagNameMap[K]>, 'exists'>
get<T extends Element>(selector: string): Omit<DOMWrapper<T>, 'exists'>
get(selector: string): Omit<DOMWrapper<Element>, 'exists'>
```

**详细信息:**

它与 `find` 类似，但如果未找到元素，`get` 会抛出错误，而 [`find`](#find) 会返回一个 ErrorWrapper。

根据经验，除非你断言某个元素不存在（使用 [`find`](#find)），否则请始终使用 `get`。

`Component.vue`:

```vue
<template>
  <span>Span</span>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('get', () => {
  const wrapper = mount(Component)

  wrapper.get('span') //=> found; returns DOMWrapper

  expect(() => wrapper.get('.not-there')).toThrowError()
})
```

### getComponent

获取 Vue 组件实例，如果找到则返回一个 `VueWrapper`，否则抛出错误。

**签名:**

```ts
getComponent<T extends ComponentPublicInstance>(selector: new () => T): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: { name: string } | { ref: string } | string): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: any): Omit<VueWrapper<T>, 'exists'>
```

**详细信息:**

它与 `findComponent` 类似，但如果未找到 Vue 组件实例，`getComponent` 会抛出错误，而 [`findComponent`](#findComponent) 会返回一个 ErrorWrapper。

**支持的语法:**

| 语法            | 示例                         | 详细信息                                 |
| --------------- | ---------------------------- | ---------------------------------------- |
| querySelector   | `getComponent('.component')` | 匹配标准查询选择器。                     |
| 组件名称        | `getComponent({name: 'a'})`  | 匹配 PascalCase、snake-case、camelCase。 |
| 组件引用        | `getComponent({ref: 'ref'})` | 仅可用于已挂载组件的直接引用子组件。     |
| 单文件组件(SFC) | `getComponent(Component)`    | 直接传入已导入的组件。                   |

`Foo.vue`

```vue
<template>
  <div class="foo">Foo</div>
</template>

<script>
export default {
  name: 'Foo'
}
</script>
```

`Component.vue`:

```vue
<template>
  <Foo />
</template>

<script>
import Foo from '@/Foo'

export default {
  components: { Foo }
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

import Foo from '@/Foo.vue'

test('getComponent', () => {
  const wrapper = mount(Component)

  wrapper.getComponent({ name: 'foo' }) // returns a VueWrapper
  wrapper.getComponent(Foo) // returns a VueWrapper

  expect(() => wrapper.getComponent('.not-there')).toThrowError()
})
```

### html

返回元素的 HTML 内容。

默认情况下，输出会使用 [`js-beautify`](https://github.com/beautify-web/js-beautify) 进行格式化，以使快照更易读。如果需要未格式化的 HTML 字符串，可以使用 `raw: true` 选项。

**签名:**

```ts
html(): string
html(options?: { raw?: boolean }): string
```

**详细信息:**

`Component.vue`:

```vue
<template>
  <div>
    <p>Hello world</p>
  </div>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('html', () => {
  const wrapper = mount(Component)

  expect(wrapper.html()).toBe('<div>\n' + '  <p>Hello world</p>\n' + '</div>')

  expect(wrapper.html({ raw: true })).toBe('<div><p>Hello world</p></div>')
})
```

### isVisible

验证一个元素是否可见。

**签名:**

```ts
isVisible(): boolean
```

**详细信息:**

::: warning
`isVisible()` 仅在使用 [`attachTo`](#attachTo) 将包装器附加到 DOM 时才能正确工作。
:::

```js
const Component = {
  template: `<div v-show="false"><span /></div>`
}

test('isVisible', () => {
  const wrapper = mount(Component, {
    attachTo: document.body
  })

  expect(wrapper.find('span').isVisible()).toBe(false)
})
```

### props

返回传递给 Vue 组件的属性（props）。

**签名:**

```ts
props(): { [key: string]: any }
props(selector: string): any
props(selector?: string): { [key: string]: any } | any
```

**详细信息:**

`Component.vue`:

```js
export default {
  name: 'Component',
  props: {
    truthy: Boolean,
    object: Object,
    string: String
  }
}
```

```vue
<template>
  <Component truthy :object="{}" string="string" />
</template>

<script>
import Component from '@/Component'

export default {
  components: { Component }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('props', () => {
  const wrapper = mount(Component, {
    global: { stubs: ['Foo'] }
  })

  const foo = wrapper.getComponent({ name: 'Foo' })

  expect(foo.props('truthy')).toBe(true)
  expect(foo.props('object')).toEqual({})
  expect(foo.props('notExisting')).toEqual(undefined)
  expect(foo.props()).toEqual({
    truthy: true,
    object: {},
    string: 'string'
  })
})
```

:::tip
根据经验，测试传递的属性的效果（如 DOM 更新、触发的事件等）。这将使测试比仅仅断言一个属性被传递要更有效。
:::

### setData

更新组件内部数据。

**签名:**

```ts
setData(data: Record<string, any>): Promise<void>
```

**详细信息:**

`setData` 不允许设置组件中未定义的新属性。

::: warning
请注意，`setData` 不会修改组合式 API 中 setup() 的数据。
:::

`Component.vue`:

```vue
<template>
  <div>Count: {{ count }}</div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('setData', async () => {
  const wrapper = mount(Component)
  expect(wrapper.html()).toContain('Count: 0')

  await wrapper.setData({ count: 1 })

  expect(wrapper.html()).toContain('Count: 1')
})
```

::: warning
在调用 `setData` 时，您应该使用 `await`，以确保 Vue 在您进行断言之前更新 DOM。
:::

### setProps

更新组件的属性。

**签名:**

```ts
setProps(props: Record<string, any>): Promise<void>
```

**详细信息:**

`Component.vue`:

```vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  props: ['message']
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('updates prop', async () => {
  const wrapper = mount(Component, {
    props: {
      message: 'hello'
    }
  })

  expect(wrapper.html()).toContain('hello')

  await wrapper.setProps({ message: 'goodbye' })

  expect(wrapper.html()).toContain('goodbye')
})
```

::: warning
在调用 `setProps` 时，您应该使用 `await`，以确保 Vue 在您进行断言之前更新 DOM。
:::

### setValue

在 DOM 元素上设置一个值，包括：

- `<input>`
  - 会检测 `type="checkbox"` 和 `type="radio"`，并将 `element.checked` 设置为相应的值。
- `<select>`
  - 会检测 `<option>`，并将 `element.selected` 设置为相应的值。

**签名:**

```ts
setValue(value: unknown, prop?: string): Promise<void>
```

**详细信息:**

`Component.vue`:

```vue
<template>
  <input type="text" v-model="text" />
  <p>Text: {{ text }}</p>

  <input type="checkbox" v-model="checked" />
  <div v-if="checked">The input has been checked!</div>

  <select v-model="multiselectValue" multiple>
    <option value="value1"></option>
    <option value="value2"></option>
    <option value="value3"></option>
  </select>
</template>

<script>
export default {
  data() {
    return {
      text: '',
      checked: false,
      multiselectValue: []
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('setValue on checkbox', async () => {
  const wrapper = mount(Component)

  await wrapper.find('input[type="checkbox"]').setValue(true)
  expect(wrapper.find('div').exists()).toBe(true)

  await wrapper.find('input[type="checkbox"]').setValue(false)
  expect(wrapper.find('div').exists()).toBe(false)
})

test('setValue on input text', async () => {
  const wrapper = mount(Component)

  await wrapper.find('input[type="text"]').setValue('hello!')
  expect(wrapper.find('p').text()).toBe('Text: hello!')
})

test('setValue on multi select', async () => {
  const wrapper = mount(Component)

  // For select without multiple
  await wrapper.find('select').setValue('value1')
  // For select with multiple
  await wrapper.find('select').setValue(['value1', 'value3'])
})
```

::: warning
在调用 `setValue` 时，您应该使用 `await`，以确保 Vue 在您进行断言之前更新 DOM。
:::

### text

返回元素的文本内容。

**签名:**

```ts
text(): string
```

**详细信息:**

`Component.vue`:

```vue
<template>
  <p>Hello world</p>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('text', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('p').text()).toBe('Hello world')
})
```

### trigger

触发一个 DOM 事件，例如 `click`、`submit` 或 `keyup`。

**签名:**

```ts
interface TriggerOptions {
  code?: String
  key?: String
  keyCode?: Number
  [custom: string]: any
}

trigger(eventString: string, options?: TriggerOptions | undefined): Promise<void>
```

**详细信息:**

`Component.vue`:

```vue
<template>
  <span>Count: {{ count }}</span>
  <button @click="count++">Click me</button>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('trigger', async () => {
  const wrapper = mount(Component)

  await wrapper.find('button').trigger('click')

  expect(wrapper.find('span').text()).toBe('Count: 1')
})
```

请注意，`trigger` 接受第二个参数，以便将选项传递给触发的事件：

```js
await wrapper.trigger('keydown', { keyCode: 65 })
```

::: warning
在调用 `trigger` 时，您应该使用 `await`，以确保 Vue 在您进行断言之前更新 DOM。
:::

::: warning
某些事件，例如单击复选框以更改其 `v-model`，仅在测试使用 `attachTo: document.body` 时有效。否则，`change` 事件将不会被触发，`v-model` 的值也不会改变。
:::

### unmount

从 DOM 中卸载应用程序。

**签名:**

```ts
unmount(): void
```

**详细信息:**

它仅适用于从 `mount` 返回的根 `VueWrapper`。在测试后进行手动清理时非常有用。

`Component.vue`:

```vue
<script>
export default {
  unmounted() {
    console.log('unmounted!')
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('unmount', () => {
  const wrapper = mount(Component)

  wrapper.unmount()
  // Component is removed from DOM.
  // console.log has been called with 'unmounted!'
})
```

## Wrapper properties

### vm

**签名:**

```ts
vm: ComponentPublicInstance
```

**详细信息:**

`Vue` 应用实例。您可以访问所有的 [实例方法](https://v3.vuejs.org/api/instance-methods.html) 和 [实例属性](https://v3.vuejs.org/api/instance-properties.html)。

请注意，`vm` 仅在 `VueWrapper` 上可用。

:::tip
根据经验，测试传递的属性的效果（如 DOM 更新、触发的事件等）。这将使测试比仅仅断言一个属性被传递要更有效。
:::

## shallowMount

创建一个包含已挂载（mounted）和渲染（rendered）的 Vue 组件的包装器（Wrapper）。

**签名:**

```ts
interface MountingOptions<Props, Data = {}> {
  attachTo?: Element | string
  attrs?: Record<string, unknown>
  data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
  props?: (RawProps & Props) | ({} extends Props ? null : never)
  slots?: { [key: string]: Slot } & { default?: Slot }
  global?: GlobalMountOptions
}

function shallowMount(Component, options?: MountingOptions): VueWrapper
```

**详细信息:**

`shallowMount` 的行为与 `mount` 完全相同，但它默认会 stub（替代）所有的子组件。实际上，`shallowMount(Component)` 是 `mount(Component, { shallow: true })` 的别名。

## enableAutoUnmount

**签名:**

```ts
enableAutoUnmount(hook: (callback: () => void) => void);
disableAutoUnmount(): void;
```

**详细信息:**

`enableAutoUnmount` 允许自动销毁 Vue Wrapper。销毁逻辑作为回调函数传递给 `hook` 函数。常见用法是将 `enableAutoUnmount` 与测试框架提供的清理辅助函数结合使用，例如 `afterEach`：

```ts
import { enableAutoUnmount } from '@vue/test-utils'

enableAutoUnmount(afterEach)
```

如果您希望这种行为仅在测试套件的特定子集内生效，并且想要显式禁用此行为，则可以使用 `disableAutoUnmount`。

## flushPromises

**签名:**

```ts
flushPromises(): Promise<unknown>
```

**详细信息:**

`flushPromises` 会刷新所有已解析的 Promise 处理程序。这有助于确保在进行断言之前，异步操作（如 Promise 或 DOM 更新）已经完成。

您可以查看 [发起 HTTP 请求](../guide/advanced/http-requests.md) 来了解 `flushPromises` 的实际使用示例。

## config

### config.global

**签名:**

```ts
type GlobalMountOptions = {
  plugins?: (Plugin | [Plugin, ...any[]])[]
  config?: Partial<Omit<AppConfig, 'isNativeTag'>>
  mixins?: ComponentOptions[]
  mocks?: Record<string, any>
  provide?: Record<any, any>
  components?: Record<string, Component | object>
  directives?: Record<string, Directive>
  stubs?: Stubs = Record<string, boolean | Component> | Array<string>
  renderStubDefaultSlot?: boolean
}
```

**详细信息:**

您可以选择在整个测试套件中配置挂载选项，而不是在每个测试中单独配置。这些配置将在每次 `mount` 组件时默认使用。如果需要，您可以在每个测试中覆盖这些默认设置。

**Example :**

全局模拟来可能是自 vue-i18n 的 `$t` 变量和一个组件：

`Component.vue`:

```vue
<template>
  <p>{{ $t('message') }}</p>
  <my-component />
</template>

<script>
import MyComponent from '@/components/MyComponent'

export default {
  components: {
    MyComponent
  }
}
</script>
```

`Component.spec.js`:

```js {1,8-10,12-14}
import { config, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

const MyComponent = defineComponent({
  template: `<div>My component</div>`
})

config.global.stubs = {
  MyComponent
}

config.global.mocks = {
  $t: (text) => text
}

test('config.global mocks and stubs', () => {
  const wrapper = mount(Component)

  expect(wrapper.html()).toBe('<p>message</p><div>My component</div>')
})
```

::: tip
请记住，这种行为是全局性的，而不是逐次挂载的。您可能需要在每个测试之前和之后启用/禁用它。
:::

## components

### RouterLinkStub

一个用于替代 Vue Router 的 `router-link` 的组件，当您不想模拟或包含完整路由时，可以使用它。

您可以使用此组件在渲染树中查找 `router-link` 组件。

**Usage:**

在挂载选项中设置为替换组件(stub)：

```js
import { mount, RouterLinkStub } from '@vue/test-utils'

const wrapper = mount(Component, {
  global: {
    stubs: {
      RouterLink: RouterLinkStub
    }
  }
})

expect(wrapper.findComponent(RouterLinkStub).props().to).toBe('/some/path')
```

**使用插槽:**

`RouterLinkStub` 组件支持插槽内容，并将为其插槽属性返回非常基本的值。如果您需要更具体的插槽属性值进行测试，考虑使用 [真实路由](../guide/advanced/vue-router.html#using-a-real-router)，这样您可以使用真实的 `router-link` 组件。或者，您可以通过复制 test-utils 包中的实现来定义自己的 `RouterLinkStub` 组件。
