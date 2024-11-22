# 表单处理

在 Vue 中，表单可以是简单的 HTML 表单，也可以是复杂的嵌套自定义 Vue 组件表单元素。我们将逐步了解如何与表单元素交互、设置值和触发事件。

我们将使用的主要方法是 `setValue()` 和 `trigger()`。

## 与表单元素交互

让我们看一个非常基本的表单：

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

### 设置元素值

在 Vue 中，将输入绑定到数据的最常见方法是使用 `v-model`。正如您可能已经知道的，它处理每个表单元素发出的事件以及它接受的 props，使我们更容易处理表单元素。

要在 VTU 中更改输入的值，可以使用 `setValue()` 方法。它接受一个参数，通常是一个 `String` 或 `Boolean`，并返回一个 `Promise`，在 Vue 更新 DOM 后解析。

```js
test('sets the value', async () => {
  const wrapper = mount(Component)
  const input = wrapper.find('input')

  await input.setValue('my@mail.com')

  expect(input.element.value).toBe('my@mail.com')
})
```

如您所见，`setValue` 将输入元素的 `value` 属性设置为我们传递的值。

我们使用 `await` 确保 Vue 完成更新，并且更改已反映在 DOM 中，然后再进行任何断言。

### 触发事件

触发事件是处理表单和操作元素时的第二个重要操作。让我们看看之前示例中的 `button`。

```html
<button @click="submit">Submit</button>
```

要触发点击事件，我们可以使用 `trigger` 方法。

```js
test('trigger', async () => {
  const wrapper = mount(Component)

  // 触发元素
  await wrapper.find('button').trigger('click')

  // 断言某个操作已执行，例如发出事件。
  expect(wrapper.emitted()).toHaveProperty('submit')
})
```

> 如果您之前没有见过 `emitted()`，不要担心。它用于断言组件发出的事件。您可以在 [事件处理](./event-handling) 中了解更多。

我们触发 `click` 事件监听器，以便组件执行 `submit` 方法。与 `setValue` 一样，我们使用 `await` 确保操作已被 Vue 处理。

然后我们可以断言某个操作是否发生。在这种情况下，我们确认发出了正确的事件。

让我们将这两个结合起来，测试我们的简单表单是否发出了用户输入。

```js
test('emits the input to its parent', async () => {
  const wrapper = mount(Component)

  // 设置值
  await wrapper.find('input').setValue('my@mail.com')

  // 触发元素
  await wrapper.find('button').trigger('click')

  //  断言 `submit` 事件被发出
  expect(wrapper.emitted('submit')[0][0]).toBe('my@mail.com')
})
```

## 高级工作流

现在我们知道了基础知识，让我们深入更复杂的示例。

### 与各种表单元素的协作

我们看到 `setValue` 可以与输入元素一起使用，但它更为通用，可以设置各种类型输入元素的值。

让我们看一个更复杂的表单，它包含更多类型的输入。

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

我们的扩展 Vue 组件稍微长一些，包含更多输入类型，并且 `submit` 处理程序已移至 `<form/>` 元素。

就像我们为 `input` 设置值一样，我们也可以为表单中的所有其他输入字段设置值。

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

如您所见，`setValue` 是一个非常通用的方法。它可以与所有类型的表单元素一起使用。

我们在每个地方都使用 `await`，以确保在触发下一个事件之前，每个更改都已应用。这是推荐的做法，以确保在 DOM 更新后进行断言。

::: tip
如果您不为 `OPTION`、`CHECKBOX` 或 `RADIO` 传递参数给 `setValue`，它们将被设置为 `checked`。
:::

我们已经在表单中设置了值，现在该提交表单并进行一些断言了。

### 触发复杂事件监听器

事件监听器并不总是简单的 `click` 事件。Vue 允许您监听各种 DOM 事件，添加特殊修饰符如 `.prevent` 等。让我们看看如何测试这些。

在上面的表单中，我们将事件从 `button` 移动到 `form` 元素。这是一个好的实践，因为这样可以通过按 `enter` 键提交表单，这是一种更原生的方式。

要触发 `submit` 处理程序，我们再次使用 `trigger` 方法。

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

