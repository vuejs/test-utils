---
sidebar: auto
---

# API Reference

## mount

Creates a Wrapper that contains the mounted and rendered Vue component to test.
Note that when mocking dates/timers with Vitest, this must be called after
`vi.setSystemTime`.

**Signature:**

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

**Details:**

`mount` is the main method exposed by Vue Test Utils. It creates a Vue 3 app that holds and renders the Component under testing. In return, it creates a wrapper to act and assert against the Component.

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

Notice that `mount` accepts a second parameter to define the component's state configuration.

**Example : mounting with component props and a Vue App plugin**

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

Among component state, you can configure the aformentioned Vue 3 app by the [`MountingOptions.global` config property.](#global) This would be useful for providing mocked values which your components expect to have available.

::: tip
If you find yourself having to set common App configuration for many of your tests, then you can set configuration for your entire test suite using the exported [`config` object.](#config)
:::

### attachTo

Specify the node to mount the component on. This is not available when using `renderToString`.

**Signature:**

```ts
attachTo?: Element | string
```

**Details:**

Can be a valid CSS selector, or an [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element) connected to the document.

Note that the component is appended to the node, it doesn't replace the whole content of the node. If you mount the component on the same node in multiple tests - make sure to unmount it after each test by calling `wrapper.unmount()`, this will remove the rendered elements from the node.

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

Sets HTML attributes to component.

**Signature:**

```ts
attrs?: Record<string, unknown>
```

**Details:**

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

Notice that setting a defined prop will always trump an attribute:

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

Overrides a component's default `data`. Must be a function.

**Signature:**

```ts
data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
```

**Details:**

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

Sets props on a component when mounted.

**Signature:**

```ts
props?: (RawProps & Props) | ({} extends Props ? null : never)
```

**Details:**

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

Sets values for slots on a component.

**Signature:**

```ts
type Slot = VNode | string | { render: Function } | Function | Component

slots?: { [key: string]: Slot } & { default?: Slot }
```

**Details:**

Slots can be a string or any valid component definition either imported from a `.vue` file or provided inline

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
import { h } from 'vue';
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

**Signature:**

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

You can configure all the `global` options on both a per test basis and also for the entire test suite. [See here for how to configure project wide defaults](#config-global).

#### global.components

Registers components globally to the mounted component.

**Signature:**

```ts
components?: Record<string, Component | object>
```

**Details:**

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

Configures [Vue's application global configuration](https://v3.vuejs.org/api/application-config.html#application-config).

**Signature:**

```ts
config?: Partial<Omit<AppConfig, 'isNativeTag'>>
```

#### global.directives

Registers a [directive](https://v3.vuejs.org/api/directives.html#directives) globally to the mounted component.

**Signature:**

```ts
directives?: Record<string, Directive>
```

**Details:**

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

Registers a [mixin](https://v3.vuejs.org/guide/mixins.html) globally to the mounted component.

**Signature:**

```ts
mixins?: ComponentOptions[]
```

**Details:**

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

Mocks a global instance property. Can be used for mocking out `this.$store`, `this.$router` etc.

**Signature:**

```ts
mocks?: Record<string, any>
```

**Details:**

::: warning
This is designed to mock variables injected by third party plugins, not Vue's native properties such as $root, $children, etc.
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

Installs plugins on the mounted component.

**Signature:**

```ts
plugins?: (Plugin | [Plugin, ...any[]])[]
```

**Details:**

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

To use plugin with options, an array of options can be passed.

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

Provides data to be received in a `setup` function via `inject`.

**Signature:**

```ts
provide?: Record<any, any>
```

**Details:**

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

If you are using a ES6 `Symbol` for your provide key, you can use it as a dynamic key:

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

Renders the `default` slot content, even when using `shallow` or `shallowMount`.

**Signature:**

```ts
renderStubDefaultSlot?: boolean
```

**Details:**

Defaults to **false**.

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

Due to technical limitations, **this behavior cannot be extended to slots other than the default one**.

#### global.stubs

Sets a global stub on the mounted component.

**Signature:**

```ts
stubs?: Record<any, any>
```

**Details:**

It stubs `Transition` and `TransitionGroup` by default.

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

Stubs out all child components from the component.

**Signature:**

```ts
shallow?: boolean
```

**Details:**

Defaults to **false**.

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
    `<a-component-stub></a-component-stub><another-component></another-component>`
  )
}
```

::: tip
`shallowMount()` is an alias to mounting a component with `shallow: true`.
:::

## Wrapper methods

When you use `mount`, a `VueWrapper` is returned with a number of useful methods for testing. A `VueWrapper` is a thin wrapper around your component instance.

Notice that methods like `find` return a `DOMWrapper`, which is a thin wrapper around the DOM nodes in your component and its children. Both implement a similar API.

### attributes

Returns attributes on a DOM node.

**Signature:**

```ts
attributes(): { [key: string]: string }
attributes(key: string): string
attributes(key?: string): { [key: string]: string } | string
```

**Details:**

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

**Signature:**

```ts
classes(): string[]
classes(className: string): boolean
classes(className?: string): string[] | boolean
```

**Details:**

Returns an array of classes on an element.

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

Returns all the emitted events from the Component.

**Signature:**

```ts
emitted<T = unknown>(): Record<string, T[]>
emitted<T = unknown>(eventName: string): undefined | T[]
emitted<T = unknown>(eventName?: string): undefined | T[] | Record<string, T[]>
```

**Details:**

The arguments are stored in an array, so you can verify which arguments were emitted along with each event.

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

Verify whether an element exists or not.

**Signature:**

```ts
exists(): boolean
```

**Details:**

You can use the same syntax `querySelector` implements.

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

Finds an element and returns a `DOMWrapper` if one is found.

**Signature:**

```ts
find<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>
find<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>
find<T extends Element>(selector: string): DOMWrapper<T>
find(selector: string): DOMWrapper<Element>
find<T extends Node = Node>(selector: string | RefSelector): DOMWrapper<T>;
```

**Details:**

You can use the same syntax `querySelector` implements. `find` is basically an alias for `querySelector`. In addition you can search for element refs.

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

Similar to `find`, but instead returns an array of `DOMWrapper`.

**Signature:**

```ts
findAll<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>[]
findAll<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>[]
findAll<T extends Element>(selector: string): DOMWrapper<T>[]
findAll(selector: string): DOMWrapper<Element>[]
```

**Details:**

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

Finds a Vue Component instance and returns a `VueWrapper` if found. Returns `ErrorWrapper` otherwise.

**Signature:**

```ts
findComponent<T extends never>(selector: string): WrapperLike
findComponent<T extends DefinedComponent>(selector: T | Exclude<FindComponentSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>
findComponent<T extends FunctionalComponent>(selector: T | string): DOMWrapper<Element>
findComponent<T extends never>(selector: NameSelector | RefSelector): VueWrapper
findComponent<T extends ComponentPublicInstance>(selector: T | FindComponentSelector): VueWrapper<T>
findComponent(selector: FindComponentSelector): WrapperLike
```

**Details:**

`findComponent` supports several syntaxes:

| syntax         | example                       | details                                                      |
| -------------- | ----------------------------- | ------------------------------------------------------------ |
| querySelector  | `findComponent('.component')` | Matches standard query selector.                             |
| Component name | `findComponent({name: 'a'})`  | matches PascalCase, snake-case, camelCase                    |
| Component ref  | `findComponent({ref: 'ref'})` | Can be used only on direct ref children of mounted component |
| SFC            | `findComponent(Component)`    | Pass an imported component directly                          |

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
If `ref` in component points to HTML element, `findComponent` will return empty wrapper. This is intended behaviour
:::

:::warning Usage with CSS selectors
Using `findComponent` with CSS selector might have confusing behavior

Consider this example:

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

The reason for such behavior is that `RootComponent` and `ChildComponent` are sharing same DOM node and only first matching component is included for each unique DOM node
:::

:::info WrapperLike type when using CSS selector
When using `wrapper.findComponent('.foo')` for example then VTU will return the `WrapperLike` type. This is because functional components
would need a `DOMWrapper` otherwise a `VueWrapper`. You can force to return a `VueWrapper` by providing the correct component type:

```typescript
wrapper.findComponent('.foo') // returns WrapperLike
wrapper.findComponent<typeof FooComponent>('.foo') // returns VueWrapper
wrapper.findComponent<DefineComponent>('.foo') // returns VueWrapper
```
:::

### findAllComponents

**Signature:**

```ts
findAllComponents<T extends never>(selector: string): WrapperLike[]
findAllComponents<T extends DefinedComponent>(selector: T | Exclude<FindAllComponentsSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>[]
findAllComponents<T extends FunctionalComponent>(selector: string): DOMWrapper<Element>[]
findAllComponents<T extends FunctionalComponent>(selector: T): DOMWrapper<Node>[]
findAllComponents<T extends never>(selector: NameSelector): VueWrapper[]
findAllComponents<T extends ComponentPublicInstance>(selector: T | FindAllComponentsSelector): VueWrapper<T>[]
findAllComponents(selector: FindAllComponentsSelector): WrapperLike[]
```

**Details:**

Similar to `findComponent` but finds all Vue Component instances that match the query. Returns an array of `VueWrapper`.

:::warning
`ref` syntax is not supported in `findAllComponents`. All other query syntaxes are valid.
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

:::warning Usage with CSS selectors
`findAllComponents` has same behavior when used with CSS selector as [findComponent](#findcomponent)
:::

### get

Gets an element and returns a `DOMWrapper` if found. Otherwise it throws an error.

**Signature:**

```ts
get<K extends keyof HTMLElementTagNameMap>(selector: K): Omit<DOMWrapper<HTMLElementTagNameMap[K]>, 'exists'>
get<K extends keyof SVGElementTagNameMap>(selector: K): Omit<DOMWrapper<SVGElementTagNameMap[K]>, 'exists'>
get<T extends Element>(selector: string): Omit<DOMWrapper<T>, 'exists'>
get(selector: string): Omit<DOMWrapper<Element>, 'exists'>
```

**Details:**

It is similar to `find`, but `get` throws instead of returning a ErrorWrapper.

As a rule of thumb, always use get except when you are asserting something doesn't exist. In that case use [`find`](#find).

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

Gets a Vue Component instance and returns a `VueWrapper` if found. Otherwise it throws an error.

**Signature:**

```ts
getComponent<T extends ComponentPublicInstance>(selector: new () => T): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: { name: string } | { ref: string } | string): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: any): Omit<VueWrapper<T>, 'exists'>
```

**Details:**

It is similar to `findComponent`, but `getComponent` throws instead of returning a ErrorWrapper.

**Supported syntax:**

| syntax         | example                      | details                                                      |
| -------------- | ---------------------------- | ------------------------------------------------------------ |
| querySelector  | `getComponent('.component')` | Matches standard query selector.                             |
| Component name | `getComponent({name: 'a'})`  | matches PascalCase, snake-case, camelCase                    |
| Component ref  | `getComponent({ref: 'ref'})` | Can be used only on direct ref children of mounted component |
| SFC            | `getComponent(Component)`    | Pass an imported component directly                          |

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

Returns the HTML of an element.

By default the output is formatted with [`js-beautify`](https://github.com/beautify-web/js-beautify)
to make snapshots more readable. Use `raw: true` option to receive the unformatted html string.

**Signature:**

```ts
html(): string
html(options?: { raw?: boolean }): string
```

**Details:**

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

  expect(wrapper.html()).toBe(
    '<div>\n' +
    '  <p>Hello world</p>\n' +
    '</div>'
  )

  expect(wrapper.html({ raw: true })).toBe('<div><p>Hello world</p></div>')
})
```

### isVisible

Verify whether an element is visible or not.

**Signature:**

```ts
isVisible(): boolean
```

**Details:**

::: warning
`isVisible()` only works correctly if the wrapper is attached to the DOM using [`attachTo`](#attachTo)
:::

```js
const Component = {
  template: `<div v-show="false"><span /></div>`
}

test('isVisible', () => {
  const wrapper = mount(Component, {
    attachTo: document.body
  });

  expect(wrapper.find('span').isVisible()).toBe(false);
})
```

### props

Returns props passed to a Vue Component.

**Signature:**

```ts
props(): { [key: string]: any }
props(selector: string): any
props(selector?: string): { [key: string]: any } | any
```

**Details:**

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
As a rule of thumb, test against the effects of a passed prop (a DOM update, an emitted event, and so on). This will make tests more powerful than simply asserting that a prop is passed.
:::

### setData

Updates component internal data.

**Signature:**

```ts
setData(data: Record<string, any>): Promise<void>
```

**Details:**

`setData` does not allow setting new properties that are not defined in the component.

::: warning
Also, notice that `setData` does not modify composition API `setup()` data.
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
You should use `await` when you call `setData` to ensure that Vue updates the DOM before you make an assertion.
:::

### setProps

Updates component props.

**Signature:**

```ts
setProps(props: Record<string, any>): Promise<void>
```

**Details:**

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
You should use `await` when you call `setProps` to ensure that Vue updates the DOM before you make an assertion.
:::

### setValue

Sets a value on DOM element. Including:

- `<input>`
  - `type="checkbox"` and `type="radio"` are detected and will have `element.checked` set.
- `<select>`
  - `<option>` is detected and will have `element.selected` set.

**Signature:**

```ts
setValue(value: unknown, prop?: string): Promise<void>
```

**Details:**

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
  expect(wrapper.find('div')).toBe(true)

  await wrapper.find('input[type="checkbox"]').setValue(false)
  expect(wrapper.find('div')).toBe(false)
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
You should use `await` when you call `setValue` to ensure that Vue updates the DOM before you make an assertion.
:::

### text

Returns the text content of an element.

**Signature:**

```ts
text(): string
```

**Details:**

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

Triggers a DOM event, for example `click`, `submit` or `keyup`.

**Signature:**

```ts
interface TriggerOptions {
  code?: String
  key?: String
  keyCode?: Number
  [custom: string]: any
}

trigger(eventString: string, options?: TriggerOptions | undefined): Promise<void>
```

**Details:**

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

Note that `trigger` accepts a second argument to pass options to the triggered Event:

```js
await wrapper.trigger('keydown', { keyCode: 65 })
```

::: warning
You should use `await` when you call `trigger` to ensure that Vue updates the DOM before you make an assertion.
:::

::: warning
Some events, like clicking on a checkbox to change its `v-model`,
will only work if the test uses `attachTo: document.body`.
Otherwise, the `change` event will not be triggered, and the `v-model` value does not change.
:::

### unmount

Unmount the application from the DOM.

**Signature:**

```ts
unmount(): void
```

**Details:**

It only works on the root `VueWrapper` returned from `mount`. Useful for manual clean-up after tests.

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

**Signature:**

```ts
vm: ComponentPublicInstance
```

**Details:**

The `Vue` app instance. You can access all of the [instance methods](https://v3.vuejs.org/api/instance-methods.html) and [instance properties](https://v3.vuejs.org/api/instance-properties.html).

Notice that `vm` is only available on a `VueWrapper`.

:::tip
As a rule of thumb, test against the effects of a passed prop (a DOM update, an emitted event, and so on). This will make tests more powerful than simply asserting that a prop is passed.
:::

## shallowMount

Creates a Wrapper that contains the mounted and rendered Vue component to test with all children stubbed out.

**Signature:**

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

**Details:**

`shallowMount` behaves exactly like `mount`, but it stubs all child components by default. Essentially, `shallowMount(Component)` is an alias of `mount(Component, { shallow: true })`.

## enableAutoUnmount

**Signature:**

```ts
enableAutoUnmount(hook: (callback: () => void) => void);
disableAutoUnmount(): void;
```

**Details:**

`enableAutoUnmount` allows to automatically destroy Vue wrappers. Destroy logic is passed as callback to `hook` Function.
Common usage is to use `enableAutoUnmount` with teardown helper functions provided by your test framework, such as `afterEach`:

```ts
import { enableAutoUnmount } from '@vue/test-utils'

enableAutoUnmount(afterEach)
```

`disableAutoUnmount` might be useful if you want this behavior only in specific subset of your test suite and you want to explicitly disable this behavior

## flushPromises

**Signature:**

```ts
flushPromises(): Promise<unknown>
```

**Details:**

`flushPromises` flushes all resolved promise handlers. This helps make sure async operations such as promises or DOM updates have happened before asserting against them.

Check out [Making HTTP requests](../guide/advanced/http-requests.md) to see an example of `flushPromises` in action.

## config

### config.global

**Signature:**

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

**Details:**

Instead of configuring mounting options on a per test basis, you can configure them for your entire test suite. These will be used by default every time you `mount` a component. If desired, you can then override your defaults on a per test basis.

**Example :**

An example might be globally mocking the `$t` variable from vue-i18n and a component:

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
Remember that this behavior is global, not on a mount by mount basis. You might need to enable/disable it before and after each test.
:::

## components

### RouterLinkStub

A component to stub the Vue Router `router-link` component when you don't want to mock or include a full router.

You can use this component to find a `router-link` component in the render tree.

**Usage:**

Set as a stub in the mounting options:
```js
import { mount, RouterLinkStub } from '@vue/test-utils'

const wrapper = mount(Component, {
  global: {
    stubs: {
      RouterLink: RouterLinkStub,
    },
  },
})

expect(wrapper.findComponent(RouterLinkStub).props().to).toBe('/some/path')
```

**Usage with slot:**

The `RouterLinkStub` component supports slot content and will return very basic values for its slot props. If you need more specific slot prop values for your tests, consider using a [real router](../guide/advanced/vue-router.html#using-a-real-router) so you can use a real `router-link` component. Alternatively, you can define your own `RouterLinkStub` component by copying the implementation from the test-utils package.
