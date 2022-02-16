<template>
  <component :is="computedProperty" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Hello from './Hello.vue'

const computedProperty = computed(() => Hello)
</script>
