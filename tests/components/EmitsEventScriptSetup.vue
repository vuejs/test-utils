<template>
  <button @click="click" />
</template>

<script setup lang="ts">
import { onMounted, defineEmit } from 'vue';

const emit = defineEmit(['bar']);

const click = () => emit('bar', 'click')

onMounted(() => {
  emit('bar', 'mounted')
})
</script>