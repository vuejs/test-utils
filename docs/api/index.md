# API Reference

## `mount()`

Creates a Wrapper that contains the mounted and rendered Vue component to test.

```js
import { mount } from '@vue/test-utils'

const Hello = {
  template: '<div>Hello world</div>'
}

test('mounts a component', () => {
  const wrapper = mount(Hello)

  expect(wrapper.html()).toContain('Hello world')
})
```

## `mount()` options

`mount` accepts a second parameter where you can predefine the component's state.

### `attachTo`

Specify where to mount the component. Useful when testing Vue as part of a larger application.

Can be a valid CSS selector, or an [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element) connected to the document.

`Component.vue`

```vue
<template>
  <div>Vue Component</div>
</template>

<script>
export default {}
</script>
```

`Component.spec.js`:

```js
test('mounts on a specific element', () => {
  // in a JSDOM environment, such as Jest
  document.body.innerHTML = `
    <div>
      <h1>Non Vue app</h1>
      <div id="app"></div>
    </div>
  `
  const wrapper = mount(Component, {
    attachTo: document.getElementById('app')
  })

  console.log(document.body.innerHTML)
  /*
   * <div>
   *   <h1>Non Vue app</h1>
   *   <div>Vue Component</div>
   * </div>
   */
})
```

### `attrs`

Assigns attributes to component.

```js
test('assigns extra attributes on components', () => {
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

Notice that setting a prop will always trump an attribute:

```js
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

### teleportTarget

An array or single item of html elements or query selector strings, where the test utils should locate your component when you're using the [<teleport>](https://v3.vuejs.org/guide/teleport.html) component.

```js
// todo - teleport
```

### `data`

Overrides a component's default `data`. Must be a function.

`Component.vue`

```vue
<template>
  <div>Foo is {{ foo }}</div>
</template>

<script>
export default {
  data() {
    return {
      foo: 'foo'
    }
  }
}
</script>
```

`Component.spec.js`:

```js
test('overrides data', () => {
  const wrapper = mount(Component, {
    data() {
      return {
        foo: 'bar'
      }
    }
  })

  expect(wrapper.html()).toContain('Foo is bar')
})
```

### `props`

Used to set props on a component when mounted.

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
test('props', () => {
  const wrapper = mount(Component, {
    props: {
      count: 5
    }
  })

  expect(wrapper.html()).toContain('Count: 5')
})
```

### `slots`

Provide values for slots on a component. Slots can be a component imported from a `.vue` file or a render function. Currently providing an object with a `template` key is not supported. This may be supported in the future.

`Component.vue`:

```vue
<template>
  <slot name="foo" />
  <slot />
  <slot name="bar" />
</template>
```

`Component.spec.js`:

```js
import Bar from './Bar.vue'

test('renders slots content', () => {
  const wrapper = mount(Component, {
    slots: {
      default: 'Default',
      foo: h('h1', {}, 'Named Slot'),
      bar: Bar
    }
  })

  console.log(wrapper.html()) //=> '<h1>Named Slot</h1>Default<div>Bar</div>'
})
```

### `global.components`

Registers components globally to all components

`Component.spec.js`:

```js
import GlobalComponent from '@/components/GlobalComponent'

