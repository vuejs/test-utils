# Form Handling

Forms in Vue can be as simple as plain HTML forms to complicated nested trees of custom Vue component form elements.
We will gradually go through the ways of interacting with form elements, setting values and triggering events.

The methods we will be using the most are `setValue()` and `trigger()`.

## Interacting with form elements

Let's take a look at a very basic form:

```vue
<!-- Form.vue -->
<script setup>
import { ref } from 'vue'

const email = ref('')
const emit = defineEmits(['submit'])

const submit = () => {
  emit('submit', email.value)
}
</script>

<template>
  <div>
    <input type="email" v-model="email" />

    <button @click="submit">Submit</button>
  </div>
</template>
```

### Setting element values

The most common way to bind an input to data in Vue is by using `v-model`. As you probably know by now, it takes care of what events each form element emits,
and the props it accepts, making it easy for us to work with form elements.

To change the value of an input in VTU, you can use the `setValue()` method. It accepts a parameter, most often a `String` or a `Boolean`, and returns a `Promise`, which resolves after Vue has updated the DOM.

```js
test('sets the value', async () => {
  const wrapper = mount(Form)
  const input = wrapper.find('input')

  await input.setValue('my@mail.com')

  expect(input.element.value).toBe('my@mail.com')
})
```

As you can see, `setValue` sets the `value` property on the input element to what we pass to it.

We are using `await` to make sure that Vue has completed updating and the change has been reflected in the DOM, before we make any assertions.

### Triggering events

Triggering events is the second most important action when working with forms and action elements. Let's take a look at our `button`, from the previous example.

```html
<button @click="submit">Submit</button>
```

To trigger a click event, we can use the `trigger` method.

```js
test('trigger', async () => {
  const wrapper = mount(Form)

  // trigger the element
  await wrapper.find('button').trigger('click')

  // assert some action has been performed, like an emitted event.
  expect(wrapper.emitted()).toHaveProperty('submit')
})
```

> If you haven't seen `emitted()` before, don't worry. It's used to assert the emitted events of a Component. You can learn more in [Event Handling](./event-handling).

We trigger the `click` event listener, so that the Component executes the `submit` method. As we did with `setValue`, we use `await` to make sure the action is being reflected by Vue.

We can then assert that some action has happened. In this case, that we emitted the right event.

Let's combine these two to test whether our simple form is emitting the user inputs.

```js
test('emits the input to its parent', async () => {
  const wrapper = mount(Form)

  // set the value
  await wrapper.find('input').setValue('my@mail.com')

  // trigger the element
  await wrapper.find('button').trigger('click')

  // assert the `submit` event is emitted,
  expect(wrapper.emitted('submit')[0][0]).toBe('my@mail.com')
})
```

## Advanced workflows

Now that we know the basics, let's dive into more complex examples.

### Working with various form elements

We saw `setValue` works with input elements, but is much more versatile, as it can set the value on various types of input elements.

Let's take a look at a more complicated form, which has more types of inputs.

```vue
<!-- FormComponent.vue -->
<script setup>
import { ref } from 'vue'

const form = ref({
  email: '',
  description: '',
  city: '',
  subscribe: false,
  interval: ''
})
const emit = defineEmits(['submit'])

const submit = () => {
  emit('submit', { ...form.value })
}
</script>

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
```

Our extended Vue component is a bit longer, has a few more input types and now has the `submit` handler moved to a `<form/>` element.

The same way we set the value on the `input`, we can set it on all the other inputs in the form.

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

As you can see, `setValue` is a very versatile method. It can work with all types of form elements.

We are using `await` everywhere, to make sure that each change has been applied before we trigger the next. This is recommended to make sure you do assertions when the DOM has updated.

::: tip
If you don't pass a parameter to `setValue` for `OPTION`, `CHECKBOX` or `RADIO` inputs, they will set as `checked`.
:::

We have set values in our form, now it's time to submit the form and do some assertions.

### Triggering complex event listeners

Event listeners are not always simple `click` events. Vue allows you to listen to all kinds of DOM events, add special modifiers like `.prevent` and more. Let's take a look how we can test those.

In our form above, we moved the event from the `button` to the `form` element. This is a good practice to follow, as this allows you to submit a form by hitting the `enter` key, which is a more native approach.

To trigger the `submit` handler, we use the `trigger` method again.

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

To test the event modifier, we directly copy-pasted our event string `submit.prevent` into `trigger`. `trigger` can read the passed event and all its modifiers, and selectively apply what is necessary.

