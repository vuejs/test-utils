<script setup lang="ts">
defineProps<{ title: string }>()
defineModel<number>('count', { required: true })
defineEmits<{ select: [id: number, label: string] }>()
</script>

<template>
  <div>{{ title }}</div>
</template>
