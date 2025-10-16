# Transitions

In general, you may want to test the resulting DOM after a transition, and this is why Vue Test Utils mocks `<transition>` and `<transition-group>` by default.

Following is a simple component that toggles a content wrapped in a fading transition:

```vue
<template>
  <button @click="show = !show">Toggle</button>

  <transition name="fade">
    <p v-if="show">hello</p>
  </transition>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const show = ref(false)

    return {
      show
    }
  }
}
</script>

<style lang="css">
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

Since Vue Test Utils stubs built-in transitions, you can test the component above as you'd test any other component:

```js
import Component from './Component.vue'
import { mount } from '@vue/test-utils'

test('works with transitions', async () => {
  const wrapper = mount(Component)

  expect(wrapper.find('hello').exists()).toBe(false)

  await wrapper.find('button').trigger('click')

  // After clicking the button, the <p> element exists and is visible
  expect(wrapper.get('p').text()).toEqual('hello')
})
```

## Partial support

The Vue Test Utils built-in transition stub is simple and doesn't cover all of Vue's [Transition features](https://vuejs.org/guide/built-ins/transition). For instance [javascript hooks](https://vuejs.org/guide/built-ins/transition#javascript-hooks) are not supported. This limitation could potentially lead to Vue warnings.

::: tip
Potential solutions:
- You can turn off the auto stubbing by setting [global stubs transition](../../api/#global-stubs) to false
- You can create your own transition stub that can handle these hooks if necessary.
- You can spy the warning in the test to silence it.
:::

If you do turn off auto stubbing, note that you might also need to mock `requestAnimationFrame` to ensure that the javascript hooks fire properly:

```js
vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
```
