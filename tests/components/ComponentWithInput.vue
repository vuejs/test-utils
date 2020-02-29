<template>
  <div>
    {{ status }}
    <input type="checkbox" v-model="checked" />
  </div>
</template>

<script lang="ts">
import { defineComponent, h, ref } from 'vue'

export default defineComponent({
  name: 'component-with-input',
  data() {
    return {
      checked: false
    }
  },
  computed: {
    status() {
      return this.checked ? 'checkbox checked' : 'checkbox not checked'
    }
  }
})
</script>
