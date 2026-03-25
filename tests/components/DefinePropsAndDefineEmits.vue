<template>
  <div :class="placement">
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  placement: 'start' | 'end' | 'top' | 'bottom'
}>()

defineEmits<{
  (e: 'update', value: string): void
}>()
</script>
