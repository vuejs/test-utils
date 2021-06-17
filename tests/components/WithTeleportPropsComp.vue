<template>
  <teleport to="#somewhere">
    <with-props msg="hi there" />
  </teleport>
</template>

<script setup lang="ts">
import WithProps from './WithProps.vue'
</script>