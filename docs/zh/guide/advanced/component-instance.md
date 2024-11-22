# 组件实例

[`mount`](/api/#mount) 返回一个 `VueWrapper`，提供了许多方便的测试 Vue 组件的方法。有时你可能希望访问底层的 Vue 实例。可以通过 `vm` 属性访问它。

## 简单示例

下面是一个简单的组件，它结合了 props 和 data 来渲染一个问候语：

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

让我们通过 `console.log(wrapper.vm)` 来查看 `vm` 上可用的内容：

```js
{
  msg1: [Getter/Setter],
  msg2: [Getter/Setter],
  hasOwnProperty: [Function]
}
```

我们可以看到 `msg1` 和 `msg2`！如果定义了 `methods` 和 `computed` 属性，它们也会显示出来。在编写测试时，虽然通常建议对 DOM 进行断言（使用 `wrapper.html()` 等），但在一些特殊情况下，你可能需要访问底层的 Vue 实例。

## 与 `getComponent` 和 `findComponent` 的使用

`getComponent` 和 `findComponent` 返回一个 `VueWrapper`，与从 `mount` 获取的相似。这意味着你也可以在 `getComponent` 或 `findComponent` 的结果上访问所有相同的属性，包括 `vm`。

下面是一个简单的示例：

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

一种更彻底的测试方式是对渲染的内容进行断言。这样可以确保正确的 prop 被传递*并*渲染。

:::warning 使用 CSS 选择器时的 WrapperLike 类型
例如，当使用 `wrapper.findComponent('.foo')` 时，VTU 将返回 `WrapperLike` 类型。这是因为功能组件需要一个 `DOMWrapper`，否则返回 `VueWrapper`。你可以通过提供正确的组件类型来强制返回 `VueWrapper`：

```typescript
wrapper.findComponent('.foo') // 返回 WrapperLike
wrapper.findComponent<typeof FooComponent>('.foo') // 返回 VueWrapper
wrapper.findComponent<DefineComponent>('.foo') // 返回 VueWrapper
```

:::

## 结论

- 使用 `vm` 访问内部 Vue 实例。
- `getComponent` 和 `findComponent` 返回一个 Vue 包装器。这些 Vue 实例也可以通过 `vm` 访问。
