<template>
  <Suspense>
    <template #default>
      <DefaultContent />
    </template>
    <template #fallback>
      <FallbackContent />
    </template>
  </Suspense>  
</template>

<script lang="ts">
import { h, onErrorCaptured, ref } from 'vue'

const simulateDelay = () => new Promise(res => {
  setTimeout(res, 100)
})
const DefaultContent = {
  async setup() {
    await simulateDelay()
    return {}
  },
  render() { return h('div', 'Default content') }
}
const FallbackContent = {
  render() { return h('div', 'Fallback content') }
}

export default {
  components: {
    DefaultContent,
    FallbackContent
  }
}
</script>