test('installs a component globally', () => {
  const Component = {
    template: '<div><global-component/></div>'
  }

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

### `global.directives`

Registers a directive globally to all components

`Component.spec.js`:

```js
import Directive from '@/directives/Directive'

test('installs a directive globally', () => {
  const Component = {
    template: '<div v-bar>Foo</div>'
  }

  const wrapper = mount(Component, {
    global: {
      directives: {
        Bar: Directive
      }
    }
  })

  expect(wrapper.classes()).toContain('added-by-bar')
})
```

### `global.mixins`

Applies mixins via `app.mixin(...)`.

`Component.spec.js`:

```js
test('adds a lifecycle mixin', () => {
  const mixin = {
    created() {
      console.log('Component was created!')
    }
  }

  const Component = { template: '<div></div>' }

  const wrapper = mount(Component, {
    global: {
      mixins: [mixin]
    }
  })

  // 'Component was created!' will be logged
})
```

### `global.mocks`

Mocks a global instance property. Can be used for mocking out `this.$store`, `this.$router` etc.

::: warning
This is designed to mock variables injected by third party plugins, not Vue's native properties such as $root, $children, etc.
:::

`Component.vue`:

```vue
<template>
  <p>{{ count }}</p>
  <button @click="increment" />
</template>

<script>
export default {
  computed: {
    count() {
      return this.$store.state.count
    }
  },

  methods: {
    increment() {
      this.$store.dispatch('inc')
    }
  }
}
</script>
```

`Component.spec.js`:

```js
test('mocks a vuex store', async () => {
  const $store = {
    state: { count: 1 },
    dispatch: jest.fn()
  }

  const wrapper = mount(Component, {
    global: {
      mocks: {
        $store
      }
    }
  })

  expect(wrapper.html()).toContain('count: 1')

  await wrapper.find('button').trigger('click')

  expect($store.dispatch).toHaveBeenCalledWith('inc')
})
```

### `global.plugins`

Installs plugins on the component.

`Component.vue`:

```vue
<template>
  <div />
</template>

<script>
export default {}
</script>
```

`Component.spec.js`:

```js
test('installs a plugin via `plugins`', () => {
  const installed = jest.fn()
  class Plugin {
    static install() {
      installed()
    }
  }
  const options = { option1: true }
  const testString = 'hello'
  mount(Component, {
    global: {
      plugins: [Plugin]
    }
  })

  expect(installed).toHaveBeenCalled()
})
```

To use plugin with options, an array of options can be passed.

`Component.spec.js`:

```js
test('installs plugins with and without options', () => {
  const installed = jest.fn()
  class Plugin {
    static install() {
      installed()
    }
  }

  const installedWithOptions = jest.fn()
  class PluginWithOptions {
    static install(_app: App, ...args) {
      installedWithOptions(...args)
    }
  }

  const Component = {
    render() {
      return h('div')
    }
  }
  mount(Component, {
    global: {
      plugins: [Plugin, [PluginWithOptions, 'argument 1', 'another argument']]
    }
  })

  expect(installed).toHaveBeenCalled()
  expect(installedWithOptions).toHaveBeenCalledWith(
    'argument 1',
    'another argument'
  )
})
```

### `global.provide`

Provides data to be received in a `setup` function via `inject`.

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
test('injects dark theme via provide mounting option', () => {
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

Note: If you are using a ES6 `Symbol` for your provide key, you can use it as a dynamic key:

`Component.spec.js`:

```js
const ThemeSymbol = Symbol()

mount(Component, {
  global: {
    provide: {
      [ThemeSymbol]: 'value'
    }
  }
})
```

### `global.stubs`

Stubs a component for all Vue Instances.

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
test('stubs a component using an array', () => {
  const wrapper = mount(Component, {
    global: {
      stubs: ['Foo']
    }
  })

  expect(wrapper.html()).toEqual('<div><foo-stub></div>')
})

test('stubs a component using an Object boolean syntax', () => {
  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: true }
    }
  })

  expect(wrapper.html()).toEqual('<div><foo-stub></div>')
})

test('stubs a component using a custom component', () => {
  const FooMock = {
    name: 'Foo',
    template: 'FakeFoo'
  }
  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: FooMock }
    }
  })

  expect(wrapper.html()).toEqual('<div>FakeFoo</div>')
})
```

### `global.config`

Configures [Vue's application global configuration](https://v3.vuejs.org/api/application-config.html#application-config).

### `global.renderStubDefaultSlot`

Renders the `default` slot content, even when using `shallow` or `shallowMount`.

Due to technical limitations, this behavior cannot be extended to slots other than the default one.

```js
import { config, mount } from '@vue/test-utils'

beforeAll(() => {
  config.renderStubDefaultSlot = true
})

afterAll(() => {
  config.renderStubDefaultSlot = false
})

