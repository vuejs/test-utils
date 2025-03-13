<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{ myEvent: ['mount' | 'unmount'] }>()

onMounted(() => {
  emit('myEvent', 'mount')
})

onUnmounted(() => {
  emit('myEvent', 'unmount')
})
</script>

<template>
  <span>child</span>
</template>
