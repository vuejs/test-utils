<template>
  <div id="root">
    <div id="msg">{{ msg }}</div>
    <div>{{ other }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Hello',

  setup(props, { expose }) {
    const other = ref('other')
    expose({ other })
    return {
      msg: ref('Hello world'),
      other
    }
  }
})
</script>
