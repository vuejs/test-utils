# Обработка форм

Формы в Vue могут быть простыми, начиная с простых HTML форм, заканчивая сложными вложенными деревьями пользовательских Vue компонентов.
Мы постепенно пойдем через взаимодействие с элементами формы, устанавливая значения и вызывая события.

Чаще всего мы будет использовать методы `setValue()` и `trigger()`.

## Взаимодействие с элементами формы

Давайте взглянем на самую простую форму:

```vue
<template>
  <div>
    <input type="email" v-model="email" />

    <button @click="submit">Submit</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: ''
    }
  },
  methods: {
    submit() {
      this.$emit('submit', this.email)
    }
  }
}
</script>
```

### Установка значений элементов

Самый простой путь привязать поле ввода к данным в Vue - это использование `v-model`. Как вы, возможно, уже знаете, он позволяет генерировать события для каждого элемента формы и принимать свойства, что значительно упрощает взаимодействие с элементами формы.

Чтобы изменить значение поля ввода в VTU, вы можете использовать `setValue()` метод. Он принимает параметр, чаще всего `String` или `Boolean`, и возвращает `Promise`, который выполнится после того, как Vue обновит DOM.

```js
test('sets the value', async () => {
  const wrapper = mount(Component)
  const input = wrapper.find('input')

  await input.setValue('my@mail.com')

  expect(input.element.value).toBe('my@mail.com')
})
```

Как ты можешь видеть, `setValue` устанавливает `value` свойство на поле ввода элемента.

Мы используем `await`, чтобы убедиться, что Vue обновился и изменения были отражены в DOM, до того как мы сделаем какие-либо проверки.

### Вызов событий

Вызов событий - это второе самое важное действие, при работе с формами и элементами действия. Давайте посмотрим на наш `button`, из предыдущего примера.

```html
<button @click="submit">Submit</button>
```

Для вызова события click, нам нужно использовать `trigger` метод.

```js
test('trigger', async () => {
  const wrapper = mount(Component)

  // вызвать событие
  await wrapper.find('button').trigger('click')

  // проверить некоторое выполненное действие, например, сгенерированное событие.
  expect(wrapper.emitted()).toHaveProperty('submit')
})
```

> Если ты не знаком с `emitted()`, не волнуйтесь. Он используется для проверки сгенерированных событий компонента. Ты можешь изучить больше в [Обработка событий](/ru/guide/essentials/event-handling).

Мы вызываем слушатель события `click`, так что компонент выполнит `submit` метод. Как мы делали с `setValue`, мы используем `await`, чтобы убедиться, что действие отображается при помощи Vue.

После мы можем проверить, что некоторые события произошли. В данном случае, что мы сгенерировали нужное событие.

Давайте объединим эти два метода, чтобы проверить, что наша простая форма генерирует то, что ввел пользователь.

```js
test('emits the input to its parent', async () => {
  const wrapper = mount(Component)

  // установить значение
  await wrapper.find('input').setValue('my@mail.com')

  // вызывать событие
  await wrapper.find('button').trigger('click')

  // проверить, что `submit` событие сгенерировано,
  expect(wrapper.emitted('submit')[0][0]).toBe('my@mail.com')
})
```

## Продвинутый workflows

Теперь, когда мы знаем основы, давайте углубимся в более сложные примеры.

### Работа с различными элементами формы

Мы увидели, как `setValue` работает с полями ввода, но он гораздо более универсальный, потому что он может установить значения на различные типы полей ввода.

Давайте посмотрим на более сложную форму, которая имеет больше типов полей ввода.

```vue
<template>
  <form @submit.prevent="submit">
    <input type="email" v-model="form.email" />

    <textarea v-model="form.description" />

    <select v-model="form.city">
      <option value="new-york">New York</option>
      <option value="moscow">Moscow</option>
    </select>

    <input type="checkbox" v-model="form.subscribe" />

    <input type="radio" value="weekly" v-model="form.interval" />
    <input type="radio" value="monthly" v-model="form.interval" />

    <button type="submit">Submit</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: '',
        description: '',
        city: '',
        subscribe: false,
        interval: ''
      }
    }
  },
  methods: {
    async submit() {
      this.$emit('submit', this.form)
    }
  }
}
</script>
```

