<script>
import { onUnmounted } from 'vue'

export default {
  setup() {
    onUnmounted(() => { console.log('unmounted') })
  },
  data() {
    return {
      message: 'Hello world!'
    }
  }
}
</script>

<template>
  <div>{{ message }} (Options API component with a setup() function that does not return)</div>
</template>
