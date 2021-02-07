<template>
  <teleport to="body">
    <div v-if="isVisible">
      something
      <slot />
    </div>
  </teleport>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'

export default defineComponent({
  name: 'ComponentWithTeleport',

  setup: () => {
    const isVisible = ref(false);
    const toggleVisibility = () => isVisible.value = !isVisible.value;

    return { isVisible, toggleVisibility };
  }
})
</script>
