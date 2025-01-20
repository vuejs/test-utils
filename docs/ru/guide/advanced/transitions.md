# Transitions

В общем, вы можете захотеть протестировать свой результат в DOM после перехода, и поэтому Vue Test Utils имитирует `<transition>` и `<transition-group>` по умолчанию.

Ниже приведен простой компонент, который переключает содержимое, обернутое в плавный переход:

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

Поскольку Vue Test Utils ставит заглушку на встроенные переходы, вы можете протестировать компонент выше, как вы бы протестировали любой другой компонент:

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

## Частичная поддержка

Встроенные в Vue Test Utils заглушки перехода являются простыми и не покрывают всех возможностей Vue [Transition](https://vuejs.org/guide/built-ins/transition). Например, [javascript hooks](https://vuejs.org/guide/built-ins/transition#javascript-hooks) не поддерживаются. Это ограничение, возможно, может привести к Vue предупреждениям.


::: tip
Возможные решения:
- Вы можете выключить заглушку по умолчанию, установив [global stubs transition](/ru/api/#global-stubs) в false значение
- Вы можете создать свою собственную заглушку перехода, которая может обработать эти хуки, если необходимо.
- Вы можете отследить предупреждения в тесте и отключить их.
:::