Наш расширенный Vue компонент немного длиннее, имеет несколько больше типов полей ввода, и сейчас `submit` обработчик перенесен в `<form/>` элемент.

Точно так же, как мы устанавливаем значение на `input`, мы можем установить его на все остальные поля ввода формы.

```js
import { mount } from '@vue/test-utils'
import FormComponent from './FormComponent.vue'

test('submits a form', async () => {
  const wrapper = mount(FormComponent)

  await wrapper.find('input[type=email]').setValue('name@mail.com')
  await wrapper.find('textarea').setValue('Lorem ipsum dolor sit amet')
  await wrapper.find('select').setValue('moscow')
  await wrapper.find('input[type=checkbox]').setValue()
  await wrapper.find('input[type=radio][value=monthly]').setValue()
})
```

Как ты можешь видеть, `setValue` - очень универсальный метод. Он может работать с любыми типами полей ввода.

Мы используем `await` везде, чтобы убедиться в том, что каждое изменение было применено до того, как мы вызываем следующее событие. Это рекомендованное действие, чтобы быть уверенным, что вы начнете проверки, когда DOM обновится.

::: tip
Если ты не передашь параметр `setValue` для `OPTION`, `CHECKBOX` или `RADIO` полей ввода, тогда будет установлено `checked`.
:::

Мы задали значения в нашей форме, сейчас самое время отправить форму и написать несколько проверок.

### Вызов сложных слушателей событий

Слушатели событий не всегда простые `click` события. Vue позволяет вам прослушивать все виды DOM событий, добавляя специальные модификаторы, например, `.prevent` и другие. Давайте посмотрим, как мы можем протестировать их.

В нашей форме выше мы перенесли событие из `button` в `form` элемент. Это хорошая практика, которой нужно придерживаться, поскольку это позволит отправить форму нажатием `enter` клавиши, которая является более нативным подходом.

Для вызова `submit` обработчика мы используем `trigger` метод снова.

```js {14,16-22}
test('submits the form', async () => {
  const wrapper = mount(FormComponent)

  const email = 'name@mail.com'
  const description = 'Lorem ipsum dolor sit amet'
  const city = 'moscow'

  await wrapper.find('input[type=email]').setValue(email)
  await wrapper.find('textarea').setValue(description)
  await wrapper.find('select').setValue(city)
  await wrapper.find('input[type=checkbox]').setValue()
  await wrapper.find('input[type=radio][value=monthly]').setValue()

  await wrapper.find('form').trigger('submit.prevent')

  expect(wrapper.emitted('submit')[0][0]).toStrictEqual({
    email,
    description,
    city,
    subscribe: true,
    interval: 'monthly'
  })
})
```

Для тестирования модификатора события мы напрямую копируем нашу строку с событием `submit.prevent` в `trigger`. `trigger` может прочитать переданное событие и выборочно применить то, что необходимо.

::: tip
Нативные модификаторы событий `.prevent` и `.stop` являются Vue-специфическими, и поэтому нам не нужно тестировать их, Vue самостоятельно уже сделал это.
:::

После мы сделаем простую проверку, генерирует ли форма верное событие и его параметры.

#### Нативная отправка формы

