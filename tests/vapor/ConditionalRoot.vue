<script setup vapor lang="ts">
defineProps<{ show: boolean }>()
const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button v-if="show" @click="emit('select')">select</button>
</template>
