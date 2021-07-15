<template>
  <button @click="click" />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'

export default defineComponent({
  emits: ['bar'],
  setup(props, { emit }) {
    onMounted(() => {
      emit('bar', 'mounted')
    })

    return {
      click: () => emit('bar', 'click')
    }
  }
})
</script>
