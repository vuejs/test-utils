# Testing Teleport

Vue 3 comes with a new built-in component: `<Teleport>`, which allows components to "teleport" their content far outside of their own `<template>`. Most tests written with Vue Test Utils are scoped to the component passed to `mount`, which introduces some complexity when it comes to testing a component that is teleported outside of the component where it is initially rendered.

Here are some strategies and techniques for testing components using `<Teleport>`.

::: tip
If you want to test the rest of your component, ignoring teleport, you can stub `teleport` by passing `teleport: true` in the [global stubs option](../../api/#global-stubs).
:::

## Example

In this example we are testing a `<Navbar>` component. It renders a `<Signup>` component inside of a `<Teleport>`. The `target` prop of `<Teleport>` is an element located outside of the `<Navbar>` component.

This is the `Navbar.vue` component:

```vue
<template>
  <Teleport to="#modal">
    <Signup />
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Signup from './Signup.vue'

export default defineComponent({
  components: {
    Signup
  }
})
</script>
```

It simply teleports a `<Signup>` somewhere else. It's simple for the purpose of this example.

`Signup.vue` is a form that validates if `username` is greater than 8 characters. If it is, when submitted, it emits a `signup` event with the `username` as the payload. Testing that will be our goal.

```vue
<template>
  <div>
    <form @submit.prevent="submit">
      <input v-model="username" />
    </form>
  </div>
</template>

<script>
export default {
  emits: ['signup'],
  data() {
    return {
      username: ''
    }
  },
  computed: {
    error() {
      return this.username.length < 8
    }
  },
  methods: {
    submit() {
      if (!this.error) {
        this.$emit('signup', this.username)
      }
    }
  }
}
</script>
```

## Mounting the Component

Starting with a minimal test:

```ts
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'
import Signup from './Signup.vue'

test('emits a signup event when valid', async () => {
  const wrapper = mount(Navbar)
})
```

Running this test will give you a warning: `[Vue warn]: Failed to locate Teleport target with selector "#modal"`. Let's create it:

```ts {5-15}
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'
import Signup from './Signup.vue'

beforeEach(() => {
  // create teleport target
  const el = document.createElement('div')
  el.id = 'modal'
  document.body.appendChild(el)
})

afterEach(() => {
  // clean up
  document.body.innerHTML = ''
})

test('teleport', async () => {
  const wrapper = mount(Navbar)
})
```

We are using Jest for this example, which does not reset the DOM every test. For this reason, it's good to clean up after each test with `afterEach`.

## Interacting with the Teleported Component

The next thing to do is fill out the username input. Unfortunately, we cannot use `wrapper.find('input')`. Why not? A quick `console.log(wrapper.html())` shows us:

```html
<!--teleport start-->
<!--teleport end-->
```

We see some comments used by Vue to handle `<Teleport>` - but no `<input>`. That's because the `<Signup>` component (and its HTML) are not rendered inside of `<Navbar>` anymore - it was teleported outside.

Although the actual HTML is teleported outside, it turns out the Virtual DOM associated with `<Navbar>` maintains a reference to the original component. This means you can use `getComponent` and `findComponent`, which operate on the Virtual DOM, not the regular DOM.

```ts {12}
beforeEach(() => {
  // ...
})

afterEach(() => {
  // ...
})

test('teleport', async () => {
  const wrapper = mount(Navbar)

  wrapper.getComponent(Signup) // got it!
})
```

`getComponent` returns a `VueWrapper`. Now you can use methods like `get`, `find` and `trigger`.

Let's finish the test:

```ts {4-8}
test('teleport', async () => {
  const wrapper = mount(Navbar)

  const signup = wrapper.getComponent(Signup)
  await signup.get('input').setValue('valid_username')
  await signup.get('form').trigger('submit.prevent')

  expect(signup.emitted().signup[0]).toEqual(['valid_username'])
})
```

It passes!

The full test:

```ts
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'
import Signup from './Signup.vue'

beforeEach(() => {
  // create teleport target
  const el = document.createElement('div')
  el.id = 'modal'
  document.body.appendChild(el)
})

afterEach(() => {
  // clean up
  document.body.innerHTML = ''
})

test('teleport', async () => {
  const wrapper = mount(Navbar)

  const signup = wrapper.getComponent(Signup)
  await signup.get('input').setValue('valid_username')
  await signup.get('form').trigger('submit.prevent')

  expect(signup.emitted().signup[0]).toEqual(['valid_username'])
})
```

You can stub teleport by using `teleport: true`:

```ts
import { mount } from '@vue/test-utils'
import Navbar from './Navbar.vue'

test('teleport', async () => {
  const wrapper = mount(Navbar, {
    global: {
      stubs: {
        teleport: true
      }
    }
  })
})
```

## Conclusion

- Create a teleport target with `document.createElement`.
- Find teleported components using `getComponent` or `findComponent` which operate on the Virtual DOM level.
