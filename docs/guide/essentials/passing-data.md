# Passing Data to Components

Vue Test Utils provides several ways to set data and props on a component, to allow you to fully test the component's behavior in different scenarios.

In this section, we explore the `data` and `props` mounting options, as well as `VueWrapper.setProps()` to dynamically update the props a component receives.

## The Password Component

We will demonstrate the above features by building a `<Password>` component. This component verifies a password means certain criteria, such as length and complexity. We will start with the following and add features, as well as tests to make sure the features are working correctly:

```js
const Password = {
  template: `
    <div>
      <input v-model="password">
    </div>
  `,
  data() {
    return {
      password: ''
    }
  }
}
```

The first requirement we will add is a minimum length.

## Using `props` to set a minimum length

We want to reuse this component in all our projects, each of which may have different requirements. For this reason, we will make the `minLength` a **prop** which we pass to `<Password>`:

We will show an error is `password` is less than `minLength`. We can do this by creating an `error` computed property, and conditionally rendering it using `v-if`:

```js
const Password = {
  template: `
    <div>
      <input v-model="password">
      <div v-if="error">{{ error }}</div>
    </div>
  `,
  props: {
    minLength: {
      type: Number
    }
  },
  computed: {
    error() {
      if (this.password.length < this.minLength) {
        return `Password must be at least ${this.minLength} characters.`
      }
      return
    }
  }
}
```

To test this, we need to set the `minLength`, as well as a `password` that is less than that number. We can do this using the `data` and `props` mounting options. Finally, we will assert the correct error message is rendered:

```js
test('renders an error if length is too short', () => {
  const wrapper = mount(Password, {
    props: {
      minLength: 10
    },
    data() {
      return {
        password: 'short'
      }
    }
  })

  expect(wrapper.html()).toContain('Password must be at least 10 characters')
})
```

Writing a test for a `maxLength` rule is left as an exercise for the reader! Another way to write this would be using `setValue` to update the input with a password that is too short. You can learn more in [Forms]./forms). 

## Using `setProps`

Sometimes you may need to write a test for a side effect of a prop changing. This simple `<Show>` component renders a greeting if the `show` prop is `true`. 

```vue
<template>
  <div v-if="show">{{ greeting }}</div>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      greeting: 'Hello'
    }
  }
}
</script>
```

To test this fully, we might want to verify that `greeting` is rendered by default. We are able to update the `show` prop using `setProps()`, which causes `greeting` to be hidden:

```js
import { mount } from '@vue/test-utils'
import Show from './Show.vue'

test('renders a greeting when show is true', async () => {
  const wrapper = mount(Show)
  expect(wrapper.html()).toContain('Hello')

  await wrapper.setProps({ show: false })

  expect(wrapper.html()).not.toContain('Hello')
})
```

We also use the `await` keyword when calling `setProps()`, to ensure that the DOM has been updated before the assertions run.

## Conclusion

- use the `props` and `data` mounting options to pre-set the state of a component.
- Use `setProps()` to update a prop during a test.
- Use the `await` keyword before `setProps()` to ensure the Vue will update the DOM before the test continues.
- Directly interacting with your component can give you greater coverage. Consider using `setValue` or `trigger` in combination with `data` to ensure everything works correctly.
