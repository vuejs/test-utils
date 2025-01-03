# Тестирование `v-model`

При написании компонентов, которые полагаются на `v-model` взаимодействие (`update:modelValue` событие), вам нужно обработать `event` и `props`.

Ознакомьтесь с ["vmodel integration" Discussion](https://github.com/vuejs/test-utils/discussions/279) для некоторых решений от сообщества.

Ознакомьтесь с [VueJS VModel event documentation](https://vuejs.org/guide/components/events.html#usage-with-v-model).

## Простой пример

Ниже простой Editor компонент:

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

Этот компонент будет просто вести себя как входной компонент:

```js
const App = {
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

Теперь, когда мы вводим что-либо в input, он обновит `text` в вашем компоненте.

Для тестирования этого поведения:

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

# Множественный `v-model`

В некоторых случаях мы можем иметь несколько `v-model`, нацеленных на определенные свойства.

Пример с Money Editor мы можем иметь `currency` и `modelValue` свойства.

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

Мы можем протестировать их обоих:

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
