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

### `slots`

```vue
<template>
  <slot name="foo" />
  <slot />
</template>
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
