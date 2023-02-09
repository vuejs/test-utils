# Testing `v-model`

When writing components that rely on `v-model` interaction (`update:modelValue` event), you need to handle the `event` and `props`.

Check ["vmodel integration" Discussion](https://github.com/vuejs/test-utils/discussions/279) for some community solutions.

Check [VueJS VModel event documentation](https://vuejs.org/guide/components/events.html#usage-with-v-model).

## A Simple Example

Here a simple Editor component:

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

This component will just behave as an input component:

```js
const App {
  components: {
    Editor
  },
  template: `<editor v-model="text" label="test" />`,
  data(){
    return {
      text: 'test'
    }
  }
}
```

Now when we type on the input, it will update `text` on our component.

To test this behavior:

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

# Multiple `v-model`

In some situations we can have multiple `v-model` targeting specific properties.

Example an Money Editor, we can have `currency` and `modelValue` properties.

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

We can test both by:

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
