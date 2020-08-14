# API Reference

## Mounting Options

When using `mount`, you can predefine the component's state using mounting options.

### `props`

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

```js
test('props', () => {
  const wrapper = mount(Component, {
    props: {
      count: 5
    }
  })

  console.log(wrapper.html()) //=> '<span>Count: 5</span>'
})
```

### `data`

Overrides a component's default `data`. Must be a function:

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

```js
test('overrides data', () => {
  const wrapper = mount(Component, {
    data() {
      return {
        foo: 'bar'
      }
    }
  })

  console.log(wrapper.html()) //=> '<div>Foo is bar</div>'
})
```

### `slots`

```vue
<template>
  <slot name="foo" />
  <slot />
</template>
```

```js
test('slots - default and named', () => {
  const wrapper = mount(Component, {
    slots: {
      default: 'Default',
      foo: h('h1', {}, 'Named Slot')
    }
  })

  console.log(wrapper.html()) //=> '<h1>Named Slot</h1>Default'
})
```

## `provides`

Provides data to be received in a `setup` function via `inject`.

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

```js
test('injects dark theme via provide mounting option', () => {
  const wrapper = mount(Component, {
    provides: {
      'Theme': 'dark'
    }
  })

  console.log(wrapper.html()) //=> <div>Theme is dark</div>
})
```

Note: If you are using a ES6 `Symbol` for your provide key, you can use it as a dynamic key:

```js
const ThemeSymbol = Symbol()

mount(Component, {
  provides: {
    [ThemeSymbol]: 'value'
  }
})
```
### Global
You can provide properties to the App instance using the properties under the `global` mount property
 
### `global.mixins`

Applies mixins via `app.mixin(...)`.

```vue
<template>
  <div />
</template>

<script>
export default {}
</script>
```

```js
test('adds a lifecycle mixin', () => {
  const mixin = {
    created() {
      console.log('Component was created!')
    }
  }

  const wrapper = mount(Component, {
    global: {
      mixins: [mixin]
    }
  })

  // 'Component was created!' will be logged
})
```

### `global.plugins`

Installs plugins on the component.

```vue
<template>
  <div />
</template>

<script>
export default {}
</script>
```

```js
test('installs a plugin via `plugins`', () => {
  const installed = jest.fn()
  class Plugin {
    static install(app: App, options?: any) {
      installed()
    }
  }
  const Component = {
    render() { return h('div') }
  }
  mount(Component, {
    global: {
      plugins: [{ plugin: Plugin, options: {} }]
    }
  })

  expect(installed).toHaveBeenCalled()
})
```


### `global.components`

Registers components globally to all components

