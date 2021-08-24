<template>
  <div v-if="hasContent">
    <div id="contentInfo" />
  </div>

  <div v-else>
    <div id="noContent" />
  </div>
</template>

<script setup>
import { ref, watchEffect, inject } from 'vue'

const type = inject('someType')
const hasContent = ref(false)

watchEffect(() => {
  if (type === 'content') {
    hasContent.value = true
  }
})
</script>
