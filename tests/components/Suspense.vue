<template>
  <div v-if="error">
    {{ error }}
  </div>
  <Suspense v-else>
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

import { simulateDelay } from '../utils'

const DefaultContent = {
  async setup() {
    await simulateDelay({ delayInMs: 100 })
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
  },

  setup() {
    const error = ref<string | null>(null)
    onErrorCaptured((e) => {
      const err = e as Error
      error.value = err.message
      return true
    })

    return { error }
  }
}
</script>