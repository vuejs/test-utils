<template>
  <p>
    {{ msg }}
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WithProps',

  props: {
    msg: {
      type: String,
      required: false
    }
  }
})
</script>
