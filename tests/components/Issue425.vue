<template>
  <div>
    <RouterLink class="link" :to="{ name: name }">
      <slot> A test link </slot>
    </RouterLink>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MyLink',
  props: {
    name: {
      type: String,
      required: true
    }
  }
})
</script>
