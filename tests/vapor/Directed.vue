<script setup vapor lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <p v-label:prefix.strong="label"></p>
</template>
