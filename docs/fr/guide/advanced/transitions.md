# Transitions

En général, vous voudriez tester le DOM affiché après une transition, c'est pourquoi Vue Test Utils simule par défaut `<transition>` et `<transition-group>`.

Voici un composant simple qui passe d'un contenu à un autre avec une transition de fondu&nbsp;:

```vue
<template>
  <button @click="show = !show">Lancer la transition</button>

  <transition name="fade">
    <p v-if="show">Bonjour</p>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

Comme Vue Test Utils substitue les transitions, vous pouvez tester le composant ci-dessus de la même manière que vous testez n'importe quel autre composant&nbsp;:

```js
import Component from './Component.vue'
import { mount } from '@vue/test-utils'

test('fonctionne avec les transitions', async () => {
  const wrapper = mount(Component)

  expect(wrapper.find('Bonjour').exists()).toBe(false)

  await wrapper.find('button').trigger('click')

  // Après avoit cliqué sur le bouton, l'élément `<p>` existe et est visible.
  expect(wrapper.get('p').text()).toEqual('Bonjour')
})
```