Вызов `submit` события на `<form>` элементе имитирует поведение браузера во время отправки формы. Если мы хотим вызвать отправку формы более нативно, мы могли бы вместо этого вызвать `click` событие на кнопке отправки. Поскольку элементы формы, не связанные с `document`, не могут быть отправлены, в соответствии с [HTML спецификацией](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm), нам нужно использовать [`attachTo`](/ru/api/#attachTo), чтобы привязать элементы.

#### Несколько модификаторов на одном событии

Давайте предположим, у вас имеется очень детализированная и сложная форма, со специальными обработчиками взаимодействия. Как мы можем протестировать это?

```html
<input @keydown.meta.c.exact.prevent="captureCopy" v-model="input" />
```

Предположим, у нас поле ввода, которое обрабатывается, когда пользователь нажимает на `cmd` + `c`, и мы хотим перехватить и отменить копирование. Такое тестирование такое легкое, как и скопировать событие из компонента в `trigger()` метод.

```js
test('handles complex events', async () => {
  const wrapper = mount(Component)

  await wrapper.find(input).trigger('keydown.meta.c.exact.prevent')

  // запустить ваши проверки
})
```
 
Vue Test Utils считывает событие и применяет соответствующие свойства к объекту события. В данном случае это будет соответствовать чему-то такому:

```js
{
  // ... другие свойства
  "key": "c",
  "metaKey": true
}
```

#### Добавление дополнительных данных к событию

Допустим, вашему коду нужно что-то из `event` объекта. Вы можете протестировать такие сценарии, передав дополнительные данные как второй параметр.

```vue
<template>
  <form>
    <input type="text" v-model="value" @blur="handleBlur" />
    <button>Submit</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      value: ''
    }
  },
  methods: {
    handleBlur(event) {
      if (event.relatedTarget.tagName === 'BUTTON') {
        this.$emit('focus-lost')
      }
    }
  }
}
</script>
```

```js
import Form from './Form.vue'

test('emits an event only if you lose focus to a button', () => {
  const wrapper = mount(Form)

  const componentToGetFocus = wrapper.find('button')

  wrapper.find('input').trigger('blur', {
    relatedTarget: componentToGetFocus.element
  })

  expect(wrapper.emitted('focus-lost')).toBeTruthy()
})
```

Здесь мы предполагаем, что наш код проверяет внутри `event` объекта, является ли `relatedTarget` кнопкой или нет. Мы можем просто передать ссылку на такой элемент, имитируя, что случилось бы, если пользователь нажал на `button` после ввода текста в `input`.

## Взаимодействие с Vue компонентом в качестве поля ввода

Поля ввода - это не только простые элементы. Мы часто используем Vue компоненты, которые ведут себя как поля ввода. Они могут добавлять разметку, стили и множество функциональных возможностей.

Тестирование форм, которые используют такие поля ввода, могут показаться сначала сложными, но, следуя нескольким простым правилам, это быстро станет понятным.

Далее идет компонент, который оборачивает `label` и `input` элемент:

```vue
<template>
  <label>
    {{ label }}
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>

<script>
export default {
  name: 'CustomInput',

  props: ['modelValue', 'label']
}
</script>
```

Этот Vue компонент также обратно генерирует все, что ты напечатаешь. Чтобы так сделать, вам нужно:

```html
<custom-input v-model="input" label="Text Input" class="text-input" />
```

Как сказано выше, большинство из этих полей ввода на базе Vue имеют внутри реальные `button` или `input`. Ты можешь также просто найти этот элемент и взаимодействовать с ним:

```js
test('fills in the form', async () => {
  const wrapper = mount(CustomInput)

  await wrapper.find('.text-input input').setValue('text')

  // продолжайте свои проверки или взаимодействия
})
```

### Тестирование сложных Input компонентов

Что случится, если твой Input компонент не будет простым?. Вы, возможно, будете использовать UI-библиотеку, например Vuetify. Если вы полагаетесь на поиск внутри разметки, чтобы найти нужные элементы, твои тесты могут не пройти, если внешняя библиотека решит изменить их внутренности.

В таких случаях, вы можете установить значение напрямую, используя экземпляр компонента и `setValue`.

Предположим, у нас есть форма, которая использует Vuetify textarea:

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <v-textarea v-model="description" ref="description" />
    <button type="submit">Send</button>
  </form>
</template>

<script>
export default {
  name: 'CustomTextarea',
  data() {
    return {
      description: ''
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('submitted', this.description)
    }
  }
}
</script>
```

Мы можем использовать `findComponent`, чтобы найти экземпляр компонента, и далее установить его значение.

```js
test('emits textarea value on submit', async () => {
  const wrapper = mount(CustomTextarea)
  const description = 'Some very long text...'

  await wrapper.findComponent({ ref: 'description' }).setValue(description)

  wrapper.find('form').trigger('submit')

  expect(wrapper.emitted('submitted')[0][0]).toEqual(description)
})
```

## Заключение

- Используйте `setValue` для установки значения как на полях ввода, так и Vue компонентов.
- Используйте `trigger` для вызова DOM событий, с или без модификаторов.
- Добавьте дополнительные данные о событии в `trigger`, используя второй параметр.
- Проверьте, что DOM изменился и верные события были сгенерированы. Старайтесь не проверять данные прямо с экземпляра компонента.
