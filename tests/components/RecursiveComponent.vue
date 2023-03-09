<template>
  <div>
    <Hello />
    <RecursiveComponent v-if="first" />
  </div>
</template>

<script setup lang="ts">
import Hello from './Hello.vue'

defineProps<{
  first?: boolean
}>()
</script>