test('shallow with stubs', () => {
  const Component = {
    template: `<div><slot /></div>`
  }

  const wrapper = mount(Component, {
    shallow: true
  })

  expect(wrapper.html()).toContain('Content from the default slot')
})
```

::: tip
This behavior is global, not on a mount by mount basis. Remember to enable/disable it before and after each test.
:::

### `shallow`

Stubs out out all child components from the components under testing.

```js
test('stubs all components automatically using { shallow: true }', () => {
  const Component = {
    template: `
      <custom-component />
      <another-component />
    `,
    components: {
      CustomComponent,
      AnotherComponent
    }
  }

  const wrapper = mount(Component, { shallow: true })

  expect(wrapper.html()).toEqual(
    `<custom-component-stub></custom-component-stub><another-component></another-component>`
  )
}
```

::: tip
`shallowMount` is an alias to mounting a component with `shallow: true`.
:::

## Wrapper methods

When you use `mount`, a `VueWrapper` is returned with a number of useful methods for testing. A `VueWrapper` is a thin wrapper around your component instance. Methods like `find` return a `DOMWrapper`, which is a thin wrapper around the DOM nodes in your component and it's children. Both implement a similar same API.

### `attributes`

Returns attributes on a DOM node (via `element.attributes`).

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
test('attributes', () => {
  const wrapper = mount(Component)

  expect(wrapper.attributes('id')).toBe('foo')
  expect(wrapper.attributes('class')).toBe('bar')
})
```

### `classes`

Returns an array of classes on an element (via `classList`).

`Component.vue`:

```vue
<template>
  <div>
    <span class="my-span" />
  </div>
</template>
```

`Component.spec.js`:

```js
test('classes', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('.my-span').classes()).toContain('my-span')
})
```

### `emitted`

A function that returns an object mapping events emitted from the `wrapper`. The arguments are stored in an array, so you can verify which arguments were emitted along with each event.

`Component.vue`:

```vue
<template>
  <div />
</template>

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
test('emitted', () => {
  const wrapper = mount(Component)

  console.log(wrapper.emitted())
  // {
  //   greet: [ ['hello'], ['goodbye'] ]
  // }

  expect(wrapper.emitted()).toHaveProperty('greet')
  expect(wrapper.emitted().greet[0]).toEqual(['hello'])
  expect(wrapper.emitted().greet[1]).toEqual(['goodbye'])
})
```

### `exists`

Verify whether or not an element found via `find` exists or not.

`Component.vue`:

```vue
<template>
  <div>
    <span />
  </div>
</template>
```

`Component.spec.js`:

```js
test('exists', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('span').exists()).toBe(true)
  expect(wrapper.find('p').exists()).toBe(false)
})
```

### `find`

Finds an element and returns a `DOMWrapper` if one is found. You can use the same syntax `querySelector` implements - `find` is basically an alias for `querySelector`.

`Component.vue`:

```vue
<template>
  <div>
    <span>Span</span>
    <span data-test="span">Span</span>
  </div>
</template>
```

`Component.spec.js`:

```js
test('find', () => {
  const wrapper = mount(Component)

  wrapper.find('span') //=> found; returns DOMWrapper
  wrapper.find('[data-test="span"]') //=> found; returns DOMWrapper
  wrapper.find('p') //=> nothing found; returns ErrorWrapper
})
```

### `findAll`

Similar to `find`, but instead returns an array of `DOMWrapper`.

`Component.vue`:

```vue
<template>
  <div>
    <span v-for="number in [1, 2, 3]" :key="number" data-test="number">
      {{ number }}
    </span>
  </div>
</template>
```

`Component.spec.js`:

```js
test('findAll', () => {
  const wrapper = mount(Component)

  wrapper.findAll('[data-test="number"]') //=> found; returns array of DOMWrapper
})
```

### `findComponent`

Finds a Vue Component instance and returns a `VueWrapper` if one is found, otherwise returns `ErrorWrapper`.

**Supported syntax:**

- **querySelector** - `findComponent('.component')` - Matches standard query selector.
- **Name** - `findComponent({ name: 'myComponent' })` - matches PascalCase, snake-case, camelCase
- **ref** - `findComponent({ ref: 'dropdown' })` - Can be used only on direct ref children of mounted component
- **SFC** - `findComponent(ImportedComponent)` - Pass an imported component directly.

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
  <div>
    <span>Span</span>
    <Foo data-test="foo" ref="foo" />
  </div>
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
import Foo from '@/Foo.vue'

test('findComponent', () => {
  const wrapper = mount(Component)

  // All the following queries would return a VueWrapper

  // Using a standard querySelector query
  wrapper.findComponent('.foo')
  wrapper.findComponent('[data-test="foo"]')

  // Using component's name
  wrapper.findComponent({ name: 'Foo' })

  // Using ref attribute. Can be used only on direct children of the mounted component
  wrapper.findComponent({ ref: 'foo' })

  // Using imported component
  wrapper.findComponent(Foo)
})
```

### `findAllComponents`

Similar to `findComponent` but finds all Vue Component instances that match the query. Returns an array of `VueWrapper`.

:::warning
`Ref` syntax is not supported in `findAllComponents`. All other query syntaxes are valid.
:::

`Component.vue`:

```vue
<template>
  <div>
    <FooComponent v-for="number in [1, 2, 3]" :key="number" data-test="number">
      {{ number }}
    </FooComponent>
  </div>
</template>
```

`Component.spec.js`:

```js
test('findAllComponents', () => {
  const wrapper = mount(Component)

  // Returns an array of VueWrapper
  wrapper.findAllComponents('[data-test="number"]')
})
```

### `get`

Similar to `find`, `get` looks for an element and returns a `DOMWrapper` if one is found. Otherwise it throws an error. As a rule of thumb, always use get except when you are asserting something doesn't exist. In that case use [`find`](#find).

`Component.vue`:

```vue
<template>
  <span>Span</span>
  <span data-test="span">Span</span>
</template>
```

`Component.spec.js`:

```js
test('get', () => {
  const wrapper = mount(Component)

  wrapper.get('span') //=> found; returns DOMWrapper
  wrapper.get('[data-test="span"]') //=> found; returns DOMWrapper, fails if no matching element is found
})
```

### `getComponent`

Similar to `findComponent`, `getComponent` looks for a Vue Component instance and returns a `VueWrapper` if one is found. Otherwise it throws an error.

**Supported syntax:**

- **querySelector** - `getComponent('.component')` - Matches standard query selector.
- **Name** - `getComponent({ name: 'myComponent' })` - matches PascalCase, snake-case, camelCase
- **ref** - `getComponent({ ref: 'dropdown' })` - Can be used only on direct ref children of mounted component
- **SFC** - `getComponent(ImportedComponent)` - Pass an imported component directly.

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
import Foo from '@/Foo.vue'

test('getComponent', () => {
  const wrapper = mount(Component)

  wrapper.getComponent({ name: 'foo' }) // returns a VueWrapper
  wrapper.getComponent(Foo) // returns a VueWrapper

  expect(() => wrapper.getComponent('.not-there')).toThrowError()
})
```

### `html`

Returns the HTML (via `outerHTML`) of an element. Useful for debugging.

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
test('html', () => {
  const wrapper = mount(Component)

  console.log(wrapper.html()) //=> <div><p>Hello world</p></div>
})
```

### `isVisible`

Verify whether or not a found element is visible or not.

```js
test('isVisible', () => {
  const Comp = {
    template: `<div v-show="false"><span /></div>`
  }
  const wrapper = mount(Comp)

  expect(wrapper.find('span').isVisible()).toBe(false)
})
```

### `props`

Returns props applied on a Vue Component. This should be used mostly to assert props applied to a stubbed component.

**Note:** Props on a normally mounted Vue Component should be asserted by their side effects on the DOM or other.

`Component.vue`:

```js
// Foo.vue
export default {
  name: 'Foo',
  props: {
    truthy: Boolean,
    object: Object,
    string: String
  }
}
```

```vue
<template>
  <div><foo truthy :object="{}" string="string" /></div>
</template>

<script>
import Foo from '@/Foo'

export default {
  components: { Foo }
}
</script>
```

`Component.spec.js`:

```js
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

### `setData`

Updates component data.

::: tip
You should use `await` when you call `setData` to ensure that Vue updates the DOM before you make an assertion.
:::

`Component.vue`:

```js
test('updates component data', async () => {
  const Component = {
    template: '<div>Count: {{ count }}</div>',
    data: () => ({ count: 0 })
  }

  const wrapper = mount(Component)
  expect(wrapper.html()).toContain('Count: 0')

  await wrapper.setData({ count: 1 })

  expect(wrapper.html()).toContain('Count: 1')
})
```

Notice that `setData` does not allow setting new properties that are not
defined in the component.

Also, notice that `setData` does not modify composition API `setup()` data.

### `setProps`

Updates component props.

::: tip
You should use `await` when you call `setProps` to ensure that Vue updates the DOM before you make an assertion.
:::

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

### `setValue`

Sets a value on DOM element. Including:

- `<input>`
  - `type="checkbox"` and `type="radio"` are detected and will have `element.checked` set
- `<select>`
  - `<option>` is detected and will have `element.selected` set

::: tip
You should use `await` when you call `setValue` to ensure that Vue updates the DOM before you make an assertion.
:::

`Component.vue`:

```vue
<template>
  <input type="checkbox" v-model="checked" />
  <div v-if="checked">The input has been checked!</div>
</template>

<script>
export default {
  data() {
    return {
      checked: false
    }
  }
}
</script>
```

`Component.spec.js`:

```js
test('checked', async () => {
  const wrapper = mount(Component)

  await wrapper.find('input').setValue(true)
  expect(wrapper.find('div')).toBe(true)

  await wrapper.find('input').setValue(false)
  expect(wrapper.find('div')).toBe(false)
})
```

### `text`

Returns the text (via `textContent`) of an element.

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
test('text', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('p').text()).toBe('Hello world')
})
```

### `trigger`

::: tip
Since events often cause a re-render, `trigger` returns `Vue.nextTick`. You should use `await` when you call `trigger` to ensure that Vue updates the DOM before you make an assertion.
:::

Triggers a DOM event, for example `click`, `submit` or `keyup`.

`Component.vue`:

```vue
<template>
  <div>
    <span>Count: {{ count }}</span>
    <button @click="count++">Click me</button>
  </div>
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

### `unmount`

Unmount the application from the DOM via Vue's `unmount` method. Only works on the root `VueWrapper` returned from `mount`. Useful for manual clean-up after tests.

`Component.vue`:

```vue
<template>
  <div />
</template>
```

`Component.spec.js`:

```js
test('unmount', () => {
  const wrapper = mount(Component)

  wrapper.unmount() // removed from DOM
})
```

## Wrapper properties

### `vm`

This is the `Vue` instance. You can access all of the [instance methods and properties of a vm](https://v3.vuejs.org/api/instance-properties.html) with `wrapper.vm`. This only exists on `VueWrapper`.
