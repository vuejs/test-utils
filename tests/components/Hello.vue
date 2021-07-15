<template>
  <div id="root">
    <div id="msg">
      {{ msg }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Hello',

  setup() {
    return {
      msg: ref('Hello world')
    }
  }
})
</script>
