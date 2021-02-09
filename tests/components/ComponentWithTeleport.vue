<template>
  <teleport to="body">
    <div id="decoy">
      <!-- comment node -->
      <button>element</button>
      text
    </div>
    <template v-if="isVisible">
      <div>
        <teleport to="#teleport-target">
          <slot name="nested-teleported-slot"></slot>
        </teleport>
      </div>
      <slot />
    </template>
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
