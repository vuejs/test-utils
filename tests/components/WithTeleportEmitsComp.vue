<template>
  <teleport to="#somewhere">
    <emits-event />
    <!-- avoid vue-tsc unknown prop bug for now, issue: https://github.com/vuejs/language-tools/issues/2584 -->
    <!-- <emits-event msg="hi there" /> -->
  </teleport>
</template>

<script setup lang="ts">
import EmitsEvent from './EmitsEvent.vue'
</script>
