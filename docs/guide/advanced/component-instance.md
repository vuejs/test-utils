# Component Instance

[`mount`](/api/#mount) returns a `VueWrapper` with lots of convenient methods for testing Vue components. Sometimes you might want access to the underlying Vue instance. You can access that with the `vm` property.

## A Simple Example

Here is a simple component that combines props and data to render a greeting:

```ts
test('renders a greeting', () => {
  const Comp = {
    template: `<div>{{ msg1 }} {{ msg2 }}</div>`,
    props: ['msg1'],
    data() {
      return {
        msg2: 'world'
      }
    }
  }

  const wrapper = mount(Comp, {
    props: {
      msg1: 'hello'
    }
  })

  expect(wrapper.html()).toContain('hello world')
})
```

Let's take a look at what's available on `vm` by with `console.log(wrapper.vm)`:

```js
{
  msg1: [Getter/Setter],
  msg2: [Getter/Setter],
  hasOwnProperty: [Function]
}
```

We can see both `msg1` and `msg2`! Things like `methods` and `computed` properties will show up too, if they are defined. When writing a test, while it's generally recommended to assert against the DOM (using something like `wrapper.html()`), in some rare circumstances you might need access to the underlying Vue instance. 

## Usage with `getComponent` and `findComponent`

`getComponent` and `findComponent` return a `VueWrapper` - much like the one get from `mount`. This means you can also access all the same properties, including `vm`, on the result of `getComponent` or `findComponent`.

Here's a simple example:

```js
test('asserts correct props are passed', () => {
  const Foo = {
    props: ['msg'],
    template: `<div>{{ msg }}</div>`
  }

  const Comp = {
    components: { Foo },
    template: `<div><foo msg="hello world" /></div>`
  }

  const wrapper = mount(Comp)

  expect(wrapper.getComponent(Foo).vm.msg).toBe('hello world')
  expect(wrapper.getComponent(Foo).props()).toEqual({ msg: 'hello world' })
})
```

A more thorough way to test this would be asserting against the rendered content. Doing this means you asserts the correct prop is passed *and* rendered. 

::: tip

Note: if you are using a `<script setup>` component, `vm` will not be available. That's because `<script setup>` components are [closed by default](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0040-script-setup.md#exposing-components-public-interface). For these components, and in general, consider avoiding `vm` and asserting against the rendered markup.
:::

## Conclusion

- use `vm` to access the internal Vue instance
- `getComponent` and `findComponent` return a Vue wrapper. Those Vue instances are also available via `vm`
