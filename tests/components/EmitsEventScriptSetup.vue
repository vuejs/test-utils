<template>
  <button @click="click" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const emit = defineEmits(['bar'])

const click = () => emit('bar', 'click')

onMounted(() => {
  emit('bar', 'mounted')
})
</script>
