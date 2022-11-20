<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return { hello: 'hello' }
  }
})
</script>

<template>
  <div>{{ hello }}</div>
  <!-- this emulates components that use a global function like $t for i18n -->
  <!-- this function can be mocked using global.mocks -->
  <div>{{ $t('world') }}</div>
</template>
