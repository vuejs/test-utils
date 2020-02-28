<template>
  <div>
    <input type="checkbox" v-model="checkboxVal" />
  </div>
</template>

<script lang="ts">
import { defineComponent, h, ref } from 'vue'

export default defineComponent({
  name: 'component-with-input',
  setup() {
    return {
      checkboxVal: ref(false)
    }
  }
  // data() {
  //   return {
  //     checkboxVal: undefined
  //   }
  // },

  // watch: {
  //   checkboxVal() {
  //     this.counter++
  //   }
  // }
})
</script>
