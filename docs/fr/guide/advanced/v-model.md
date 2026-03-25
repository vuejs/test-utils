# Tester `v-model`

Lors de l'écriture de composants qui dépendent de l'interaction `v-model` (évènement `update:modelValue`), vous devez gérer l'`event` et les `props`.

Vous pouvez jeter un œil sur la discussion [intégration de `v-model` ](https://github.com/vuejs/test-utils/discussions/279) pour des solutions apportées par la communauté.

Vous pouvez aussi regarder [la documentation `v-model` VueJS](https://vuejs.org/guide/components/events.html#usage-with-v-model).

## Un Exemple Simple

Ci-dessous un composant simple `Editor`&nbsp;:

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

Ce composant se comportera comme un composant `input`&nbsp;:

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

Maintenant que nous avons typé notre `input`, il modifiera la propriété `texte` dans notre composant.

Pour tester ce comportement&nbsp;:

```js
test('modelValue est modifié', async () => {
  const wrapper = mount(Editor, {
    props: {
      modelValue: 'Texte initial',
      'onUpdate:modelValue': e => wrapper.setProps({ modelValue: e })
    }
  })

  await wrapper.find('input').setValue('test')
  expect(wrapper.props('modelValue')).toBe('test')
})
```

# Plusieurs `v-model`

Dans certaines situations, nous pouvons avoir plusieurs `v-model` ciblant des propriétés spécifiques.

Par exemple, dans un éditeur de transactions financières, nous pouvons avoir des propriétés `currency` et `modelValue`.

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

Nous pouvons tester les deux comme ceci&nbsp;:

```js
test('modelValue et currency sont modifiés', async () => {
  const wrapper = mount(MoneyEditor, {
    props: {
      modelValue: 'Texte inital',
      'onUpdate:modelValue': e => wrapper.setProps({ modelValue: e }),
      currency: '€',
      'onUpdate:currency': e => wrapper.setProps({ currency: e })
    }
  })

  const [currencyInput, modelValueInput] = wrapper.findAll('input')
  await modelValueInput.setValue('test')
  await currencyInput.setValue('£')

  expect(wrapper.props('modelValue')).toBe('test')
  expect(wrapper.props('currency')).toBe('£')
})
```
