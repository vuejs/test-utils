<template>
  <teleport to="#somewhere">
    <emits-event msg="hi there" />
  </teleport>
</template>

<script setup lang="ts">
import EmitsEvent from './EmitsEvent.vue'
</script>