::: tip
Native event modifiers such as `.prevent` and `.stop` are Vue-specific and as such we don't need to test them, Vue internals do that already.
:::

We then make a simple assertion, whether the form emitted the correct event and payload.

#### Native form submission

Triggering a `submit` event on a `<form>` element mimics browser behavior during form submission. If we wanted to trigger form submission more naturally, we could trigger a `click` event on the submit button instead. Since form elements not connected to the `document` cannot be submitted, as per the [HTML specification](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm), we need to use [`attachTo`](../../api/#attachTo) to connect the wrapper's element.

#### Multiple modifiers on the same event

Let's assume you have a very detailed and complex form, with special interaction handling. How can we go about testing that?

```html
<input @keydown.meta.c.exact.prevent="captureCopy" v-model="input" />
```

Assume we have an input that handles when the user clicks `cmd` + `c`, and we want to intercept and stop him from copying. Testing this is as easy as copy & pasting the event from the Component to the `trigger()` method.

```js
test('handles complex events', async () => {
  const wrapper = mount(Component)

  await wrapper.find(input).trigger('keydown.meta.c.exact.prevent')

  // run your assertions
})
```

Vue Test Utils reads the event and applies the appropriate properties to the event object. In this case it will match something like this:

```js
{
  // ... other properties
  "key": "c",
  "metaKey": true
}
```

#### Adding extra data to an event

Let's say your code needs something from inside the `event` object. You can test such scenarios by passing extra data as a second parameter.

```vue
<!-- Form.vue -->
<script setup>
import { ref } from 'vue'

const inputValue = ref('')
const emit = defineEmits(['focus-lost'])

const handleBlur = event => {
  if (event.relatedTarget.tagName === 'BUTTON') {
    emit('focus-lost')
  }
}
</script>

<template>
  <form>
    <input type="text" v-model="inputValue" @blur="handleBlur" />
    <button>Submit</button>
  </form>
</template>
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

Here we assume our code checks inside the `event` object, whether the `relatedTarget` is a button or not. We can simply pass a reference to such an element, mimicking what would happen if the user clicks on a `button` after typing something in the `input`.

## Interacting with Vue Component inputs

Inputs are not only plain elements. We often use Vue components that behave like inputs. They can add markup, styling and lots of functionalities in an easy to use format.

Testing forms that use such inputs can be daunting at first, but with a few simple rules, it quickly becomes a walk in the park.

Following is a Component that wraps a `label` and an `input` element:

```vue
<!-- CustomInput.vue -->
<script setup>
defineProps(['modelValue', 'label'])
</script>

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
```

This Vue component also emits back whatever you type. To use it you do:

```html
<custom-input v-model="input" label="Text Input" class="text-input" />
```

As above, most of these Vue-powered inputs have a real `button` or `input` in them. You can just as easily find that element and act on it:

```js
test('fills in the form', async () => {
  const wrapper = mount(CustomInput)

  await wrapper.find('.text-input input').setValue('text')

  // continue with assertions or actions like submit the form, assert the DOM…
})
```

### Testing complex Input components

What happens if your Input component is not that simple? You might be using a UI library, like Vuetify. If you rely on digging inside the markup to find the right element, your tests may break if the external library decides to change their internals.

In such cases you can set the value directly, using the component instance and `setValue`.

Assume we have a form that uses the Vuetify textarea:

```vue
<!-- CustomTextarea.vue -->
<script setup>
import { ref } from 'vue'

const description = ref('')
const emit = defineEmits(['submitted'])

const handleSubmit = () => {
  emit('submitted', description.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <v-textarea v-model="description" ref="description" />
    <button type="submit">Send</button>
  </form>
</template>
```

We can use `findComponent` to find the component instance, and then set its value.

```js
test('emits textarea value on submit', async () => {
  const wrapper = mount(CustomTextarea)
  const description = 'Some very long text...'

  await wrapper.findComponent({ ref: 'description' }).setValue(description)

  wrapper.find('form').trigger('submit')

  expect(wrapper.emitted('submitted')[0][0]).toEqual(description)
})
```

## Conclusion

- Use `setValue` to set the value on both DOM inputs and Vue components.
- Use `trigger` to trigger DOM events, both with and without modifiers.
- Add extra event data to `trigger` using the second parameter.
- Assert that the DOM changed and the right events got emitted. Try not to assert data on the Component instance.
