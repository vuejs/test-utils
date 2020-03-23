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

```ts
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

<script>
export default {}
</script>
```

```ts
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

### `provides`

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

### `mixins`

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
    mixins: [mixin]
  })

  // 'Component was created!' will be logged
})
```

### `plugins`

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
    static install() {
      installed()
    }
  }
  const Component = {
    render() { return h('div') }
  }
  mount(Component, {
    plugins: [Plugin]
  })

  expect(installed).toHaveBeenCalled()
})
```

## Wrapper

When you use `mount`, a `VueWrapper` is returned with a number of useful methods for testing. Methods like `find` return a `DOMWrapper`. Both implement the same API.


### `html`

```vue
<template>
  <div>
    <p>Hello world</p>
  </div>
</template>
```

```ts
test('html', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('p').text()).toBe('Hello world')
})
```

### `text`

```vue
<template>
  <div>
    <p>Hello world</p>
  </div>
</template>
```

```ts
test('text', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('p').text()).toBe('Hello world')
})
```

### `find`

```vue
<template>
  <div>
    <span>Span</span>
    <span data-test="span">Span</span>
  </div>
</template>
```

```ts
test('find', () => {
  const wrapper = mount(Component)

  wrapper.find('span') //=> found; returns DOMWrapper
  wrapper.find('[data-test="span"]') //=> found; returns DOMWrapper
  wrapper.find('p') //=> nothing found; returns ErrorWrapper
})
```

### `findAll`

```vue
<template>
  <div>
    <span>Span</span>
    <span data-test="span">Span</span>
  </div>
</template>
```

```ts
test('findAll', () => {
  const wrapper = mount(Component)

  wrapper.findAll('span') //=> found; returns array of DOMWrapper
})
```

### `trigger`

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

```ts
test('trigger', async () => {
  const wrapper = mount(Component)

  await wrapper.find('button').trigger('click')

  expect(wrapper.find('span').text()).toBe('Count: 1')
})
```

### `classes`

```vue
<template>
  <div>
    <span class="my-span" />
  </div>
</template>
```

```ts
test('classes', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('.my-span').classes()).toContain('my-span')
})
```

### `exists`

```vue
<template>
  <div>
    <span />
  </div>
</template>
```

```ts
test('exists', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('span').exists()).toBe(true)
})
```

### `emitted`

```vue
<template>
  <div />
</template>

<script>
export default {
  created() {
    this.$emit('greet', 'hello')
  }
}
```

```ts
test('emitted', () => {
  const wrapper = mount(Component)

  console.log(wrapper.emitted()) //=> { greet: [ ['hello'] ] }
  expect(wrapper.emitted().greet[0]).toEqual(['hello'])
})
```