要测试事件修饰符，我们直接将事件字符串 `submit.prevent` 复制粘贴到 `trigger` 中。`trigger` 可以读取传递的事件及其所有修饰符，并选择性地应用必要的内容。

::: tip
原生事件修饰符如 `.prevent` 和 `.stop` 是 Vue 特有的，因此我们不需要测试它们，Vue 内部已经对此进行了测试。
:::

然后我们进行简单的断言，检查表单是否发出了正确的事件和载荷。

#### 原生表单提交

在 `<form>` 元素上触发 `submit` 事件模拟了浏览器在表单提交时的行为。如果我们想以更自然的方式触发表单提交，可以触发提交按钮上的 `click` 事件。由于未连接到 `document` 的表单元素无法提交，因此根据 [HTML 规范](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm)，我们需要使用 [`attachTo`](../../api/#attachTo) 将包装器的元素连接起来。

#### 同一事件上的多个修饰符

假设您有一个非常详细和复杂的表单，具有特殊的交互处理。我们该如何测试呢？

```html
<input @keydown.meta.c.exact.prevent="captureCopy" v-model="input" />
```

假设我们有一个输入框，当用户按下 `cmd` + `c` 时处理，并希望拦截并阻止其复制。测试这非常简单，只需将事件从组件复制到 `trigger()` 方法中。

```js
test('handles complex events', async () => {
  const wrapper = mount(Component)

  await wrapper.find(input).trigger('keydown.meta.c.exact.prevent')

  // 运行您的断言
})
```

Vue Test Utils 会读取事件并将适当的属性应用于事件对象。在这种情况下，它将匹配如下内容：

```js
{
  // ... 其他属性
  "key": "c",
  "metaKey": true
}
```

#### 向事件添加额外数据

假设您的代码需要从 `event` 对象中获取一些信息。您可以通过将额外数据作为第二个参数来测试这种情况。

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

在这里，我们假设代码在 `event` 对象内部检查 `relatedTarget` 是否为按钮。我们可以简单地传递对该元素的引用，模拟用户在 `input` 中输入内容后点击 `button` 的情况。

## 与 Vue 组件输入交互

输入不仅仅是普通元素。我们经常使用像输入一样的 Vue 组件。它们可以以易于使用的格式添加标记、样式和许多功能。

测试使用这些输入的表单起初可能会让人感到棘手，但遵循一些简单的规则后，它很快就变得轻松。

以下是一个包装 `label` 和 `input` 元素的组件：

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

这个 Vue 组件也会回显用户输入。使用它的方法如下：

```html
<custom-input v-model="input" label="Text Input" class="text-input" />
```

与普通元素一样，这些 Vue 驱动的输入通常内部都有一个真实的 `button` 或 `input`。您可以轻松找到该元素并对其进行操作：

```js
test('fills in the form', async () => {
  const wrapper = mount(CustomInput)

  await wrapper.find('.text-input input').setValue('text')

  // 继续进行断言或操作，例如提交表单、断言 DOM 等…
})
```

### 测试复杂输入组件

如果您的输入组件不那么简单怎么办？您可能正在使用 UI 库，例如 Vuetify。如果您依赖内部标记以找到正确的元素，那么如果外部库更改其内部结构，您的测试可能会失败。

在这种情况下，您可以直接使用组件实例和 `setValue` 设置值。

假设我们有一个使用 Vuetify 文本区域的表单：

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

我们可以使用 `findComponent` 找到组件实例，然后设置它的值。

```js
test('emits textarea value on submit', async () => {
  const wrapper = mount(CustomTextarea)
  const description = 'Some very long text...'

  await wrapper.findComponent({ ref: 'description' }).setValue(description)

  wrapper.find('form').trigger('submit')

  expect(wrapper.emitted('submitted')[0][0]).toEqual(description)
})
```

## 结论

- 使用 `setValue` 设置 DOM 输入元素和 Vue 组件的值。
- 使用 `trigger` 触发 DOM 事件，包括带有和不带修饰符的事件。
- 使用第二个参数向 `trigger` 添加额外的事件数据。
- 断言 DOM 发生了变化，并且发出了正确的事件。尽量不要对组件实例的数据进行断言。
