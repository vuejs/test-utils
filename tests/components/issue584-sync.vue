<template>
  <div>
    <span>{{ souscription.reference }}</span>
  </div>
</template>

<script lang='ts'>
import { defineComponent, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useSouscription } from '../composables/useSouscription'

export default defineComponent({
  name: 'Issue584',
  setup(): unknown {
    const route = useRoute()
    const {
      souscription,
      fetchSouscription,
    } = useSouscription()

    onMounted(async () => {
      await fetchSouscription(route.params.id)
    })

    return {
      souscription,
    }
  }
})
</script>