```js
test('installs a component globally', () => {
  import GlobalComponent from '@/components/GlobalComponent'

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

```js
test('installs a directive globally', () => {
  import Directive from '@/directives/Directive'

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

## Wrapper

When you use `mount`, a `VueWrapper` is returned with a number of useful methods for testing. Methods like `find` return a `DOMWrapper`. Both implement the same API.


### `html`

Returns the HTML (via `outerHTML`) of an element. Useful for debugging.

```vue
<template>
  <div>
    <p>Hello world</p>
  </div>
</template>
```

```js
test('html', () => {
  const wrapper = mount(Component)

  console.log(wrapper.html()) //=> <div><p>Hello world</p></div>
})
```

### `text`

Find the text (via `textContent`) of an element.

```vue
<template>
  <div>
    <p>Hello world</p>
  </div>
</template>
```

```js
test('text', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('p').text()).toBe('Hello world')
})
```

### `find`

Finds an element and returns a `DOMWrapper` if one is found. You can use the same syntax `querySelector` implements - `find` is basically an alias for `querySelector`.

```vue
<template>
  <div>
    <span>Span</span>
    <span data-test="span">Span</span>
  </div>
</template>
```

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

```vue
<template>
  <div>
    <span 
      v-for="number in [1, 2, 3]"
      :key="number"
      data-test="number"
    >
      {{ number }}
    </span>
  </div>
</template>
```

```js
test('findAll', () => {
  const wrapper = mount(Component)

  wrapper.findAll('[data-test="number"]') //=> found; returns array of DOMWrapper
})
```

### `findComponent`

Finds a Vue Component instance and returns a `VueWrapper` if one is found, otherwise returns `ErrorWrapper`.

**Supported syntax:**
 
* **querySelector** - `findComponent('.component')` - Matches standard query selector.
* **Name** - `findComponent({ name: 'myComponent' })` - matches PascalCase, snake-case, camelCase
* **ref** - `findComponent({ ref: 'dropdown' })` - Can be used only on direct ref children of mounted component
* **SFC** - `findComponent(ImportedComponent)` - Pass an imported component directly.

```vue
<template>
  <div class="foo">
    Foo
  </div>
</template>
<script>
export default { name: 'Foo' }
</script>
``` 
 
```vue
<template>
  <div>
    <span>Span</span>
    <Foo data-test="foo" ref="foo"/>
  </div>
</template>
```

```js
test('findComponent', () => {
  const wrapper = mount(Component)

  wrapper.findComponent('.foo') //=> found; returns VueWrapper
  wrapper.findComponent('[data-test="foo"]') //=> found; returns VueWrapper
  wrapper.findComponent({ name: 'Foo' }) //=> found; returns VueWrapper
  wrapper.findComponent({ name: 'foo' }) //=> found; returns VueWrapper
  wrapper.findComponent({ ref: 'foo' }) //=> found; returns VueWrapper
  wrapper.findComponent(Foo) //=> found; returns VueWrapper
})
```

### `findAllComponents`

Similar to `findComponent` but finds all Vue Component instances that match the query and returns an array of `VueWrapper`. 

**Supported syntax:**
 
 * **querySelector** - `findAllComponents('.component')`
 * **Name** - `findAllComponents({ name: 'myComponent' })`
 * **SFC** - `findAllComponents(ImportedComponent)`
 
**Note** - `Ref` is not supported here.
 
 
```vue
<template>
  <div>
    <FooComponent 
      v-for="number in [1, 2, 3]"
      :key="number"
      data-test="number"
    >
      {{ number }}
    </FooComponent>
  </div>
</template>
```

```js
test('findAllComponents', () => {
  const wrapper = mount(Component)

  wrapper.findAllComponents('[data-test="number"]') //=> found; returns array of VueWrapper
})
```

### `trigger`

Simulates an event, for example `click`, `submit` or `keyup`. Since events often cause a re-render, `trigger` returs `Vue.nextTick`. If you expect the event to trigger a re-render, you should use `await` when you call `trigger` to ensure that Vue updates the DOM before you make an assertion.

```vue
<template>
  <div>
    <span>Count: {{ count }}</span>
    <button @click="count++">Greet</button>
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

```js
test('trigger', async () => {
  const wrapper = mount(Component)

  await wrapper.find('button').trigger('click')

  expect(wrapper.find('span').text()).toBe('Count: 1')
})
```

### `classes`

Returns an array of classes on an element (via `classList`).

```vue
<template>
  <div>
    <span class="my-span" />
  </div>
</template>
```

```js
test('classes', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('.my-span').classes()).toContain('my-span')
})
```

### `exists`

Verify whether or not an element found via `find` exists or not.

```vue
<template>
  <div>
    <span />
  </div>
</template>
```

```js
test('exists', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('span').exists()).toBe(true)
})
```

### `emitted`

Returns an object mapping events emitted from the `wrapper`. The arguments are stored in an array, so you can verify which arguments were emitted each time the event is emitted.

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
```

```js
test('emitted', () => {
  const wrapper = mount(Component)

  console.log(wrapper.emitted()) 
  // { 
  //   greet: [ ['hello'], ['goodbye'] ]
  // }

  expect(wrapper.emitted().greet[0]).toEqual(['hello'])
  expect(wrapper.emitted().greet[1]).toEqual(['goodbye'])
})
```

### `setChecked`

Set an input (either `type="checkbox"` or `type="radio"`) to be checked or not checked. Since this will often result in a DOM re-render, `setChecked` returns `Vue.nextTick`, so you will often have to call this with `await` to ensure the DOM has been updated before making an assertion. 

```vue
<template>
  <input type="checkbox" v-model="checked" />
  <div v-if="checked">Checked</div>
</template>

<script>
export default {
  data() {
    return {
      checked: false
    }
  }
}
```

```js
test('checked', async () => {
  const wrapper = mount(Component)

  await wrapper.find('input').setChecked(true)
  expect(wrapper.find('div')).toBeTruthy()

  await wrapper.find('input').setChecked(false)
  expect(wrapper.find('div')).toBeFalsy()
})
```
