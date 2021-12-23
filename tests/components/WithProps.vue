<template>
  <p id="with-props">
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
    },
    withDefaultString: {
      type: String,
      default: 'default-value'
    },
    withDefaultBool: Boolean,
    withDefaultArray: {
      type: Array,
      default: () => ['default-value']
    },
    withDefaultObject: {
      type: Object,
      default: () => ({ obj: 'default' })
    }
  }
})
</script>
