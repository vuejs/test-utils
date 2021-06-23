<template>
  <Teleport to="#modal">
    <Signup />
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Signup from './Signup.vue'

export default defineComponent({
  components: {
    Signup
  }
})
</script>