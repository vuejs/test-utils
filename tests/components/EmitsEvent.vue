<template>
  <button @click="greet" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  emits: ['greet'],
  setup(props, { emit }) {
    return {
      greet: () => {
        emit('greet', 'Hey!')
      }
    }
  }
})
</script>
