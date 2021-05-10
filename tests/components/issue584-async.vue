<template>
  <div>
    <span>{{ souscription.reference }}</span>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'

import { useSouscription } from '../composables/useSouscription'

export default defineComponent({
  name: 'Issue584-async',
  async setup(): Promise<unknown> {
    const route = useRoute()
    const {
      souscription,
      fetchSouscription
    } = useSouscription()

    await fetchSouscription(route.params.id)

    return {
      souscription
    }
  }
})
</script>

