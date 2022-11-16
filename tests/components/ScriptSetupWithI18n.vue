<script setup lang="ts">
import { ref } from 'vue'
const hello = ref('hello')
</script>

<template>
  <div>{{ hello }}</div>
  <!-- this emulates components that use a global function like $t for i18n -->
  <!-- this function can be mocked using global.mocks -->
  <div>{{ $t('world') }}</div>
</template>
