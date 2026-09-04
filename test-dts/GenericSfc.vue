<script setup lang="ts" generic="Item extends string | number">
defineProps<{ items: Item[] }>()
</script>

<template>
  <ul>
    <li v-for="(item, idx) in items" :key="idx">{{ item }}</li>
  </ul>
</template>
