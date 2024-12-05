# 测试 `v-model`

在编写依赖于 `v-model` 交互的组件时 (即 `update:modelValue` 事件)，需要处理 `event` 和 `props`。

可以查看 [“vmodel integration” 讨论](https://github.com/vuejs/test-utils/discussions/279)获取一些社区解决方案。

有关 v-model 事件的更多信息，请查看 [VueJS VModel 事件文档](https://vuejs.org/guide/components/events.html#usage-with-v-model)。

## 简单的示例

这是一个简单的编辑器组件：

```js
const Editor = {
  props: {
    label: String,
    modelValue: String
  },
  emits: ['update:modelValue'],
  template: `<div>
    <label>{{label}}</label>
    <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">
  </div>`
}
```

这个组件将表现得像一个输入组件：

```js
const App = {
  components: {
    Editor
  },
  template: `<editor v-model="text" label="test" />`,
  data() {
    return {
      text: 'test'
    }
  }
}
```

现在，当我们在输入框中输入时，它将更新组件中的 `text`。

要测试这种行为，可以使用：

```js
test('modelValue should be updated', async () => {
  const wrapper = mount(Editor, {
    props: {
      modelValue: 'initialText',
      'onUpdate:modelValue': (e) => wrapper.setProps({ modelValue: e })
    }
  })

  await wrapper.find('input').setValue('test')
  expect(wrapper.props('modelValue')).toBe('test')
})
```

# 多个 `v-model`

在某些情况下，我们可以有多个 `v-model` 定向到特定属性。

例如在一个货币编辑器中，我们可以有 `currency` 和 `modelValue` 属性。

```js
const MoneyEditor = {
  template: `<div> 
    <input :value="currency" @input="$emit('update:currency', $event.target.value)"/>
    <input :value="modelValue" type="number" @input="$emit('update:modelValue', $event.target.value)"/>
  </div>`,
  props: ['currency', 'modelValue'],
  emits: ['update:currency', 'update:modelValue']
}
```

我们可以通过以下方式测试这两个属性：

```js
test('modelValue and currency should be updated', async () => {
  const wrapper = mount(MoneyEditor, {
    props: {
      modelValue: 'initialText',
      'onUpdate:modelValue': (e) => wrapper.setProps({ modelValue: e }),
      currency: '$',
      'onUpdate:currency': (e) => wrapper.setProps({ currency: e })
    }
  })

  const [currencyInput, modelValueInput] = wrapper.findAll('input')
  await modelValueInput.setValue('test')
  await currencyInput.setValue('£')

  expect(wrapper.props('modelValue')).toBe('test')
  expect(wrapper.props('currency')).toBe('£')
})
```
